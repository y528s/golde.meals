# golde. meals — project instructions

Read this before changing anything. It is short on purpose; the rules here were
each learned by getting them wrong.

---

## What this is

A meal train for observant Jewish communities, run by **Golde** — a web app
with a voice. Somebody has a baby, a surgery, a death in the family. Twenty
people want to help. The coordination is a mess of group chats and nobody knows
what anybody else is bringing.

**The product is one link.** A planner sets a train up by answering a few
questions; Golde hands back a link; they paste it into the group chats they
already have; people tap it, take a night, and get reminded the day before.

There is a **sister product**, also called golde., for family dates and
yahrzeits. Meals should read as the same company: same cream, same forest
green, same rhythm.

---

## The five rules that must not be broken

These are not preferences. Each one has a cost attached that is paid by a real
family or by the business.

**1 · Nobody is messaged who did not ask to be.**
Signing up for a night *is* the opt-in. That is what makes a reminder
legitimate rather than spam. Contacts can be imported in bulk — they land on
the planner's list and **never** on the sending list. `tests/people.js` guards
this. If that test is ever weakened, stop and ask why.
*Cost of breaking it: the WhatsApp business number is banned. Not recoverable.*

**2 · A business cannot be in a WhatsApp group.**
The Business Platform is 1:1 only. There is no API that posts to a group, and
the unofficial libraries that appear to get the number banned. Any feature
premised on Golde being in the family chat is impossible, not merely hard.

**3 · The same screens serve a birth and a bereavement.**
Every line she says routes through a register — `bright`, `tender`, `quiet` —
via `byTone()`. There is no default that is safe for both. Adding a cheerful
sentence without checking the shiva case is the most damaging thing you can do
to this product.

**4 · Warn, never block.**
`runChecks()` returns concerns and the flow continues. Every check is a guess
made by matching words. A guess that refuses to let somebody sign up is worse
than no guess. Phrase them as noticing, not as validation errors.

**5 · Silence beats a confident wrong answer.**
`docs/hebcal.js` returns `null` outside its verified date range and the app says
nothing. Never compute a parsha, a candle time or a fast day from memory — a
wrong one reads to the community as an outsider guessing.

---

## Who this is for

In testers' own words: *"moms who might not know how to use technology"*,
*"normal Jews who can barely use their email"*, *"busy and probably only paying
50% attention as they sign up"*.

Two floors follow, measured by `tests/a11y.js` on every run. They **outrank
every aesthetic preference in this repository.**

- **44px** minimum tap target
- **15px** minimum for any text carrying meaning (timestamps and tags may go smaller)

---

## The voice

Golde is warm and slightly overbearing, never cute. Two rules are enforced by
`npm run check`, which runs in the pre-commit hook:

- **No endearments addressed to the reader.** The rule is about position, not
  vocabulary: "Golde is your friendly robotic bubby" describes her and passes;
  "Thanks, bubby" addresses a stranger and fails.
- **No word that spells two ways.** organise/organize, neighbour/neighbor,
  favourite/favorite. This link gets forwarded from Hendon to Ramat Beit
  Shemesh to Lakewood.

Documentation that must *name* a banned word brackets it with
`voice-check: off` / `voice-check: on`, visibly, in the source.

`tools/check-voice.test.js` has 24 cases covering both rules. Run it before
trusting a change to the checker.

**Lead with what it is, then the character.** People kept asking "who is
Golde?" while the page described her personality. It now says *"Golde is a web
app that helps you plan meals. Nothing to download."* first.

---

## House style

- **No build step, ever.** Plain browser JavaScript, `var`, `function`, no
  framework, no bundler. It deploys by copying files and has never broken
  because of a dependency.
- **Event delegation** through `data-act` attributes into the `ACTIONS` map.
- **Comments explain *why*, and name the evidence.** Most non-obvious code here
  exists because a real person hit a real problem — say whose, and what they
  said. A comment that only restates the code is worse than none.
- **Bump the cache-buster** in `docs/index.html` (`?v=NN`) on every change to
  `app.js` or `styles.css`, or testers see a stale page and report ghosts.
- **Name things in code the way the interface names them.** The roles are
  `planner`, `sender`, `family` — not `organizer`/`neighbor`, which is both the
  wrong spelling and a second vocabulary for the same three people.

### Three visual species, and they must stay distinguishable

A tester said the sections were *"similar in colour, so I wasn't sure what all
the different sections do or mean"*. The fix was structural:

| | Looks like |
|---|---|
| **Golde talking** | no card, a rule down the left. Speech looks like speech. Amber rule = read before you cook. |
| **Something to do** | the only raised white card, with a green left edge |
| **For reference** | flat, tinted, no shadow — never mistakable for a button |

Every group also gets a heading in plain words. If you add a section without
one, you have reintroduced the bug.

---

## Testing

```bash
npm test              # 20 browser suites + slug units + voice-checker cases
npm run check         # voice rules, and the checker's own tests
node tests/run.js qa gate   # named suites only
node tests/run.js --backend # persistence and race tests, needs tests/mockapi.js
```

These drive a real browser and read what a person would see, because **almost
every real defect in this project has been a copy or layout bug that a unit
test would have passed** — a number field silently gating an allergy warning,
an address hidden at the moment it started mattering, a stray `</div>` nesting
every card inside the first.

**Address steps by name, never by click order.** `tests/setup-helper.js`
`walk()` exists because reordering a setup question broke the same three suites
three separate times.

---

## Parked, not deleted

`PARKED_OTHER_WAYS` in `docs/app.js` — "there are other ways to help"
(groceries, a lift, childcare, paper goods). All the machinery is intact:
`KINDS`, the planner's switch for what exists locally, the whole sheet. Two
entry points are commented out. It went away so the board asks for exactly one
thing until people are reliably doing that one thing.

---

## Current state

The front end works. **Nothing behind it has ever run** — the Worker and D1 are
written and tested against a stand-in but never deployed, and the database ID
in `worker/wrangler.toml` is still a placeholder. No message of any kind can be
sent.

See `COWORK.md` for the sequenced next steps and who owns each one.
