/* The second kind of thing she can organise. A meal train is many nights for one
   household; a potluck is one sitting that many households bring to. Different
   shape, same platform — this walks the whole potluck path and checks that none
   of the meal-train furniture leaked through (no week of day cards, no
   "Recipient" role, no offer to send a gift card to a table you're sitting at). */
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

  console.log('THE FIRST QUESTION — both answers say who is doing the setting up:');
  await p.click('[data-act="cover-plan"]'); await p.waitForTimeout(400);
  const first = await p.$$eval('[data-act="setup-chip"]', e => e.map(x => x.textContent.trim()));
  first.forEach(c => console.log('    ' + c));
  console.log('  no ambiguous "I need a meal train":', !first.some(c => /^I need/.test(c)));

  console.log('\nSHE WALKS THE POTLUCK:');
  await walk(p, {
    start: 1, host: 'the Bergers', gathering: 0, when: 2,
    adults: 3, teens: 0, littles: 2, crowd: 0, pets: 1,
    headNote: null, allergies: 1, otherAllergies: null, spread: 0, address: '12 Ashworth Road'
  }, (step, said) => console.log(`  [${step}] ${said}`));

  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(700);

  const head = await p.textContent('.board-h1');
  const dates = await p.textContent('.board-dates');
  console.log('\nTHE BOARD');
  console.log('  ' + head.trim());
  console.log('  ' + dates.trim());
  console.log('  one sitting, not a week:', !/through/.test(dates));

  const tags = await p.$$eval('.tagrow .tag', e => e.map(x => x.textContent.trim()));
  console.log('  what people would otherwise text to ask: ' + tags.join(' | '));

  const courses = await p.$$eval('.course', e => e.map(x => x.innerText.replace(/\n/g, ' · ')));
  console.log(`  ${courses.length} things to bring:`);
  courses.forEach(c => console.log('    ' + c));
  console.log('  no day cards left over:', (await p.$$('.daycard')).length === 0);

  console.log('\nTHE HOST CHANGES HER MIND');
  await p.click('[data-act="toggle-crowd"]'); await p.waitForTimeout(300);
  await p.click('[data-act="cycle-pets"]'); await p.waitForTimeout(300);
  console.log('  ' + (await p.$$eval('.tagrow .tag', e => e.map(x => x.textContent.trim()))).join(' | '));

  console.log('\nSOMEBODY TAKES ONE');
  await p.click('[data-act="open-sheet"][data-sheet="demo"], .demo-fab').catch(() => {});
  await p.waitForTimeout(400);
  const roles = await p.$$eval('.role-card b', e => e.map(x => x.textContent.trim()));
  console.log('  roles offered: ' + roles.join(', '));
  console.log('  no phantom recipient:', roles.length === 2);
  await p.click('.role-card[data-role="neighbor"]'); await p.waitForTimeout(500);
  await p.click('[data-act="close-sheet"]').catch(() => {}); await p.waitForTimeout(400);

  await (await p.$$('.course.open [data-act="claim"]'))[0].click(); await p.waitForTimeout(500);
  console.log('  sheet says: ' + (await p.textContent('.sheet-head')).trim());
  console.log('  no gift-card option at a table you are sitting at:',
    !(await p.isVisible('[data-act="set-mode"][data-mode="nocook"]')));
  console.log('  she says: ' + (await p.textContent('.sheet-body .golde-note')).replace('golde.', '').trim());

  await p.fill('#claim-dish', 'A big tray of chicken and potatoes');
  await p.fill('#claim-name', 'Chani Gold');
  await p.fill('#claim-contact', '(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(900);

  const bt = await p.textContent('#board-scroll');
  console.log('\n  it landed on the board:', /chicken and potatoes/.test(bt));
  console.log('  and she is told where and when:', /Ashworth/.test(bt));
  await p.screenshot({ path: __dirname + '/../screenshots/potluck.png', fullPage: false });

  console.log('\nTHE ALLERGY CHECK STILL WORKS HERE');
  /* The floating demo button parks itself over the bottom rows, so open the
     sheet the way the app does rather than fighting an overlay. */
  await p.$eval('.course.open [data-act="claim"]', e => e.click()); await p.waitForTimeout(500);
  await p.fill('#claim-dish', 'Peanut butter cookies'); await p.waitForTimeout(500);
  console.log('  ' + (await p.textContent('#live-hint')).trim());
  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);

  console.log('\nerrors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
