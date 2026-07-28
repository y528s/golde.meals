const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE });
  const p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8099/', { waitUntil: 'networkidle' });
  await p.click('[data-act=\"skip-setup\"]'); await p.waitForTimeout(400);
  /* Skip lands on the board; the ask box lives on Golde's page. */
  await p.click('#surface-board [data-act=\"open-chat\"]'); await p.waitForTimeout(450);

  const ask = async (q) => {
    await p.fill('#composer-field', q);
    await p.press('#composer-field', 'Enter');
    await p.waitForTimeout(250);
    const bubbles = await p.$$eval('#chat-scroll .notice.from-golde', els =>
      els.map(e => e.innerText.replace(/^golde\.\s*\d+:\d+\s*/, '').trim()));
    return bubbles[bubbles.length - 1];
  };

  const qs = [
    'Who is sending dinner on Tuesday?',
    'Is next thursday open?',
    'what is Rivky bringing?',
    "what's still open?",
    'who is bringing what this week?',
    'how many people am I cooking for?',
    'are they allergic to anything?',
    'what time do I need to be there?',
    'where do I drop it off?',
    'what should I bring?',
    'hi golde',
    'is friday taken?',
    'what about shabbos?',
    'can you fix my car',
  ];
  for (const q of qs) console.log('Q: ' + q + '\nA: ' + (await ask(q)) + '\n');

  // contact manager
  await p.click('#demo-fab'); await p.waitForTimeout(250);
  await p.click('[data-act="set-role"][data-role="organizer"]'); await p.waitForTimeout(250);
  await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(400);
  console.log('contacts rendered:', (await p.$$('#surface-board .contact')).length);
  console.log('opt-in warning shown:', (await p.textContent('#board-scroll')).includes("said I may write"));
  await p.fill('#surface-board #new-contact', 'Faigy Berkowitz');
  await p.press('#surface-board #new-contact', 'Tab'); await p.waitForTimeout(400);
  console.log('after add:', (await p.$$('#surface-board .contact')).length);
  await p.click('#surface-board [data-act="nudge-unsigned"]'); await p.waitForTimeout(500);
  console.log('1:1 nudge text:', (await p.textContent('#chat-scroll')).includes('one at a time'));
  await p.click('#surface-chat [data-act="open-board"]'); await p.waitForTimeout(400);
  await p.click('#surface-board [data-act="ask-directly"]'); await p.waitForTimeout(500);
  console.log('ask-directly posted:', (await p.textContent('#chat-scroll')).includes('just her'));

  console.log('\nERRORS: ' + errs.length); errs.forEach(e => console.log(e));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
