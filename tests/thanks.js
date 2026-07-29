const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1000} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  const board = async () => { if (await p.getAttribute('#surface-board','data-pos')!=='on') {
    await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);} };
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="family"]'); await p.waitForTimeout(350);
  await board();
  const bt = await p.textContent('#surface-board');
  console.log('pause is guarded:', bt.includes('already got shopping in for you'));
  console.log('  routes to planner:', await p.isVisible('[data-act="message-planner-pause"]'));
  console.log('  partial stop offered:', bt.includes('Stop anything not yet claimed'));
  await p.screenshot({ path: __dirname+'/pause-guard.png' });

  await p.click('#surface-board [data-act="say-thanks"]'); await p.waitForTimeout(500);
  const draft = await p.inputValue('#thanks-text');
  console.log('\ndraft prefilled:', JSON.stringify(draft.slice(0,58))+'…');
  await p.fill('#thanks-text','You fed us for a week and asked for nothing. We will not forget it.');
  await p.click('[data-act="send-thanks"]'); await p.waitForTimeout(700);
  const feed = await p.textContent('#chat-scroll');
  console.log('custom words sent:', feed.includes('asked for nothing'));
  console.log('default not sent:', !feed.includes("handwriting on the lid"));

  // shiva draft should be quieter
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-occasion"][data-occasion="shiva"]'); await p.waitForTimeout(400);
  await p.click('[data-act="close-sheet"]').catch(()=>{}); await p.waitForTimeout(300);
  await board();
  await p.click('#surface-board [data-act="say-thanks"]'); await p.waitForTimeout(500);
  console.log('\nshiva draft:', JSON.stringify(await p.inputValue('#thanks-text')));
  console.log('errors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
