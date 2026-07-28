/* The calendar must do two things: show the parsha and fast days when we have
   verified data, and say absolutely nothing when we don't. The second is the
   one that matters — a wrong parsha reads as an outsider guessing. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

/* A FIXTURE, not shipped data. Real dates come from hebcal via
   tools/fetch-calendar.js; these exist only to prove the wiring. */
const FIXTURE = {
  '2026-08-07': { parsha: 'Eikev', candles: '7:52' },
  '2026-08-06': { fast: 'Tish\'a B\'Av' },
  '2026-08-05': { yomtov: 'Sukkos' }
};

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  const board = async () => {
    if (await p.getAttribute('#surface-board', 'data-pos') !== 'on') {
      await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);
    }
  };

  /* --- 1. with no calendar data at all ------------------------------------ */
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.click('[data-act="skip-setup"]'); await p.waitForTimeout(400);
  await board();
  /* Every night that wants something is on the page; the rest is one tap. */
  await p.click('[data-act="toggle-settled"]').catch(() => {}); await p.waitForTimeout(400);
  const bare = await p.textContent('#board-scroll');
  console.log('WITHOUT DATA');
  console.log('  invents no parsha:', !/Parshas/i.test(bare));
  console.log('  still shows the hand-typed candle time:', /7:52/.test(bare));
  console.log('  board renders fine:', /Friday/.test(bare));

  /* --- 2. with verified data loaded --------------------------------------- */
  await p.evaluate(f => {
    window.goldeCalendar.load(f, '2026-08-01', '2026-08-31');
  }, FIXTURE);
  await p.evaluate(() => document.querySelector('[data-act="toggle-settled"]').click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-act="toggle-settled"]').click());
  await p.waitForTimeout(400);
  const withData = await p.textContent('#board-scroll');
  console.log('\nWITH VERIFIED DATA');
  console.log('  names the parsha:', /Parshas Eikev/.test(withData));
  console.log('  candle time from the calendar:', /Candles at 7:52/.test(withData));
  await p.screenshot({ path: __dirname + '/../screenshots/calendar.png' });

  /* --- 3. what she says about a fast and a chag --------------------------- */
  const said = await p.evaluate(() => ({
    fast: window.goldeCalendar.noteFor('2026-08-06'),
    chag: window.goldeCalendar.noteFor('2026-08-05'),
    unknown: window.goldeCalendar.noteFor('2027-03-01')
  }));
  console.log('\n  fast day: ' + said.fast);
  console.log('  yom tov:  ' + said.chag);
  console.log('  outside the verified window returns null:', said.unknown === null);

  console.log('\nerrors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
