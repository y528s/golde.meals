const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath:process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport:{width:430,height:1100} })).newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('http://localhost:8099/',{waitUntil:'networkidle'});
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  const board = async () => {
    if (await p.getAttribute('#surface-board','data-pos') !== 'on') {
      await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(450);
    }
  };

  // FAMILY asks for a recipe
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="family"]'); await p.waitForTimeout(300);
  await board();
  const asks = await p.$$('#surface-board [data-act="ask-recipe"]');
  console.log('askable meals:', asks.length);
  console.log('seeded recipe visible:', (await p.$$('#surface-board [data-act="see-recipe"]')).length > 0);

  await asks[0].click(); await p.waitForTimeout(600);
  console.log('golde passed it on:', (await p.textContent('#chat-scroll')).includes('asked for your'));
  console.log('  framed as compliment:', (await p.textContent('#chat-scroll')).includes("haven't stopped talking"));

  // read the seeded recipe
  await board();
  await p.click('#surface-board [data-act="see-recipe"]'); await p.waitForTimeout(400);
  console.log('recipe opens:', (await p.textContent('.recipe-card')).slice(0,60).trim()+'…');
  await p.screenshot({ path: __dirname+'/recipe-view.png' });
  await p.click('[data-act="close-sheet"]'); await p.waitForTimeout(300);

  // NEIGHBOR: claim Tuesday, family asks, cook writes it out
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="neighbor"]'); await p.waitForTimeout(350);
  await board();
  await (await p.$$('#surface-board button:has-text("I\'ll take Tuesday")'))[0].click();
  await p.waitForTimeout(400);
  await p.fill('#claim-dish','Potato leek soup'); await p.fill('#claim-name','Chani Gold');
  await p.fill('#claim-contact','(555) 014-7788');
  await p.click('[data-act="submit-claim"]'); await p.waitForTimeout(800);

  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="family"]'); await p.waitForTimeout(350);
  await board();
  // ask the cook we just became, not whoever happens to be last in the list
  await p.locator('#surface-board .daycard, #surface-board .compact-day', { hasText: 'Potato leek soup' })
         .locator('[data-act="ask-recipe"]').click();
  await p.waitForTimeout(600);

  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="neighbor"]'); await p.waitForTimeout(350);
  await board();
  const bt = await p.textContent('#surface-board');
  console.log('cook sees the ask:', bt.includes('Sarah asked for this recipe'));
  console.log('  and it says no pressure:', bt.includes('Nobody has to write anything down'));
  await p.screenshot({ path: __dirname+'/recipe-ask.png' });

  await p.click('#surface-board [data-act="write-recipe"]'); await p.waitForTimeout(500);
  await p.fill('#recipe-text','Leeks, potatoes, butter, stock. Blend half so it stays rustic.');
  await p.click('[data-act="save-recipe"]'); await p.waitForTimeout(700);
  console.log('saved + announced:', (await p.textContent('#chat-scroll')).includes('think of you'));

  // declining works too
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="family"]'); await p.waitForTimeout(350);
  await board();
  const kept = await p.textContent('#surface-board');
  console.log('recipes panel:', kept.includes('Recipes they gave you'));
  console.log('errors:', errs.length); errs.forEach(e=>console.log(e));
  await b.close();
})().catch(e=>{console.error('FATAL',e.message);process.exit(1);});
