const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act="skip-setup"]'); await p.waitForTimeout(400);
  /* "At a glance" used to be a tab you had to find. It is now the first thing
     on the page and there is no tab to find, which is the whole point. */
  const rows = await p.$$eval('.ws-day', els => els.map(e => e.innerText.replace(/\n/g,' ') + ' — ' + e.className.replace('ws-day ','')));
  console.log('THE WEEK, AT A GLANCE:'); rows.forEach(r=>console.log('  ' + r));
  console.log('  no tabs to choose between:', (await p.$$('[data-filter]')).length === 0);
  const h = await p.evaluate(()=>{const s=document.getElementById('board-scroll');
    return (s.scrollHeight/s.clientHeight).toFixed(1);});
  console.log('\nheight:', h, 'screenfuls');
  await p.screenshot({ path: __dirname+'/glance.png' });
  // tapping an open night still claims it
  await p.click('.ws-day.open'); await p.waitForTimeout(450);
  console.log('tapping an open night opens the claim sheet:', await p.isVisible('#claim-dish'));
  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);
  const body = await p.textContent('body');
  console.log('no endearments anywhere:', !/sweetheart|mammele/i.test(body));
  console.log('errors:', errs.length);
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
