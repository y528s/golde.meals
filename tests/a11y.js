/* Built for people who "can barely use their email", per a tester. Two things
   that decide whether an older user can actually operate this: is the text big
   enough to read, and is the target big enough to hit. Both are measurable, so
   they are measured rather than eyeballed.

   Thresholds: 44x44px targets (Apple's HIG and WCAG 2.5.5 both land there) and
   no interactive or body text below 15px. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const MIN_TARGET = 44;
const MIN_TEXT = 15;

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));

  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.click('[data-act="skip-setup"]'); await p.waitForTimeout(500);

  const audit = async (where) => p.evaluate(({ MIN_TARGET, MIN_TEXT, where }) => {
    /* The demo control is scaffolding a tester sees once and no real user ever
       sees at all, so it is excluded rather than inflated to look compliant. */
    const chrome = el => el.closest('.viewing-as, .demo-fab, .statusbar, .phone-caption');
    const vis = el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' &&
             el.closest('[data-pos="on"], .sheet-host:not([hidden])');
    };
    const small = [], tiny = [];
    for (const el of document.querySelectorAll('button, a, input, select, textarea')) {
      if (!vis(el) || chrome(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < MIN_TARGET || r.width < 24) {
        small.push({ t: (el.textContent || el.placeholder || el.className).trim().slice(0, 34),
                     h: Math.round(r.height), w: Math.round(r.width) });
      }
    }
    for (const el of document.querySelectorAll('p, span, div, label, li, dt, dd, button')) {
      if (!vis(el) || chrome(el) || !el.childNodes.length) continue;
      const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 3);
      if (!own) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px < MIN_TEXT) tiny.push({ t: el.textContent.trim().slice(0, 34), px: px.toFixed(1) });
    }
    return { where, small, tiny };
  }, { MIN_TARGET, MIN_TEXT, where });

  const report = r => {
    console.log(`\n${r.where}`);
    console.log(`  targets under ${MIN_TARGET}px tall: ${r.small.length}`);
    r.small.slice(0, 6).forEach(x => console.log(`      ${x.h}x${x.w}  ${x.t}`));
    console.log(`  text under ${MIN_TEXT}px: ${r.tiny.length}`);
    const seen = new Set();
    r.tiny.filter(x => !seen.has(x.px) && seen.add(x.px)).slice(0, 6)
      .forEach(x => console.log(`      ${x.px}px  ${x.t}`));
    return r.small.length + r.tiny.length;
  };

  let total = 0;
  total += report(await audit('BOARD'));

  await (await p.$$('#surface-board button:has-text("I\'ll take")'))[0].click();
  await p.waitForTimeout(450);
  total += report(await audit('CLAIM SHEET'));

  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);
  await p.click('[data-act="open-chat"]'); await p.waitForTimeout(450);
  total += report(await audit('GOLDE'));

  console.log(`\ntotal issues: ${total}`);
  console.log('errors:', errs.length);
  await b.close();
  process.exit(0);
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
