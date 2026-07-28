const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1200} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  const board = async () => { if (await p.getAttribute('#surface-board','data-pos') !== 'on') {
    await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450); } };
  const role = async r => { await p.click('#demo-fab'); await p.waitForTimeout(250);
    await p.click(`[data-act="set-role"][data-role="${r}"]`); await p.waitForTimeout(350); await board(); };

  await board();
  await (await p.$$('button:has-text("I\'ll cook Tuesday")'))[0].click(); await p.waitForTimeout(400);
  await p.fill('#claim-dish','Mushroom-free vegetable lasagna');
  await p.fill('#claim-name','Chani Gold'); await p.fill('#claim-contact','(555) 014-7788'); await p.fill('#claim-email', 'test@example.com');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(500);
  if (await p.isVisible('[data-act="force-claim"]')) { await p.click('[data-act="force-claim"]'); await p.waitForTimeout(700); }

  await role('family');
  await p.locator('#surface-board .daycard, #surface-board .compact-day', { hasText: 'lasagna' }).locator('[data-act="ask-recipe"]').click();
  await p.waitForTimeout(600);
  await role('sender');
  await p.click('#surface-board [data-act="write-recipe"]'); await p.waitForTimeout(500);
  console.log('default scope is private:',
    await p.getAttribute('[data-act="set-recipe-scope"][data-scope="private"]','aria-pressed'));
  await p.fill('#recipe-text','Layers, ricotta, no mushrooms ever.');
  await p.click('[data-act="set-recipe-scope"][data-scope="book"]'); await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname+'/scope.png' });
  await p.click('[data-act="save-recipe"]'); await p.waitForTimeout(700);
  const feed = await p.textContent('#chat-scroll');
  console.log('golde confirms consent:', feed.includes('with your name on it'));
  console.log('  and that it was theirs to give:', feed.includes('that was your say-so'));
  await role('family');
  console.log('book badge shown:', (await p.textContent('#surface-board')).includes('shared for the book'));
  console.log('errors:', errs.length);
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
