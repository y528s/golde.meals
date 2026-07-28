/* Friday night and Shabbat lunch are not "dinner". Around here a family is fed
   by eight people rather than one — somebody brings the soup, somebody bakes the
   challah — so those two days come up as a table of courses and every other day
   stays one slot. The planner turns any of them off.

   The assertion that matters most is the last one: a course somebody has already
   agreed to bring cannot be silently switched off. */
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

  await walk(p, { start: 0, family: 'The Cohen family', occasion: 0, length: 1, cadence: 1,
    adults: 1, teens: 0, littles: 1, headNote: null,
    allergies: 0, otherAllergies: null, address: '418 Marion Street' });
  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(700);
  await p.click('[data-filter="all"]').catch(() => {}); await p.waitForTimeout(400);

  const perDay = await p.$$eval('.daycard', cards => cards.map(c => ({
    day: (c.querySelector('.dc-day') || {}).textContent,
    courses: [...c.querySelectorAll('.slot-course')].map(x => x.textContent.trim())
  })));

  console.log('WHAT EACH NIGHT ASKS FOR');
  perDay.forEach(d => console.log(`  ${(d.day || '?').padEnd(10)} ${
    d.courses.length ? d.courses.join(' · ') : 'one person, one dinner'}`));

  const fri = perDay.filter(d => d.day === 'Friday')[0] || { courses: [] };
  const shab = perDay.filter(d => d.day === 'Shabbat')[0] || { courses: [] };
  const weekday = perDay.filter(d => d.day === 'Tuesday')[0] || { courses: [] };

  console.log('\n  Friday night is a whole meal:', fri.courses.length === 8);
  console.log('  and it asks for challah:', fri.courses.includes('Challah'));
  console.log('  and soup:', fri.courses.includes('Soup'));
  console.log('  and wine:', fri.courses.includes('Wine or grape juice'));
  console.log('  Shabbat lunch is shorter — no soup:',
    shab.courses.length === 7 && !shab.courses.includes('Soup'));
  console.log('  a weeknight is still one dinner:', weekday.courses.length === 0);

  /* A sender sees eight buttons on Friday, and "I'll cook Friday" on all eight
     would be useless — each must name its own course. */
  await p.click('#demo-fab'); await p.waitForTimeout(300);
  await p.click('[data-act="set-role"][data-role="sender"]'); await p.waitForTimeout(400);
  await p.click('[data-act="close-sheet"]').catch(() => {}); await p.waitForTimeout(400);
  const friBtns = await p.$$eval('.daycard', cards => {
    const c = [...cards].find(x => (x.querySelector('.dc-day') || {}).textContent === 'Friday');
    return c ? [...c.querySelectorAll('[data-act="claim"]')].map(b => b.textContent.trim()) : [];
  });
  console.log('  each slot names its own course, not the day:',
    friBtns.length === 8 && !friBtns.some(t => /Friday/.test(t)));
  console.log('    ' + friBtns.slice(0, 4).join(' | '));

  await p.click('#demo-fab'); await p.waitForTimeout(300);
  await p.click('[data-act="set-role"][data-role="planner"]'); await p.waitForTimeout(400);
  await p.click('[data-act="close-sheet"]').catch(() => {}); await p.waitForTimeout(400);

  console.log('\nTHE PLANNER CHANGES THE MENU');
  const openFriday = () => p.evaluate(() => {
    const c = [...document.querySelectorAll('.daycard')]
      .find(x => (x.querySelector('.dc-day') || {}).textContent === 'Friday');
    c.querySelector('[data-act="edit-day"]').click();
  });
  await openFriday(); await p.waitForTimeout(500);
  const chips = await p.$$eval('[data-act="toggle-course"]', e => e.map(x => x.textContent.trim()));
  console.log('  courses offered: ' + chips.join(', '));
  console.log('  and three presets:',
    (await p.$$('[data-act="course-preset"]')).length === 3);
  await p.click('[data-act="toggle-course"][data-c="apps"]'); await p.waitForTimeout(400);
  console.log('  turning one off leaves the rest:',
    (await p.$$('[data-act="toggle-course"][aria-pressed="true"]')).length === 7);
  await p.click('[data-act="close-sheet"]').catch(() => {}); await p.waitForTimeout(400);

  console.log('\nA COURSE SOMEBODY IS BRINGING CANNOT VANISH');
  /* Take the soup on Friday, then try to switch soup off. */
  await p.$eval('#board-scroll', e => { e.scrollTop = 0; });
  const took = await p.evaluate(() => {
    const card = [...document.querySelectorAll('.daycard')]
      .find(c => (c.querySelector('.dc-day') || {}).textContent === 'Friday');
    if (!card) return false;
    const slot = [...card.querySelectorAll('.slot')]
      .find(s => (s.querySelector('.slot-course') || {}).textContent === 'Soup');
    if (!slot) return false;
    slot.querySelector('[data-act="claim"]').click();
    return true;
  });
  console.log('  found the soup slot:', took);
  await p.waitForTimeout(500);
  await p.fill('#claim-dish', 'Chicken soup with kneidlach');
  await p.fill('#claim-name', 'Bracha Levi');
  await p.fill('#claim-contact', '+972 50 000 0000'); await p.fill('#claim-email', 'test@example.com');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(900);

  await openFriday(); await p.waitForTimeout(500);
  const before = (await p.$$('[data-act="toggle-course"][aria-pressed="true"]')).length;
  await p.click('[data-act="toggle-course"][data-c="soup"]'); await p.waitForTimeout(500);
  const after = (await p.$$('[data-act="toggle-course"][aria-pressed="true"]')).length;
  console.log('  turning off a course somebody took is refused:', before === after);
  console.log('  and she says why:',
    /spoken for/i.test(await p.textContent('body')));

  await p.screenshot({ path: __dirname + '/../screenshots/shabbat-courses.png', fullPage: true });
  console.log('\nerrors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
