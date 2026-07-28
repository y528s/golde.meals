const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  /* skip-setup lands on the board already */
  const h = async () => p.evaluate(() => { const s=document.getElementById('board-scroll');
    return (s.scrollHeight/s.clientHeight).toFixed(1); });
  /* One page now, so there is one number to care about: what a somebody scrolls
     through before they have done the thing they came to do. */
  console.log('somebody, one page   :', await h(), 'screenfuls');
  await p.screenshot({ path: __dirname+'/whole-week.png' });
  await p.click('[data-act="toggle-settled"]'); await p.waitForTimeout(400);
  console.log('  + the sorted nights :', await h(), 'screenfuls');
  await p.click('[data-act="toggle-details"]'); await p.waitForTimeout(400);
  console.log('  + every particular  :', await h(), 'screenfuls');
  for (const r of ['planner','family']) {
    await p.click('#demo-fab'); await p.waitForTimeout(250);
    await p.click(`[data-act="set-role"][data-role="${r}"]`); await p.waitForTimeout(400);
    if (await p.getAttribute('#surface-board','data-pos') !== 'on') {
      await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450); }
    console.log(r.padEnd(21) + ':', await h(), 'screenfuls');
  }
  console.log('errors:', errs.length);
  await b.close();
})();
