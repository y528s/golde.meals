#!/usr/bin/env node
/* =============================================================================
   Tests for the voice check
   -----------------------------------------------------------------------------
   Run:  node tools/check-voice.test.js

   The check is now load-bearing on a distinction that is easy to state and easy
   to get wrong in code:

     "Golde is your friendly robotic bubby"   describes her        — allowed
     "Thanks, bubby"                          addresses the reader — banned

   Same word, opposite acts. Everything in the vocative list works this way, and
   the difference is carried entirely by a regex about punctuation. A regex that
   subtle should not be trusted because somebody once pasted a string into a
   file and watched what happened, so here is the same thing done properly.

   The spelling half is tested too, including both escape hatches — the CSS
   property names it must ignore, and the `voice-check: off` markers that let
   the documentation name the words it forbids.
   ============================================================================= */

const { scan } = require("./check-voice");

let pass = 0;
const failed = [];

/* Each case is a line, whether it should be flagged, and why it is here. */
function check(text, shouldFail, why) {
  const hits = scan(text, "t.js", ".js");
  const ok = hits.length > 0 === shouldFail;
  if (ok) pass += 1;
  else {
    failed.push({ text, why, expected: shouldFail ? "flagged" : "allowed",
                  got: hits.length ? hits.map(h => h.word).join(", ") : "nothing" });
  }
}

const allowed = (t, why) => check(t, false, why);
const banned  = (t, why) => check(t, true, why);

/* --- the distinction the whole thing rests on ----------------------------- */

allowed('var s = "Golde is your friendly robotic bubby.";',
  "describes her, which is the sentence the product needs");
allowed('var s = "Ask your bubby, she knows.";',
  "still describing a person, not addressing the reader");
banned('var s = "Thanks, bubby.";',
  "addressing the reader — the thing a tester objected to");
banned("var s = 'All done, bubby!';",
  "same, with the punctuation the other way round");

allowed('var s = "They love lemon in everything.";',
  '"love" as a verb, which is most of its uses in this app');
allowed('var s = "A honey cake, if you have the patience.";',
  '"honey" as food');
banned('var s = "Thanks, love.";', '"love" as a form of address');
banned('var s = "Honey, it is ready.";', '"honey" as a form of address');

/* --- never, in any position ----------------------------------------------- */

banned('var s = "I couldn\'t make sense of that, sweetheart.";',
  "the exact line a tester objected to by name");
banned('var s = "sweetheart";', "no position makes this one acceptable");
banned('var s = "Off you go, my dear.";', "vocative and patronising");

/* --- comments are stripped before the endearment half --------------------- */

allowed('/* A tester asked why it called her sweetheart. */',
  "a comment explaining the rule must not trip the rule");

/* --- one spelling, wherever the link gets forwarded ----------------------- */

banned('var s = "Who is organising this?";', "organise/organize");
banned('var s = "Who is organizing this?";', "the other spelling, same problem");
banned('var s = "Ask a neighbour.";', "neighbour/neighbor");
banned('var s = "Ask a neighbor.";', "the other spelling, same problem");
banned('var s = "Their favourite dish.";', "favourite/favorite");
allowed('var s = "Who is running this?";', "the plain word both sides agree on");
allowed('var s = "Ask somebody on your street.";', "ditto");

/* --- exemptions, both of which are real ----------------------------------- */

allowed('el.style.color = "red";',
  "CSS property names are the language's own words, not prose");
allowed('".scroller { overscroll-behavior: contain; }"',
  "same — behavior here cannot be spelled the other way");
allowed('  "friend|neighbour|neighbor|colleague|boss|rabbi|rebbetzin" +',
  "the line matching what a user types has to hold both spellings");

allowed([
  "/* voice-check: off",
  '   Banned outright: sweetheart, sweetie, darling. Also neighbour/neighbor.',
  "   voice-check: on */"
].join("\n"), "documentation must be able to name the words it forbids");

banned([
  "/* voice-check: off",
  "   voice-check: on */",
  'var s = "Thanks, sweetheart.";'
].join("\n"), "and the hatch must close again afterwards");

/* --- report --------------------------------------------------------------- */

const total = pass + failed.length;
if (!failed.length) {
  console.log("check-voice: " + total + " cases, all as expected.");
  process.exit(0);
}

console.error("\ncheck-voice: " + failed.length + " of " + total + " cases wrong.\n");
for (const f of failed) {
  console.error("  expected " + f.expected + ", got " + f.got);
  console.error("    " + f.text.split("\n")[0]);
  console.error("    (" + f.why + ")\n");
}
process.exit(1);
