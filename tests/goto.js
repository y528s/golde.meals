const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1200} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  /* skip-setup lands on the board already */

  // Tuesday is a dairy night, next to Monday's ziti
  await (await p.$$('button:has-text("I\'ll take Tuesday")'))[0].click(); await p.waitForTimeout(450);
  const chips = await p.$$eval('[data-act="use-goto"]', els =>
    els.map(e => ({ dish: e.textContent.trim(), faded: e.className.includes('faded'), why: e.title })));
  console.log('TUESDAY (dairy, Monday is ziti):');
  chips.forEach(c => console.log('  ' + (c.faded?'· faded ':'· clean ') + c.dish +
    (c.why ? '\n            → ' + c.why.slice(0,95) : '')));
  console.log('hint:', (await p.textContent('.f:has([data-act="use-goto"]) .hint'))?.trim());
  await p.screenshot({ path: __dirname+'/goto.png' });

  // tapping a faded one still works
  await p.click('[data-act="use-goto"][data-i="1"]'); await p.waitForTimeout(400);
  console.log('tap fills field:', JSON.stringify(await p.inputValue('#claim-dish')));

  // a clean one, then check it gets remembered to the front
  await p.click('[data-act="use-goto"][data-i="2"]'); await p.waitForTimeout(400);
  await p.fill('#claim-name','Chani Gold'); await p.fill('#claim-contact','(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(800);
  console.log('clean pick had no pop:', !(await p.isVisible('.sheet')));

  // Friday: meat night, so the list should re-sort its warnings
  await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);
  await (await p.$$('button:has-text("I\'ll take Friday")'))[0].click(); await p.waitForTimeout(450);
  const fri = await p.$$eval('[data-act="use-goto"]', els =>
    els.map(e => (e.className.includes('faded')?'faded ':'clean ') + e.textContent.trim()));
  console.log('\nFRIDAY (meat, Shabbat):'); fri.forEach(f=>console.log('  · '+f));
  console.log('\nerrors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
