const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1000} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act="skip-setup"]'); await p.waitForTimeout(400);
  /* skip-setup lands on the board already */
  const board = async () => { if (await p.getAttribute('#surface-board','data-pos')!=='on') {
    await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);} };
  for (const r of ['sender','planner','family']) {
    if (r!=='sender') { await p.click('#demo-fab'); await p.waitForTimeout(250);
      await p.click(`[data-act="set-role"][data-role="${r}"]`); await p.waitForTimeout(350); }
    await board();
    const t = await p.textContent('#surface-board');
    console.log(r.padEnd(10), 'ask-planner:', (await p.$$('#surface-board [data-act="message-planner"]')).length,
                ' feedback:', (await p.$$('#surface-board [data-act="feedback"]')).length);
  }
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="sender"]'); await p.waitForTimeout(350);
  await board();
  await p.click('#surface-board [data-act="toggle-details"]').catch(()=>{}); await p.waitForTimeout(350);
  const dt = await p.textContent('#board-scroll');
  console.log('\nallergen disclaimer:', dt.includes('I can only read words'));
  await p.screenshot({ path: __dirname+'/help.png' });
  console.log('errors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
