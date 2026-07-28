/* Two things asked for directly: adding several people at once, and a train with
   no end date.

   The important assertion in the first half is the one about opt-in. Bulk-adding
   twenty numbers is exactly how a WhatsApp business number gets itself banned,
   so imported people must land on the planner's list and NOT on Golde's writing
   list. If that ever flips, this test is the thing that notices. */
const { chromium } = require('playwright-core');
const { walk } = require('./setup-helper');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });

  console.log('A TRAIN WITH NO END DATE');
  await walk(p, { start: 0, family: 'The Osman family', occasion: 4, length: 5, cadence: 1,
    adults: 1, teens: 0, littles: 1, headNote: null,
    allergies: 0, otherAllergies: null, address: '12 Ashworth Road' },
    (step, said) => { if (['occasion','length','cadence'].includes(step)) console.log(`  [${step}] ${said}`); });
  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(700);

  const dates = await p.textContent('.board-dates');
  console.log('  header: ' + dates.trim());
  console.log('  no invented end date:', /until you say stop/.test(dates));
  console.log('  and miluim is on it:', /miluim/.test(dates));

  const before = (await p.$$('#surface-board .daycard, #surface-board .compact-day')).length;
  await p.click('[data-act="toggle-train"]'); await p.waitForTimeout(400);
  console.log('  she offers another week:', await p.isVisible('[data-act="extend-week"]'));
  await p.click('[data-act="extend-week"]'); await p.waitForTimeout(600);
  const after = (await p.$$('#surface-board .daycard, #surface-board .compact-day')).length;
  console.log(`  tapping it adds seven days: ${after === before + 7} (${before} -> ${after})`);

  console.log('\nADDING SEVERAL PEOPLE AT ONCE');
  await p.$eval('[data-act="add-people"]', e => e.click()); await p.waitForTimeout(500);
  console.log('  ' + (await p.textContent('.sheet-body .golde-note')).replace('golde.', '').trim());
  await p.fill('#bulk-people',
    'Faigy Berkowitz\nChani Gold, +972 50 000 0000\nMrs Klein\n\nFaigy Berkowitz');
  await p.click('[data-act="save-people"]'); await p.waitForTimeout(600);

  const names = await p.$$eval('.contact-name', e => e.map(x => x.textContent.trim()));
  console.log('  on the list now: ' + names.join(', '));
  console.log('  duplicates ignored:', names.filter(n => /Faigy Berkowitz/.test(n)).length === 1);
  console.log('  the number survived as typed:',
    /\+972 50 000 0000/.test(await p.textContent('#surface-board')));

  /* The one that matters. */
  const optedIn = await p.evaluate(() => {
    const el = document.querySelector('#surface-board');
    return el.innerText;
  });
  console.log('  and she says she will not write to them:',
    /hasn't said I may write|haven't said I may write/.test(optedIn));

  await p.screenshot({ path: __dirname + '/../screenshots/add-people.png' });

  console.log('\nerrors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
