/* Reproduces exactly what a tester hit: "I chose every other day, but if I
   wanted to slot another day in, I don't see how." The skipped days were hidden
   in the default view, so the complaint was literally true — there was nothing
   on screen to tap. Also checks the children's ages reach the cook. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });

  const chip = async i => { await p.click(`[data-act="setup-chip"][data-i="${i}"]`); await p.waitForTimeout(280); };
  const type = async v => { await p.fill('#setup-field', v); await p.press('#setup-field', 'Enter'); await p.waitForTimeout(280); };
  const skip = async () => { await p.click('[data-act="setup-skip"]'); await p.waitForTimeout(300); };

  await chip(0);                    // I need a meal train
  await type('The Osman family');
  await chip(0);                    // a baby
  await chip(0);                    // a week
  await chip(0);                    // EVERY OTHER DAY
  await chip(1);                    // 2 adults
  await chip(2);                    // 2 children
  await type('5 and 14');           // their ages
  await chip(0);                    // no allergies
  await skip();                     // nothing else
  await skip();                     // address later
  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(800);

  console.log('DEFAULT VIEW — what she was looking at:');
  const addRows = await p.$$('#surface-board .add-day');
  console.log('  skipped days visible and tappable:', addRows.length, '(was 0 — that was the bug)');
  console.log('  and she is told:', (await p.textContent('#surface-board')).includes('tap it to slot it back in'));
  await p.screenshot({ path: __dirname + '/../screenshots/add-a-day.png' });

  const before = (await p.$$('#surface-board [data-act="claim"]')).length;
  await addRows[0].click(); await p.waitForTimeout(500);
  const after = (await p.$$('#surface-board [data-act="claim"]')).length;
  console.log('  tapping one adds a night:', after === before + 1, `(${before} -> ${after})`);

  await p.click('[data-filter="glance"]'); await p.waitForTimeout(400);
  console.log('  addable from the glance view too:', (await p.$$('.glance.addable')).length > 0);
  (await p.$$eval('.glance', e => e.map(x => x.innerText.replace(/\n/g, '  ')))).forEach(r => console.log('    ' + r));

  await p.click('[data-filter="open"]'); await p.waitForTimeout(350);
  await p.click('[data-act="toggle-details"]').catch(() => {}); await p.waitForTimeout(300);
  const bt = await p.textContent('#board-scroll');
  console.log("\n  children's ages reach the cook:", /2 children \(5 and 14\)/.test(bt));

  console.log('errors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
