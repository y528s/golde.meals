#!/usr/bin/env node
/* =============================================================================
   Voice check — words golde. does not say, and words that spell two ways
   -----------------------------------------------------------------------------
   Run:  node tools/check-voice.js
   Exits non-zero if any banned word reaches a user-facing string.

   This exists because a real tester asked "Why is it calling me sweetheart?"
   and answered her own question: "I didn't like it." A pet name from a
   stranger's software is presumption wearing the costume of warmth, and it is
   very easy to reintroduce one line at a time while writing in her voice.

   Deleting the words once was not enough. This is the part that keeps them out.

   Comments are stripped before scanning, so a note explaining the rule doesn't
   trip it. Where a word has a legitimate non-vocative sense — honey and sugar
   are food, "they love lemon" is a preference — only the form used to address
   a person is banned.

   The second half of this file enforces a different rule, asked for directly:
   avoid words that spell one way in London and another in New York. This link
   gets forwarded from Hendon to Ramat Beit Shemesh to Lakewood, and a spelling
   is a small signal about whose product this is. There is almost always a plain
   word that both sides already agree on — "set up" for organise/organize,
   "everybody" for neighbours/neighbors — so the rule costs nothing and is only
   hard to keep by memory. Hence: not memory.

   Comments are scanned too for this half, because the next person to write copy
   reads the comments first and will match whatever they find there.
   ============================================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILES = ["docs/app.js", "docs/sync.js", "docs/hebcal.js", "docs/index.html",
               "docs/styles.css", "worker/src/index.js", "worker/src/slug.js",
               "tools/fetch-calendar.js", "README.md", "HANDOFF.md"];

/* Never, in any form. */
const BANNED = [
  ["sweetheart",  "A stranger's endearment. This is the one a tester objected to by name."],
  ["sweetie",     "Same problem, smaller."],
  ["mammele",     "Affectionate to somebody who already loves you; presumptuous otherwise."],
  ["mamele",      "As above."],
  ["bubbele",     "As above."],
  ["bubbeleh",    "As above."],
  ["bubbie",      "As above."],
  ["darling",     "Reads as either patronising or flirtatious. Neither is wanted."],
  ["dearie",      "Patronising, and ages the reader rather than the speaker."],
  ["poppet",      "She is not addressing a child."],
  ["my dear",     "Vocative. Same objection."]
];

/* Fine as nouns, banned as a way of addressing somebody.

   A vocative is always set off by punctuation — "Thanks, love." or "Honey, it's
   ready" — whereas the innocent uses run straight into the next word: "honey
   cake", "sugar-free", "they love lemon". So the test is not the word, it is
   the word standing alone between a comma (or the start) and a stop. */
const VOCATIVE_WORDS = [
  /* "golde. is your friendly robotic bubby" is how the product describes itself,
     and it is the sentence a tester asked for. "Thanks, bubby" is software
     calling a stranger something. Same word, opposite acts — so the rule is the
     position, not the word. This is the distinction the whole list rests on;
     bubbie and bubbele are outright banned above only because nobody has ever
     used them except as an address. */
  ["bubby", "Describing her is fine. Addressing the reader is not."],
  ["honey", "Fine in a recipe, not as a name for a person."],
  ["hon",   "As above."],
  ["dear",  "\"Dear\" addressing the reader. \"Dear friend\" in a letter is different."],
  ["love",  "\"Thanks, love\". \"They love lemon\" is fine."],
  ["sugar", "Fine in a recipe, not as a name."]
];

const VOCATIVE = VOCATIVE_WORDS.map(function (pair) {
  var w = pair[0];
  return [w, new RegExp("(^|[,;\u2014-]|[\"'>])\\s*" + w + "\\b\\s*([,.!?]|$)", "i"), pair[1]];
});

/* Spelled one way here, another there. The replacement is a word nobody has to
   think about — which is the point, since the reader shouldn't either. */
const TWO_SPELLINGS = [
  [/\borganis|\borganiz/i,   "organise/organize", "\"set up\", \"run\", \"planner\""],
  [/\bneighbou?r/i,          "neighbour/neighbor", "\"everybody\", \"people\", \"somebody\""],
  [/\brecognis|\brecogniz/i, "recognise/recognize", "\"notice\", \"know\""],
  [/\brealis|\brealiz/i,     "realise/realize",   "\"see\", \"work out\""],
  [/\bapologis|\bapologiz/i, "apologise/apologize", "\"say sorry\""],
  [/\bcustomis|\bcustomiz/i, "customise/customize", "\"change\", \"set\""],
  [/\bminimis|\bminimiz/i,   "minimise/minimize",  "\"cut\", \"keep small\""],
  [/\bmaximis|\bmaximiz/i,   "maximise/maximize",  "\"get the most from\""],
  [/\bprioritis|\bprioritiz/i, "prioritise/prioritize", "\"put first\""],
  [/\bsummaris|\bsummariz/i, "summarise/summarize", "\"sum up\""],
  [/\banalys[ei]|\banalyz/i, "analyse/analyze",   "\"look at\", \"work out\""],
  [/\bapologis|\bapologiz/i, "apologise/apologize", "\"say sorry\""],
  [/\bfavou?rite/i,          "favourite/favorite", "\"the one they love\""],
  [/\bhonou?r(?!ed by)/i,    "honour/honor",       "\"do right by\""],
  [/\bbehaviou?r/i,          "behaviour/behavior", "\"how it acts\""],
  [/\bcolou?rs?\b(?!\s*[:;{])/i, "colour/color",  "a specific shade, or nothing"]
];

/* Two exemptions, both real:
   - CSS and inline styles, where `color` and `behavior` are the language's own
     words and cannot be spelled the other way.
   - The line that matches what a user types. "My neighbour" and "my neighbor"
     both have to be caught there, so both spellings must appear. */
const SPELLING_SKIP = [
  /color\s*:/i, /-color\b/i, /currentColor/, /overscroll-behavior/, /scroll-behavior/,
  /RELATIONSHIP = new RegExp/, /colleague\|boss\|rabbi/
];

/* Strip comments so a note about the rule doesn't trip the rule. */
function stripComments(src, ext) {
  if (ext === ".css") return src.replace(/\/\*[\s\S]*?\*\//g, " ");
  if (ext === ".html") return src.replace(/<!--[\s\S]*?-->/g, " ");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1 ");
}

/* The documentation has to be able to name the words it forbids. A pair of
   markers turns the check off and on again, and they are visible in the source
   so nobody switches it off quietly. */
const OFF = /voice-check:\s*off/i;
const ON  = /voice-check:\s*on/i;

let failures = [];

for (const rel of FILES) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;

  const raw = fs.readFileSync(full, "utf8");
  const ext = path.extname(full);
  const cleaned = stripComments(raw, ext);
  const lines = cleaned.split("\n");

  let muted = false;
  lines.forEach((line, i) => {
    if (OFF.test(line)) muted = true;
    if (ON.test(line)) { muted = false; return; }
    if (muted) return;
    const lower = line.toLowerCase();

    for (const [word, why] of BANNED) {
      if (lower.includes(word)) {
        failures.push({ file: rel, line: i + 1, word, why, text: line.trim().slice(0, 100) });
      }
    }
    for (const [word, re, why] of VOCATIVE) {
      if (re.test(line)) {
        failures.push({ file: rel, line: i + 1, word: word + " (as address)", why,
                        text: line.trim().slice(0, 100) });
      }
    }
  });

  /* The spelling half reads the file whole, comments and all. */
  if (ext === ".css") continue;
  let mutedToo = false;
  raw.split("\n").forEach((line, i) => {
    if (OFF.test(line)) mutedToo = true;
    if (ON.test(line)) { mutedToo = false; return; }
    if (mutedToo) return;
    if (SPELLING_SKIP.some(re => re.test(line))) return;
    for (const [re, pair, instead] of TWO_SPELLINGS) {
      if (re.test(line)) {
        failures.push({ file: rel, line: i + 1, word: pair,
                        why: "Spells two ways depending on where the reader is. Try " +
                             instead + " instead.",
                        text: line.trim().slice(0, 100) });
      }
    }
  });
}

if (!failures.length) {
  console.log("voice check: clean — she isn't calling anybody anything they didn't ask for.");
  process.exit(0);
}

console.error("\nvoice check FAILED — " + failures.length + " banned " +
              (failures.length === 1 ? "word" : "words") + " reached a user-facing string.\n");
for (const f of failures) {
  console.error("  " + f.file + ":" + f.line + "  “" + f.word + "”");
  console.error("    " + f.why);
  console.error("    " + f.text + "\n");
}
console.error("Warmth is what she notices and what she takes off your plate.");
console.error("It is not what she calls you.\n");
process.exit(1);
