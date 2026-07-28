# golde. meals — clickable prototype

A front-end-only prototype of **golde.**, a meal train that talks like a warm,
slightly overbearing grandmother instead of a spreadsheet.

The real product is WhatsApp-first with a web board. This prototype can't send
real WhatsApp messages, so it **simulates the thread inside a phone frame** and
shows the board it links to. The point is to test whether the experience and the
voice land with real people — not whether messages deliver.

## The demo moment

A neighbor is in the WhatsApp thread. Golde says the Cohens just had a baby and
need dinners. The neighbor taps the link, the board opens, they grab Tuesday and
type what they're bringing, a gentle allergen check fires, they confirm, and
they land back in the thread with a warm confirmation and a reminder promised.

**Chat → board → chat, one smooth loop.**

## Run it locally

No build step, no dependencies, no npm.

```bash
# any static server works — pick one
python3 -m http.server 8080 --directory docs
# then open http://localhost:8080
```

You can also just open `docs/index.html` directly in a browser; everything is
relative and there is no fetch, no module loading, and no service worker.

## Deploy to GitHub Pages

1. Push this branch.
2. **Settings → Pages → Build and deployment → Source: “Deploy from a branch”.**
3. Pick the branch and set the folder to **`/docs`**. Save.
4. Pages serves `docs/index.html`. `docs/.nojekyll` is there so Jekyll doesn't
   touch the files.

## What's in it

```
docs/
  index.html    device frame + the two surfaces
  styles.css    the design system (cream, deep green, warm and rounded)
  app.js        seed data, the voice, the smart checks, all three roles
  .nojekyll
```

### Three roles, one switcher

A floating **demo** control (bottom right, clearly labelled as demo-only) swaps
between:

- **Organizer** — build and adjust the train, set which days need meals and how
  many slots, edit the recipient's details, see the whole week at a glance, nudge
  the group about open nights, wrap the train.
- **Neighbor** — see what's open *and what everyone else is bringing*, claim a
  night with no login, type a dish, get the gentle checks, swap or cancel without
  guilt, mark a meal delivered.
- **Family** — share loves, dislikes, allergies, kosher needs and headcount with
  low-guilt framing, set drop-off preferences, choose to see what's coming or
  keep it a surprise, pause the week, say thank you.

### The things a database wouldn't do

- **Allergen alerts.** The Cohens carry a `no-nuts` tag. Type *pesto*, *pad thai*
  or *baklava* into a dish and Golde stops you gently before you cook — not at
  the door. Other tags (gluten, eggs, sesame) are togglable in the Family view; shellfish isn't offered — these households keep kosher.
- **Kosher awareness.** Days can prefer meat / dairy / pareve. Type *brisket* on
  a dairy night and she mentions it. It's a suggestion, never a wall.
- **Menu transparency + variety nudge.** Everyone sees the week's dishes.
  Wednesday and Thursday are seeded as two pastas in a row so the nudge has
  something to catch, and typing pasta on Tuesday (next to Monday's ziti) fires
  it live.
- **Delivery coordination.** Two drop-offs on one day get staggered and flagged.
- **Friday rule.** The Shabbos meal has an earlier window with candle-lighting
  shown, and Golde says so on the card, in the claim sheet and in the reminder.
- **The "I don't cook" lane.** Groceries, a gift card, or ordering in — all
  first-class, none treated as lesser.

### Seed data

One train: *Meals for the Cohens*, new baby, Sunday Aug 2 – Shabbos Aug 8.
Household of five, two little ones, keeps kosher (meat and dairy separate), a
real nut allergy, dislikes mushrooms, loves chicken soup, anything with lemon,
and a challah that isn't from the store. About half the week is pre-filled,
including the seeded pasta collision and a groceries contribution. The chat
thread drops you into a conversation already in motion.

## Constraints this prototype holds to

- **No backend, no build step, no accounts.** Vanilla JS, one script tag.
- **No storage APIs.** Nothing uses `localStorage`, `sessionStorage`, cookies or
  IndexedDB. Everything lives in one in-memory object and resets on reload — the
  demo control has a "Start the demo over" button for the same reason.
- **No real phone numbers, no real messages, no real payments.** The donation
  button says thank you and charges nothing.
- **Desktop** renders inside a centered phone frame so it reads as a device
  emulator. **Under 640px** the frame drops away and it goes full-bleed and
  thumb-first.

## A note on the copy

Every user-facing string is the feature. She's warm, a little bossy in a caring
way, endlessly flexible, and she never guilts anybody — especially not the family
receiving the meals or the person who has to cancel. There is no "Error", no
"Invalid", no "Slot filled" anywhere in this app. If a string reads like a
database, it's a bug worth filing.

## Screenshots

`screenshots/` holds desktop (1280px, in the phone frame) and mobile (390px,
full-bleed) captures of the whole loop, including the allergen check firing
mid-flow. They live outside `docs/` so they aren't served by Pages.

## Words she does not say

```bash
npm run check          # or: node tools/check-voice.js
```

Fails the build if a banned word reaches a user-facing string. It exists
because a tester asked "Why is it calling me sweetheart?" and answered her own
question — "I didn't like it." A pet name from a stranger's software is
presumption wearing the costume of warmth.

Removing the words once was not enough: one came straight back in the Worker,
written the same day, and the check caught it. Install the hook so it cannot
happen again:

```bash
ln -sf ../../tools/pre-commit .git/hooks/pre-commit
```

Banned outright: sweetheart, sweetie, mammele, bubbele, darling, dearie,
poppet, "my dear". Banned only as a form of address, since they're innocent as
nouns: honey, hon, dear, love, sugar — "honey cake" and "they love lemon" pass,
"Thanks, love" does not.

**The warmth is in what she notices and what she takes off your plate.** It is
not in what she calls you. If a line only sounds warm because of the name at
the end of it, the line isn't warm.
