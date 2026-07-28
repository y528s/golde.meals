const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:390,height:844}, isMobile:true })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  const last = async () => (await p.$$eval('#setup-scroll .wa-row.in .wa-bubble', e=>e.map(x=>x.innerText))).pop();
  const chips = async () => (await p.$$eval('[data-act="setup-chip"]', e=>e.map(x=>x.textContent.trim()))).join(' | ');

  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(250);
  await p.fill('#setup-field','The Stern family'); await p.press('#setup-field','Enter'); await p.waitForTimeout(250);
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(250);  // baby
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);  // a week
  console.log('CADENCE:', (await last()).replace(/\n/g,' '));
  console.log('  options:', await chips());
  await p.click('[data-act="setup-chip"][data-i="0"]'); await p.waitForTimeout(300);  // every other day
  console.log('\nADULTS:', await last(), '|', await chips());
  await p.click('[data-act="setup-chip"][data-i="1"]'); await p.waitForTimeout(300);  // 2 adults
  console.log('KIDS:  ', await last(), '|', await chips());
  await p.click('[data-act="setup-chip"][data-i="3"]'); await p.waitForTimeout(300);  // 3 kids
  console.log('\nALLERGIES:', (await last()).replace(/\n/g,' '));
  console.log('  options (None must be first):', await chips());
  await p.click('[data-act="setup-chip"][data-i="1"]'); await p.waitForTimeout(300);  // nuts
  console.log('\nOTHER:', (await last()).replace(/\n/g,' '));
  await p.fill('#setup-field','dairy, strawberries'); await p.press('#setup-field','Enter'); await p.waitForTimeout(300);
  await p.click('[data-act="setup-skip"]'); await p.waitForTimeout(400);              // no address
  console.log('\nDONE:', (await last()).replace(/\n/g,' / '));
  await p.click('[data-act="finish-setup"]'); await p.waitForTimeout(700);

  await p.click('[data-filter="glance"]'); await p.waitForTimeout(400);
  const rows = await p.$$eval('.glance', e=>e.map(x=>x.innerText.replace(/\n/g,'  ')));
  console.log('\nEVERY OTHER DAY:'); rows.forEach(r=>console.log('  '+r));

  await p.click('[data-filter="open"]'); await p.waitForTimeout(400);
  await p.click('[data-act="toggle-details"]').catch(()=>{}); await p.waitForTimeout(300);
  const bt = await p.textContent('#board-scroll');
  console.log('\nheadcount:', /2 adults and 3 children/.test(bt));
  console.log('free-text allergies shown:', bt.includes('no dairy') && bt.includes('no strawberries'));

  // does a free-text allergen actually fire?
  await p.click('#surface-board .daycard [data-act="claim"]'); await p.waitForTimeout(400);
  await p.fill('#claim-dish','Creamy strawberry trifle');
  await p.fill('#claim-name','Test'); await p.fill('#claim-contact','(555) 014-0000');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(500);
  const body = await p.textContent('.sheet-body');
  console.log('\nfree-text allergen FIRES:', /strawberr/i.test(body));
  console.log('  ->', body.split('Want to rethink')[0].trim().slice(0,130));
  console.log('\nerrors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
