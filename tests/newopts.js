/* The options a real planner asked for: every other day, three headcount bands,
   "None" first among allergies, and a free-text field for the rest — which has
   to actually fire the check, or it is worse than not being there. */
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

  const chips = async () => (await p.$$eval('[data-act="setup-chip"]', e => e.map(x => x.textContent.trim()))).join(' | ');
  const seen = {};

  await walk(p, {
    start: 0, family: 'The Stern family', occasion: 0, length: 0,
    cadence: 0,            // every other day
    adults: 1, teens: 1, littles: 2,
    headNote: null,
    allergies: 1,          // nuts — index 1 proves None is index 0
    otherAllergies: 'dairy, strawberries',
    address: null
  }, async (step, said) => { seen[step] = said; });

  console.log('SETUP ASKED:');
  for (const k of ['cadence','adults','teens','littles','allergies','otherAllergies']) {
    if (seen[k]) console.log('  ' + k.padEnd(15) + seen[k].replace(/\n+/g,' ').slice(0, 74));
  }

  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(800);

  await p.click('[data-filter="glance"]'); await p.waitForTimeout(400);
  console.log('\nEVERY OTHER DAY:');
  (await p.$$eval('.glance', e => e.map(x => x.innerText.replace(/\n/g,'  ')))).forEach(r => console.log('  ' + r));

  await p.click('[data-filter="open"]'); await p.waitForTimeout(350);
  await p.click('[data-act="toggle-details"]').catch(() => {});
  await p.waitForTimeout(300);
  const bt = await p.textContent('#board-scroll');
  console.log('\nheadcount in three bands:', /2 adults, 1 teenager and 2 little ones/.test(bt));
  console.log('free-text allergies shown:', bt.includes('no dairy') && bt.includes('no strawberries'));

  /* The field is only worth having if it stops somebody. */
  await p.click('#surface-board .daycard [data-act="claim"]'); await p.waitForTimeout(400);
  await p.fill('#claim-dish','Creamy strawberry trifle');
  await p.fill('#claim-name','Test'); await p.fill('#claim-contact','(555) 014-0000'); await p.fill('#claim-email', 'test@example.com');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(500);
  const body = await p.textContent('.sheet-body');
  console.log('\nfree-text allergen FIRES:', /strawberr/i.test(body));
  console.log('  ->', body.split('Want to rethink')[0].trim().slice(0, 120));

  console.log('\nerrors:', errs.length); errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
