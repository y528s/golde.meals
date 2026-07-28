const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  const last = async () => (await p.$$eval('#setup-scroll .wa-row.in .wa-bubble', e=>e.map(x=>x.innerText))).pop();
  console.log('opens on setup:', await p.getAttribute('#surface-setup','data-pos'));
  console.log('labelled honestly:', (await p.textContent('.viewing-as')).trim());
  console.log('\n1. ' + await last());
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);
  console.log('2. ' + await last());
  await p.fill('#setup-field','The Cohen family'); await p.press('#setup-field','Enter'); await p.waitForTimeout(300);
  console.log('3. ' + await last());
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);   // A baby
  console.log('4. ' + (await last()).replace(/\n/g,' / '));
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);   // a week
  console.log('5. ' + await last());
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);   // every other day
  console.log('6. ' + await last());
  await p.click('[data-act="setup-chip"][data-i="1"]'); await p.waitForTimeout(300);   // 2 adults
  console.log('7. ' + await last());
  await p.click('[data-act="setup-chip"][data-i="3"]'); await p.waitForTimeout(300);   // 3 kids
  console.log('10. ' + await last());
  await p.fill('#setup-field','5 and 14'); await p.press('#setup-field','Enter'); await p.waitForTimeout(300);
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);   // no allergies
  console.log('9. ' + await last());
  await p.screenshot({ path: __dirname+'/setup-mid.png' });
  await p.click('[data-act="setup-skip"]'); await p.waitForTimeout(350);               // nothing else
  await p.click('[data-act="setup-skip"]'); await p.waitForTimeout(400);               // address later
  console.log('10. ' + (await last()).replace(/\n/g,' / '));
  console.log('   hands over a link:', await p.isVisible('#setup-scroll .linkcard'));
  await p.screenshot({ path: __dirname+'/setup-done.png' });

  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(700);
  console.log('\nlands on board:', await p.getAttribute('#surface-board','data-pos'));
  const bt = await p.textContent('#surface-board');
  console.log('  train is named:', bt.includes('Meals for The Cohen family'));
  console.log('  empty, as a new train should be:', bt.includes('7 nights open') || bt.includes('nights open'));
  console.log('  role is organizer:', (await p.textContent('.viewing-as')).includes('Planner'));
  const h = await p.evaluate(()=>{const s=document.getElementById('board-scroll');
    return (s.scrollHeight/s.clientHeight).toFixed(1);});
  console.log('  board height:', h, 'screenfuls');
  await p.screenshot({ path: __dirname+'/setup-board.png' });

  // shiva opener differs
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="restart-setup"]'); await p.waitForTimeout(400);
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(250);
  await p.fill('#setup-field','The Levy family'); await p.press('#setup-field','Enter'); await p.waitForTimeout(250);
  await p.click('[data-act="setup-chip"][data-i="1"]'); await p.waitForTimeout(350);   // shiva
  console.log('\nshiva opener: ' + (await last()).replace(/\n/g,' / '));
  console.log('\nerrors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
