const { chromium } = require('playwright-core');
const fs = require('fs');
const OUT = process.env.OUT || (__dirname + '/shots');
fs.mkdirSync(OUT, { recursive: true });
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const URL = 'http://localhost:8099/';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const errors = [];

  // ---------- DESKTOP ----------
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const board = async (pg) => {
    if (await pg.getAttribute('#surface-board','data-pos') !== 'on') {
      await pg.click('#surface-chat [data-act="open-board"]'); await pg.waitForTimeout(450);
    }
  };
  p.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(450);
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/01-desktop-chat.png' });
  console.log('thread text ok:', (await p.textContent('#chat-scroll')).includes('Mazal tov'));

  // chat -> board
  /* skip-setup lands on the board already */
  await p.screenshot({ path: OUT + '/02-desktop-board.png' });
  console.log('board visible:', await p.isVisible('.board-h1'));
  console.log('variety note seeded:', (await p.textContent('#board-scroll')).includes('both pasta'));
  console.log('friday candle visible:', (await p.textContent('#board-scroll')).includes('7:52'));

  // claim Tuesday
  const btns = await p.$$('button:has-text("I\'ll cook Tuesday")');
  console.log('tuesday claim button count:', btns.length);
  await btns[0].click();
  await p.waitForTimeout(400);
  await p.fill('#claim-dish', 'Pesto pasta with garlic bread');
  await p.waitForTimeout(300);
  const hint = await p.textContent('#live-hint');
  console.log('live hint:', JSON.stringify(hint));
  await p.fill('#claim-name', 'Chani Gold');
  await p.fill('#claim-contact', '(555) 014-7788');
  await p.screenshot({ path: OUT + '/03-desktop-claim-sheet.png' });

  await p.click('[data-act="submit-claim"]');
  await p.waitForTimeout(500);
  const concerns = await p.textContent('.sheet-body');
  console.log('--- CONCERNS ---\n' + concerns.trim().slice(0, 900));
  await p.screenshot({ path: OUT + '/04-desktop-allergen-pop.png' });

  // rethink -> change dish to meat (kosher nudge on dairy day)
  await p.click('[data-act="close-concerns"]');
  await p.waitForTimeout(400);
  await p.fill('#claim-dish', 'Brisket with roasted potatoes');
  await p.click('[data-act="submit-claim"]');
  await p.waitForTimeout(400);
  console.log('--- KOSHER ---\n' + (await p.textContent('.sheet-body')).trim().slice(0, 400));

  // rethink -> pasta (variety nudge, Monday is ziti)
  await p.click('[data-act="close-concerns"]');
  await p.waitForTimeout(300);
  await p.fill('#claim-dish', 'Baked macaroni and cheese');
  await p.click('[data-act="submit-claim"]');
  await p.waitForTimeout(400);
  console.log('--- VARIETY ---\n' + (await p.textContent('.sheet-body')).trim().slice(0, 500));

  // final: a clean dairy dish for the dairy night — should sail straight through
  await p.click('[data-act="close-concerns"]');
  await p.waitForTimeout(300);
  await p.fill('#claim-dish', 'A big lemony potato and leek soup with a homemade challah');
  await p.click('[data-act="submit-claim"]');
  await p.waitForTimeout(700);
  console.log('clean dish had no pop:', !(await p.isVisible('.sheet')));
  console.log('back on chat:', await p.getAttribute('#surface-chat', 'data-pos'));
  const tail = await p.textContent('#chat-scroll');
  console.log('confirmation present:', tail.includes("Tuesday's yours"));
  await p.screenshot({ path: OUT + '/05-desktop-confirmed.png' });

  // reminder + DONE
  await p.click('#demo-fab');
  await p.waitForTimeout(400);
  await p.screenshot({ path: OUT + '/06-desktop-demo-panel.png' });
  await p.click('[data-act="fastforward"]');
  await p.waitForTimeout(600);
  const rem = await p.textContent('#chat-scroll');
  console.log('reminder present:', rem.includes("Tomorrow's your night"));
  await p.screenshot({ path: OUT + '/07-desktop-reminder.png' });
  await p.click('[data-act="mark-delivered"]');
  await p.waitForTimeout(500);
  console.log('delivered ack:', (await p.textContent('#chat-scroll')).includes('Go sit down'));

  // ORGANIZER
  await p.click('#demo-fab'); await p.waitForTimeout(300);
  await p.click('[data-act="set-role"][data-role="planner"]'); await p.waitForTimeout(400);
  await board(p);
  await p.screenshot({ path: OUT + '/08-desktop-planner.png' });
  console.log('planner controls:', await p.isVisible('#surface-board [data-act="nudge"]'));
  await p.click('#surface-board [data-act="add-slot"]'); await p.waitForTimeout(300);
  console.log('slot added:', (await p.$$('#surface-board [data-act="claim"]')).length >= 2);
  await p.click('#surface-board [data-act="edit-day"]'); await p.waitForTimeout(400);
  await p.click('[data-act="set-kosher"][data-k="pareve"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/08b-desktop-editday.png' });
  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);
  console.log('kosher pref changed:', (await p.textContent('#board-scroll')).includes('hoping for pareve'));
  await p.click('#surface-board [data-act="nudge"]'); await p.waitForTimeout(600);
  console.log('nudge posted:', (await p.textContent('#chat-scroll')).includes('Not nagging'));

  // FAMILY
  await p.click('#demo-fab'); await p.waitForTimeout(300);
  await p.click('[data-act="set-role"][data-role="family"]'); await p.waitForTimeout(400);
  await board(p);
  await p.screenshot({ path: OUT + '/09-desktop-family.png' });
  await p.click('#surface-board [data-act="toggle-surprise"]'); await p.waitForTimeout(400);
  console.log('surprise mode:', (await p.textContent('#board-scroll')).includes("Something's coming"));
  await p.screenshot({ path: OUT + '/09b-desktop-family-surprise.png' });
  await p.click('#surface-board [data-act="toggle-surprise"]'); await p.waitForTimeout(300);
  await p.click('#surface-board [data-act="pause"]'); await p.waitForTimeout(600);
  console.log('pause posted:', (await p.textContent('#chat-scroll')).includes('take the week off'));

  // ---------- MOBILE 390 ----------
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mctx.newPage();
  mp.on('pageerror', e => errors.push('M-PAGEERROR: ' + e.message));
  mp.on('console', m => { if (m.type() === 'error') errors.push('M-CONSOLE: ' + m.text()); });
  await mp.goto(URL, { waitUntil: 'networkidle' });
  await mp.click('[data-act=\"skip-setup\"]'); await mp.waitForTimeout(450);
  await mp.waitForTimeout(400);
  await mp.screenshot({ path: OUT + '/10-mobile-chat.png' });
  const frameless = await mp.evaluate(() => getComputedStyle(document.getElementById('phone')).borderTopWidth);
  console.log('mobile frame border (expect 0px):', frameless);
  const hscroll = await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  console.log('no horizontal overflow:', hscroll);
  /* skip-setup lands on the board already */
  await mp.screenshot({ path: OUT + '/11-mobile-board.png' });
  await (await mp.$$('button:has-text("I don\'t cook")'))[0].click();
  await mp.waitForTimeout(400);
  await mp.click('[data-act="set-kind"][data-kind="giftcard"]'); await mp.waitForTimeout(300);
  await mp.fill('#claim-name', 'Bracha Levi');
  await mp.fill('#claim-contact', '(555) 014-3311');
  await mp.screenshot({ path: OUT + '/12-mobile-nocook.png' });
  await mp.click('[data-act="submit-claim"]'); await mp.waitForTimeout(700);
  console.log('nocook claimed:', (await mp.textContent('#chat-scroll')).includes('gift card'));
  await mp.screenshot({ path: OUT + '/13-mobile-confirmed.png' });

  // mobile allergen pop mid-flow (for the PR screenshot)
  await board(mp);
  const t2 = await mp.$$('button:has-text("I\'ll cook Friday")');
  if (t2.length) {
    await t2[0].click(); await mp.waitForTimeout(400);
    await mp.fill('#claim-dish', 'Chicken pad thai');
    await mp.fill('#claim-name', 'Bracha Levi');
  await mp.fill('#claim-contact', '(555) 014-3311');
    await mp.click('[data-act="submit-claim"]'); await mp.waitForTimeout(500);
    await mp.screenshot({ path: OUT + '/14-mobile-allergen-pop.png' });
    console.log('mobile allergen fired:', (await mp.textContent('.sheet-body')).includes('nuts'));
    await mp.click('[data-act="close-concerns"]'); await mp.waitForTimeout(300);
    await mp.click('[data-act="close-sheet"]'); await mp.waitForTimeout(300);
  } else { console.log('!! no Friday claim button'); }

  // cancel flow
  const cancelBtn = await mp.$$('#surface-board [data-act="cancel"]');
  console.log('cancel affordances:', cancelBtn.length);
  if (cancelBtn.length) {
    await cancelBtn[0].click(); await mp.waitForTimeout(400);
    await mp.screenshot({ path: OUT + '/15-mobile-cancel.png' });
    await mp.click('[data-act="confirm-cancel"]'); await mp.waitForTimeout(600);
    console.log('cancel warm:', (await mp.textContent('#chat-scroll')).includes('nobody needs a reason'));
  }

  console.log('\n=== ERRORS (' + errors.length + ') ===');
  errors.forEach(e => console.log(e));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
