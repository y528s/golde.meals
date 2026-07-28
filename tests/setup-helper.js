/* Walk the setup conversation by step name, so reordering the questions does
   not break every test that happens to pass through them. */
module.exports.walk = async function walk(p, answers, log) {
  for (let guard = 0; guard < 40; guard++) {
    await p.waitForSelector('.wa-actions[data-step]', { timeout: 10000 });
    const step = await p.getAttribute('.wa-actions', 'data-step');
    if (step === 'done') return;

    const answer = answers[step];
    if (log) {
      const said = (await p.$$eval('#setup-scroll .wa-row.in .wa-bubble',
        e => e.map(x => x.innerText))).pop();
      log(step, said.replace(/\n+/g, ' '));
    }

    if (answer === undefined || answer === null) {
      if (await p.isVisible('[data-act="setup-skip"]')) {
        await p.click('[data-act="setup-skip"]');
      } else {
        await p.click('[data-act="setup-chip"][data-i="0"]');
      }
    } else if (typeof answer === 'number') {
      await p.click(`[data-act="setup-chip"][data-i="${answer}"]`);
    } else {
      await p.fill('#setup-field', answer);
      await p.press('#setup-field', 'Enter');
    }
    await p.waitForTimeout(280);
  }
  throw new Error('setup did not reach "done"');
};
