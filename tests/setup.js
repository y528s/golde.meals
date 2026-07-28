/* The conversation that creates a train — the one part of the product that
   really does run on WhatsApp, because the planner messages her first and that
   opens the free-form reply window. Driven by step name, so reordering the
   questions no longer breaks it. */
const { chromium } = require('playwright-core');
const { walk } = require('./setup-helper');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  console.log('opens on setup:', await p.getAttribute('#surface-setup','data-pos'));
  console.log('labelled honestly:', (await p.textContent('.viewing-as')).trim(), '\n');

  await walk(p, {
    start: 0, family: 'The Cohen family', occasion: 0, length: 0, cadence: 0,
    adults: 1, teens: 0, littles: 2,
    headNote: 'and a new baby who is not eating yet',
    allergies: 0, otherAllergies: null, address: null
  }, (step, said) => console.log('  ' + step.padEnd(15) + said.slice(0, 76)));

  console.log('\nhands over a link:', await p.isVisible('#setup-scroll .linkcard'));
  await p.screenshot({ path: __dirname + '/../screenshots/setup-done.png' });
  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(800);
  console.log('lands on the board:', await p.getAttribute('#surface-board','data-pos'));
  const bt = await p.textContent('#surface-board');
  console.log('  train is named:', bt.includes('Meals for The Cohen family'));
  console.log('  role is planner:', (await p.textContent('.viewing-as')).includes('Planner'));

  /* "My mum" is a relationship, not a name. She should notice, and ask once. */
  await p.click('#demo-fab'); await p.waitForTimeout(300);
  await p.click('[data-act="restart-setup"]'); await p.waitForTimeout(400);
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);
  await p.fill('#setup-field','my mum'); await p.press('#setup-field','Enter');
  await p.waitForTimeout(400);
  const last = async () => (await p.$$eval('#setup-scroll .wa-row.in .wa-bubble', e=>e.map(x=>x.innerText))).pop();
  console.log('\n"my mum" ->', (await last()).replace(/\n+/g,' ').slice(0,120));
  console.log('  still on the same question:', (await p.getAttribute('.wa-actions','data-step')) === 'family');

  await p.fill('#setup-field','Yaya'); await p.press('#setup-field','Enter');
  await p.waitForTimeout(400);
  console.log('  accepts "Yaya" without arguing:', (await p.getAttribute('.wa-actions','data-step')) === 'occasion');

  await p.click('[data-act="setup-chip"][data-i="1"]'); await p.waitForTimeout(400);
  console.log('\nshiva opener:', (await last()).replace(/\n+/g,' ').slice(0,80));

  console.log('\nerrors:', errs.length); errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
