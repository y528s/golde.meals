const { chromium } = require('playwright-core');
const BASE = 'http://localhost:8123';

const DATA = {
  train: { recipientFamily:'the Cohens', title:'Meals for the Cohens', occasion:'new-baby',
    start:'2026-08-02', end:'2026-08-08', household:5, householdNote:'two little ones',
    address:'418 Marion Street', dropoff:'Ring once.', kosherLevel:'Keeps kosher', hechshers:'OU',
    allergies:['no-nuts'], allergyNote:'Real allergy.', dislikes:[], loves:[], showDishes:true,
    wrapped:false, paused:false, planner:'Rivky Weiss', plannerPhone:'15550142288',
    peopleReached:23, ringBell:true },
  days: [{ id:'d1', iso:'2026-08-04', needed:true, kosher:'any', from:'4:30', to:'6:00',
           candle:null, slots:[{ id:'s1', filled:false }] }],
  contacts: [], messages: [], cook: { goTo: [] }
};

(async () => {
  await fetch(BASE+'/__seed', {method:'POST',headers:{'content-type':'application/json'},
    body: JSON.stringify({id:'race', data: DATA})});

  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport:{width:430,height:1000} });
  const errs = [];

  const open = async () => { const p = await ctx.newPage();
    p.on('pageerror',e=>errs.push(e.message));
    await p.goto(BASE+'/?t=race',{waitUntil:'networkidle'}); await p.waitForTimeout(700);
    // stop polling so both tabs stay on the same stale version, which is the race
    await p.evaluate(() => window.goldeSync.stop());
    return p; };

  const A = await open(), B = await open();
  console.log('both on version:', await A.evaluate(()=>window.goldeSync.version),
                                  await B.evaluate(()=>window.goldeSync.version));

  const fill = async (p, dish, who, phone) => {
    await (await p.$$('#surface-board button:has-text("I\'ll cook")'))[0].click();
    await p.waitForTimeout(350);
    await p.fill('#claim-dish', dish); await p.fill('#claim-name', who);
    await p.fill('#claim-contact', phone);
  };
  await fill(A,'Lasagna','Chani Gold','(555) 014-7788');
  await fill(B,'Cholent','Bracha Levi','(555) 014-3311');

  // both submit at the same instant
  await Promise.all([
    A.click('[data-act="submit-claim"]'),
    B.click('[data-act="submit-claim"]')
  ]);
  await A.waitForTimeout(1800); await B.waitForTimeout(1800);

  const stats = await (await fetch(BASE+'/__stats')).json();
  console.log('\nbackend accepted writes:', stats.writes, ' rejected as conflict:', stats.conflicts);

  const truth = await (await fetch(BASE+'/api/trains/race')).json();
  const slot = truth.data.days[0].slots[0];
  console.log('the night belongs to exactly one person:', slot.filled === true, '->', slot.by, '/', slot.dish);

  const tA = await A.textContent('#surface-board');
  const tB = await B.textContent('#surface-board');
  const bothAgree = tA.includes(slot.dish) && tB.includes(slot.dish);
  const neitherShowsGhost = !(tA.includes('Lasagna') && tA.includes('Cholent'));
  console.log('both screens now show the same truth:', bothAgree);
  console.log('no ghost double-booking on screen:', neitherShowsGhost);

  const toastA = await A.textContent('.toast').catch(()=>'');
  const toastB = await B.textContent('.toast').catch(()=>'');
  const msg = (toastA + toastB).trim();
  console.log('loser was told, in her voice:', JSON.stringify(msg.slice(0,90)));
  console.log('  (not an error message):', !/error|invalid|failed|conflict/i.test(msg));

  console.log('\nerrors:', errs.length); errs.slice(0,3).forEach(e=>console.log('  '+e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
