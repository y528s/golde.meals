const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:900} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8099/', { waitUntil:'networkidle' });
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  const addr = '418 Marion Street';

  /* skip-setup lands on the board already */
  console.log('BEFORE claiming — address on board:', (await p.textContent('#board-scroll')).includes(addr));
  await p.click('[data-act="open-chat"]'); await p.waitForTimeout(400);
  await p.fill('#composer-field','where do I drop it off?'); await p.press('#composer-field','Enter');
  await p.waitForTimeout(300);
  console.log('  she answers with address:', (await p.textContent('#chat-scroll')).includes(addr));

  await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(400);
  await (await p.$$('button:has-text("I\'ll take Tuesday")'))[0].click(); await p.waitForTimeout(400);
  await p.fill('#claim-dish','Vegetable soup and challah');
  await p.fill('#claim-name','Chani Gold');
  await p.fill('#claim-contact','(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(800);
  await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(500);
  console.log('AFTER claiming  — address on board:', (await p.textContent('#board-scroll')).includes(addr));
  await p.click('[data-act="open-chat"]'); await p.waitForTimeout(400);
  await p.fill('#composer-field','where do I drop it off?'); await p.press('#composer-field','Enter');
  await p.waitForTimeout(300);
  console.log('  she answers with address:', (await p.textContent('#chat-scroll')).includes(addr));

  // planner + family always see it (their own house)
  for (const role of ['planner','family']) {
    await p.click('#demo-fab'); await p.waitForTimeout(250);
    await p.click(`[data-act="set-role"][data-role="${role}"]`); await p.waitForTimeout(350);
    const onBoard = await p.getAttribute('#surface-board','data-pos') === 'on';
    if (!onBoard) { await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(400); }
    const txt = await p.textContent('#board-scroll');
    const vals = await p.$$eval('#board-scroll input', els => els.map(e => e.value).join(' '));
    console.log(role + ' sees address:', (txt + ' ' + vals).includes(addr));
  }
  console.log('errors:', errs.length);
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
