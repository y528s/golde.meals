#!/usr/bin/env node
/* =============================================================================
   Voice check — words golde. does not say
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
   ============================================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FILES = ["docs/app.js", "docs/sync.js", "docs/index.html", "docs/styles.css",
               "worker/src/index.js"];

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

/* Strip comments so a note about the rule doesn't trip the rule. */
function stripComments(src, ext) {
  if (ext === ".css") return src.replace(/\/\*[\s\S]*?\*\//g, " ");
  if (ext === ".html") return src.replace(/<!--[\s\S]*?-->/g, " ");
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, "$1 ");
}

let failures = [];

for (const rel of FILES) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;

  const raw = fs.readFileSync(full, "utf8");
  const ext = path.extname(full);
  const cleaned = stripComments(raw, ext);
  const lines = cleaned.split("\n");

  lines.forEach((line, i) => {
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
