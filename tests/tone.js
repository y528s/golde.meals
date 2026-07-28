const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1100} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  const board = async () => { if (await p.getAttribute('#surface-board','data-pos') !== 'on') {
    await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450); } };
  const occ = async k => { await p.click('#demo-fab'); await p.waitForTimeout(250);
    await p.click(`[data-act="set-occasion"][data-occasion="${k}"]`); await p.waitForTimeout(350);
    await p.click('[data-act="close-sheet"]').catch(()=>{}); await p.waitForTimeout(300); await board(); };

  for (const k of ['new-baby','recovery','shiva']) {
    await occ(k);
    const lede = (await p.textContent('#surface-board .golde-note')).replace(/^golde\./,'').trim();
    console.log('\n[' + k.toUpperCase() + ']  ' + lede);
    const first = (await p.$$eval('#chat-scroll .notice.from-golde', e=>e.map(x=>x.innerText))).pop()||'';
    console.log('   opens: ' + first.replace(/^golde\.\s*\d+:\d+\s*/,'').split('\n')[0].slice(0,105));
    console.log('   variety nudge shown:', (await p.textContent('#board-scroll')).includes('Maybe not a third'));
  }
  await p.screenshot({ path: __dirname+'/tone-shiva.png' });

  // claim during a shiva -> confirmation + reminder register
  await (await p.$$('#surface-board button:has-text("I\'ll take Tuesday")'))[0].click();
  await p.waitForTimeout(400);
  await p.fill('#claim-dish','Roast chicken and potatoes');
  await p.fill('#claim-name','Chani Gold'); await p.fill('#claim-contact','(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(500);
  if (await p.isVisible('[data-act="force-claim"]')) { await p.click('[data-act="force-claim"]'); await p.waitForTimeout(700); }
  const latest = (await p.$$eval('#chat-scroll .notice.from-golde', e=>e.map(x=>x.innerText)))[0];
  console.log('\nSHIVA confirmation (latest):\n   ' + latest.replace(/\n/g,'\n   ').slice(0,260));
  console.log('  avoids "sweetheart":', !latest.includes('sweetheart'));
  const feed = latest;
  console.log('  adds the door line:', feed.includes('Being there is the thing'));

  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="fastforward"]'); await p.waitForTimeout(700);
  console.log('  reminder closes quietly:', (await p.textContent('#chat-scroll')).includes('Nothing else is required'));

  // wrap-up: no money asked at a shiva
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="organizer"]'); await p.waitForTimeout(350);
  await board();
  await p.click('#surface-board [data-act="wrap"]'); await p.waitForTimeout(800);
  const wrapped = await p.textContent('#chat-scroll');
  console.log('\nSHIVA wrap-up:', wrapped.includes('remember exactly who was at the door'));
  console.log('  donation asked:', wrapped.includes('chip in'), '<-- must be false');
  console.log('\nerrors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
