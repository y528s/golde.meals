/* Getting back to the board a week later. The link arrives in a group chat and
   is buried by lunchtime; "scroll up in WhatsApp" is not a plan. */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true,
                                   permissions: ['clipboard-read', 'clipboard-write'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.click('[data-act="skip-setup"]'); await p.waitForTimeout(400);
  await p.click('.lc-open'); await p.waitForTimeout(500);

  console.log('reachable from the board:', await p.isVisible('#surface-board [data-act="keep-link"]'));
  await p.click('#surface-board [data-act="keep-link"]'); await p.waitForTimeout(400);

  const link = (await p.textContent('.linkbox')).trim();
  console.log('shows the link:', link);
  console.log('  readable, not a token:', /golde\.meals\/[a-z-]+$/.test(link) || /\?t=/.test(link));

  const routes = await p.$$eval('.sheet-foot button', e => e.map(x => x.textContent.trim()));
  console.log('ways out:', routes.join(' | '));

  await p.click('[data-act="copy-link"]'); await p.waitForTimeout(400);
  const copied = await p.evaluate(() => navigator.clipboard.readText().catch(() => ''));
  console.log('copy puts it on the clipboard:', copied.trim() === link);

  const homeScreen = await p.textContent('.sheet-body');
  console.log('offers the home screen:', /Add to Home Screen/i.test(homeScreen));
  await p.screenshot({ path: __dirname + '/../screenshots/keep-link.png' });
  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);

  /* And she offers it unprompted at the moment it will matter later. */
  await p.click('#surface-chat [data-act="open-board"]').catch(() => {});
  await p.waitForTimeout(300);
  if (await p.getAttribute('#surface-board', 'data-pos') !== 'on') {
    await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);
  }
  await (await p.$$('#surface-board button:has-text("I\'ll take")'))[0].click();
  await p.waitForTimeout(400);
  await p.fill('#claim-dish', 'Vegetable soup');
  await p.fill('#claim-name', 'Chani Gold');
  await p.fill('#claim-contact', '(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(900);
  console.log('\noffered right after claiming:',
    await p.isVisible('#chat-scroll [data-act="keep-link"]'));

  console.log('errors:', errs.length);
  errs.forEach(e => console.log('  ' + e));
  await b.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
