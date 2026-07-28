const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = 'http://localhost:8123';

// seed the mock store from the app's own seed function
async function seedStore(page) {
  const data = await page.evaluate(() => JSON.parse(JSON.stringify(window.__seedForTest)));
  await fetch(BASE + '/__seed', { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ id:'cohens', data }) });
}

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport:{width:430,height:1000} });
  const errs = [];

  // grab a seed payload from the demo build
  const boot = await ctx.newPage();
  boot.on('pageerror', e=>errs.push('boot '+e.message));
  await boot.goto(BASE + '/', { waitUntil:'networkidle' });
  const seed = await boot.evaluate(() => {
    // reach the seed by running the app's own reset in demo mode
    document.querySelector('#demo-fab').click();
    return null;
  });
  await boot.close();

  // simpler: seed from a hand-made minimal train
  const data = {
    train: { recipientFamily:'the Cohens', title:'Meals for the Cohens', occasion:'new-baby',
      start:'2026-08-02', end:'2026-08-08', household:5, householdNote:'two little ones',
      address:'418 Marion Street', dropoff:'Ring once.', kosherLevel:'Keeps kosher',
      hechshers:'OU fine', allergies:['no-nuts'], allergyNote:'Real allergy.', dislikes:['mushrooms'],
      loves:['chicken soup'], showDishes:true, wrapped:false, paused:false,
      planner:'Rivky Weiss', plannerPhone:'15550142288', peopleReached:23, ringBell:true },
    days: [
      { id:'d1', iso:'2026-08-04', needed:true, kosher:'dairy', from:'4:30', to:'6:00', candle:null,
        slots:[{ id:'s1', filled:false }] },
      { id:'d2', iso:'2026-08-05', needed:true, kosher:'any', from:'4:30', to:'6:00', candle:null,
        slots:[{ id:'s2', filled:false }] }
    ],
    contacts: [], messages: [], cook: { goTo: [] }
  };
  await fetch(BASE + '/__seed', { method:'POST', headers:{'content-type':'application/json'},
    body: JSON.stringify({ id:'cohens', data }) });

  const open = async () => {
    const p = await ctx.newPage();
    p.on('pageerror', e=>errs.push(e.message));
    p.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
    await p.goto(BASE + '/?t=cohens', { waitUntil:'networkidle' });
    await p.waitForTimeout(700);
    return p;
  };

  // ---- 1. loads from the backend, skipping setup -------------------------
  const A = await open();
  console.log('A opens straight on the board:', await A.getAttribute('#surface-board','data-pos'));
  console.log('A sees the real train:', (await A.textContent('#surface-board')).includes('Meals for the Cohens'));

  // ---- 2. a claim persists ------------------------------------------------
  await (await A.$$('#surface-board button:has-text("I\'ll cook")'))[0].click();
  await A.waitForTimeout(400);
  await A.fill('#claim-dish','Lasagna');
  await A.fill('#claim-name','Chani Gold');
  await A.fill('#claim-contact','(555) 014-7788'); await A.fill('#claim-email', 'test@example.com');
  await A.click('[data-act="submit-claim"]'); await A.waitForTimeout(900);
  const stats1 = await (await fetch(BASE+'/__stats')).json();
  console.log('claim written to backend:', stats1.writes >= 1);

  // ---- 3. survives a reload ----------------------------------------------
  await A.reload({ waitUntil:'networkidle' }); await A.waitForTimeout(900);
  console.log('survives reload:', (await A.textContent('#surface-board')).includes('Lasagna'));

  // ---- 4. a second person sees it, without touching anything -------------
  const B = await open();
  console.log('B sees A\'s claim:', (await B.textContent('#surface-board')).includes('Lasagna'));

  // ---- 5. B claims; A picks it up by polling within a few seconds --------
  await (await B.$$('#surface-board button:has-text("I\'ll cook")'))[0].click();
  await B.waitForTimeout(400);
  await B.fill('#claim-dish','Roast chicken');
  await B.fill('#claim-name','Bracha Levi');
  await B.fill('#claim-contact','(555) 014-3311'); await B.fill('#claim-email', 'test@example.com');
  await B.click('[data-act="submit-claim"]'); await B.waitForTimeout(600);
  if (await B.isVisible('[data-act="force-claim"]')) { await B.click('[data-act="force-claim"]'); await B.waitForTimeout(600); }

  let sawIt = false;
  for (let i=0;i<14;i++) {
    await A.waitForTimeout(1000);
    if ((await A.textContent('#surface-board')).includes('Roast chicken')) { sawIt = true;
      console.log(`A picked up B's change by polling: true (after ~${i+1}s)`); break; }
  }
  if (!sawIt) console.log("A picked up B's change by polling: FALSE");

  console.log('\nerrors:', errs.length); errs.slice(0,4).forEach(e=>console.log('  '+e));
  await b.close();
})().catch(e=>{ console.error('FATAL', e.message); process.exit(1); });
