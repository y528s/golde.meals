# golde. meals — handoff

Everything needed to pick this up cold. Read the first three sections before
touching anything; the rest is reference.

---

## 1. What this is

A meal train for observant Jewish communities, coordinated by **Golde** — a
warm, competent character who notices things a spreadsheet can't. Somebody has
a baby, a surgery, a death in the family; twenty neighbours want to help; the
coordination is a mess of group chats and nobody knows what anyone else is
bringing.

**The product is one link.** The planner sets a train up by messaging Golde on
WhatsApp; she hands back a link; they paste it into the group chats they
already have; neighbours tap it, take a night, and get reminded.

**Live demo:** https://y528s.github.io/golde.meals/ (front-end only, resets on
reload) · **Branch:** `claude/golde-meals-prototype-ci4f0z` · **PR #1**

---

## 2. Status — what is real and what is not

| | State |
|---|---|
| Front end, all three roles, every flow | **Done**, browser-tested |
| Backend (Cloudflare Worker + D1) | **Written and logic-tested. Never deployed.** |
| Reminders over SMS/email | **Written. Never sent a real message.** |
| Calendar (`.ics`) reminders | **Done and real** — generated in-browser, no backend |
| WhatsApp Business API | **Not started, and mostly not needed** — see §3 |
| Payments, cookbook, saved circles | Not started |

**The single most important caveat:** nobody has ever run the Worker on
Cloudflare. The logic is proven against a local stand-in that implements the
same contract (`tests/mockapi.js`), including the version check and the
conflict response. Deploying is ~15 minutes and needs a Cloudflare account.
Until that is done, treat the backend as unproven in production.

---

## 3. The constraint that shapes everything

**A business cannot be a member of a WhatsApp group.** The WhatsApp Business
Platform is one-to-one only. Unofficial libraries (Baileys, whatsapp-web.js)
can post to groups and will get the number banned.

This kills the obvious idea — "Golde announces the train in the neighbourhood
chat" — and it is why the product is shaped the way it is:

| Stage | Where it happens | Why it is allowed |
|---|---|---|
| **Setup** | Real WhatsApp, conversational | The planner messages her *first*, which opens the 24-hour window in which a business may reply free-form, with no pre-approved templates |
| **Sharing** | The planner pastes a link into their own group | A human sending a link |
| **Signing up** | The web app | No messaging involved |
| **Reminders** | 1:1 SMS / WhatsApp / email / calendar | They chose a channel and gave a number when they signed up — that *is* the opt-in |

Two consequences worth internalising:

- **The signup is the opt-in.** It is the only moment Golde is entitled to ask
  how to reach somebody, so she asks once and never again.
- **Getting off the API is a feature, not a compromise.** Outside the 24-hour
  window WhatsApp only permits pre-approved templates with `{{1}}` slots —
  the exact opposite of a character who improvises. The voice is the product,
  and the API would have muzzled it.

**Verify current Meta policy before building on any of this.** It changes, and
this was written against knowledge with a cutoff.

---

## 4. Run it

```bash
npm install                 # playwright-core, for the tests
npm run serve               # http://localhost:8080
npm run check               # the voice rules — see §7
npm test                    # 13 browser suites against the static app
npm run test:backend        # persistence + the double-claim race
```

No build step. `docs/` is three files and a `.nojekyll`; open `index.html`
directly if you like.

**Deploy the front end:** GitHub Pages, deploy from a branch, folder `/docs`.
Bump the `?v=` on the script tags in `index.html` on every deploy or browsers
serve stale files — this genuinely bit us.

**Deploy the backend:** see `worker/README.md`.

---

## 5. Architecture

```
docs/index.html      device frame, three surfaces, script tags (mind the ?v=)
docs/styles.css      design system — cream, warm forest green, deliberately
                     NOT WhatsApp's #075E54
docs/sync.js         talks to the backend; inert with no ?t= in the URL, which
                     is what keeps the public demo working with nothing behind it
docs/app.js          everything else: seed data, the voice, the checks, all
                     three roles, the setup conversation
worker/src/index.js  the Worker: store a train, stop double-claims, queue and
                     send reminders
tools/check-voice.js the banned-words check (§7)
tests/               browser suites + a stand-in API + a runner
```

**One train is one JSON document.** A few kilobytes, always read and written
whole, so there is no schema to migrate every time the front end changes shape.

**Concurrency is handled on the write, not the read.** Writes carry the version
they were based on; `UPDATE ... WHERE version = ?` is atomic, so exactly one of
two simultaneous claims lands. The loser gets the current state back, the page
swaps it in, and Golde says *"Somebody got there a moment before you. Nothing's
lost — here's how it stands now."* **A conflict is never shown as an error** —
from that person's seat, nothing went wrong.

**Updates propagate by polling** every 7s while the tab is visible, plus an
immediate refresh on focus. Measured at ~3s in testing. A socket would mean
connection state, reconnection and a Durable Object per train to save a few
seconds on something that happens twice a day.

**No accounts, anywhere.** The link is the credential. Fine at this scale;
revisit before it is not.

---

## 6. Product decisions, and why

These came from real feedback or real reasoning. Changing them is fine —
changing them *without knowing why they are there* is not.

- **No endearments.** A tester asked "Why is it calling me sweetheart?" and
  answered herself: "I didn't like it." A pet name from a stranger's software is
  presumption wearing the costume of warmth. Enforced by `npm run check`.
- **She sounds different at a shiva.** Occasions carry a register — bright,
  tender, quiet. At a shiva the variety nudge is suppressed (nobody grieving
  cares that Monday was also pasta) and **the donation ask is not shown at all**.
  Asking for money at the end of a week of mourning is not something to word
  carefully; it is something not to do.
- **The address is hidden until you claim a night.** The link is designed to be
  forwarded, so it will travel far past the people it was meant for. Handing all
  of them the street address of a woman who gave birth four days ago is not a
  trade worth making.
- **The family cannot broadcast a pause once anybody has claimed.** Calling off a
  dinner somebody already shopped for is waste with a kind face on it. They get
  routed to the planner with the message pre-written; a person can judge it, a
  broadcast can't.
- **The allergen check is keyword matching and says so.** *"I can only read
  words — please read the actual label."* The warmth could otherwise imply a
  guarantee the code cannot make, and the person relying on it is a child.
  There is a free-text allergy field because five preset tags cannot cover
  dairy, soy or strawberries, and it really does fire the check.
- **Every other day is the first cadence option.** It is what planners actually
  run, and four nights is a far easier ask of twenty people than seven.
- **Adults and children are counted separately.** Two adults and three children
  is a different shop from five adults.
- **Recipes ask permission at the moment of writing** — *"Just Sarah"* or
  *"Sarah, and the book"*. Capturing consent later means chasing forty people,
  and the ones who moved or died you simply cannot use.
- **Roles are Planner / Sender / Recipient.** Not "neighbour" — it isn't
  geographical, half of them are shul or family. No word in the UI splits on
  US/UK spelling, which rules out organiser/organizer.
- **The app does not imitate WhatsApp.** It did, and it confused people into
  thinking their real WhatsApp had misbehaved. Only the *setup* screen is
  chat-styled, because there it is the medium rather than a costume.

---

## 7. The voice

Every user-facing string is the feature. She is warm, brief, and never guilts
anybody — least of all the family receiving, or the person who has to cancel.
There is no "Error", no "Invalid", no "Slot filled" anywhere.

```bash
npm run check
```

Fails the build on banned words, naming file, line and reason. A pre-commit
hook is included (`ln -sf ../../tools/pre-commit .git/hooks/pre-commit`).

This check exists because removing the words once was **not** enough: I stripped
every endearment from the app and then wrote one straight back into the Worker
the same day. Writing in her voice reintroduces them without anybody deciding to.

**The warmth is in what she notices and what she takes off your plate. It is not
in what she calls you.** If a line only sounds warm because of the name at the
end of it, the line isn't warm.

---

## 8. Testing

`npm test` drives a real browser through the real app and reads what a person
would see. That is deliberate: nearly every defect worth catching here has been
a copy or layout bug that a unit test would have sailed past. Real examples the
suites caught that review did not:

- the phone-number field silently gating the **allergen warning**
- folding a panel hid the **address** at the exact moment it starts mattering
- compacting a night removed the family's only way to **ask for its recipe**
- `nudge()` referencing an undefined variable after a refactor

`npm run test:backend` starts a stand-in API and runs two real browsers against
it: a claim survives a reload, a second person sees it, and **both claiming the
same night at the same instant** resolves to one owner with both screens
agreeing.

---

## 9. Next steps, in order

1. **Deploy the Worker** (`worker/README.md`, ~15 min). Nothing is real until
   this is done.
2. **Check Twilio A2P 10DLC registration.** Unregistered US application-to-person
   SMS gets filtered. If it is not cleared, use email; calendar needs neither.
3. **Run one real train with one real family.** Set it up by hand. You are the
   fallback if it breaks — say so to them upfront.
4. Then, in rough value order: persistent circles across trains (the paid hook),
   the cookbook view, payments.

**Before a real family uses it:** a privacy line on the claim form, a way for
them to have their train deleted, and a decision about who holds the data. You
will be storing a home address, dietary and religious observance, and the reason
people are cooking — which in the UK/EU shades into special-category data.

---

## 10. Open questions

- **Does the character survive contact with people?** One tester liked the
  prompts and the reminders; the same tester disliked being called sweetheart.
  The endearments are gone, but nobody has yet confirmed the *rest* of the voice
  earns its keep. That is the biggest unknown in the product.
- **Is "yente" the wrong target?** A yente is a busybody, and nobody wants a
  busybody running their meal train. What is actually built is someone competent
  who has done this a hundred times. Sharpening toward that may be the move.
- Pricing is unvalidated. The reasoning — bill the planner, never the family,
  and charge for the thing that has a real unit cost — is in the PR history.
