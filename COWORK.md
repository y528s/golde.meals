# Next steps

Sequenced, with an owner on each. **Yosef** means it needs an account, a
payment method or a human decision and cannot be delegated. **Cowork** means an
agent can do it start to finish once its precondition is met.

Read `CLAUDE.md` first. The five rules there apply to every task below.

---

## Where this stands

The front end works and has been shaped by eight testers. Nothing behind it has
ever run: the Worker and database are written and tested against a stand-in but
never deployed, and no message of any kind can be sent. Everything below is
about closing that gap.

**The real blocker is not technical.** It is step 6 — finding one family and
one planner willing to run one real week.

---

## 1 · Deploy the Worker and database — **Yosef, then Cowork**

**Yosef, first:** create a Cloudflare account (free tier is enough), install
Wrangler, and run `wrangler login`.

**Then Cowork can do the rest:**

```bash
cd worker
wrangler d1 create golde-meals            # prints a database_id
# put that id into wrangler.toml, replacing PUT-YOUR-D1-DATABASE-ID-HERE
wrangler d1 execute golde-meals --remote --file=./schema.sql
wrangler secret put ADMIN_TOKEN           # any long random string
wrangler deploy
```

**Acceptance:** `curl -X POST https://<worker>/api/trains` with the admin token
returns a train id, and `GET /api/trains/<id>` returns it back. Then open the
deployed URL with `?t=<token>` and confirm two browser tabs see each other's
claims within about 7 seconds.

**Watch for:** the Worker serves `docs/` as static assets too, so the deployed
URL replaces GitHub Pages. Check the cache-buster is bumped or you will be
debugging a stale page.

---

## 2 · Turn on email reminders — **Yosef, then Cowork**

Email first because it needs approval from nobody and works everywhere
immediately. This is the fastest route to a reminder that actually arrives.

**Yosef:** a Resend account and a domain you control, verified for sending.

**Cowork:**

```bash
wrangler secret put RESEND_API_KEY
wrangler secret put EMAIL_FROM            # e.g. golde@yourdomain.com
```

Then send yourself one, end to end: create a train, claim a night with your own
email, and force the cron with `wrangler dev --test-scheduled` and
`curl "http://localhost:8787/__scheduled"`.

**Acceptance:** an email arrives, addressed correctly, with the right night and
dish in it, and the `reminders` row has `sent_at` set.

---

## 3 · Fill in the Jewish calendar — **Cowork**

No precondition. It failed here only because this environment cannot reach
hebcal.com.

```bash
npm run calendar          # writes docs/calendar-data.js
```

**Acceptance:** open the board on a Friday in the generated range and confirm
the parsha and candle time appear. Then check a date **outside** the range and
confirm the app says nothing at all — that silence is the feature, and rule 5
in `CLAUDE.md` explains why.

**Do not** hand-write parsha dates if the command fails. Ask instead.

---

## 4 · Stop polling when nobody is looking — **Cowork**

No precondition, and it should be done before the first real train.

The board polls every 7 seconds while the tab is visible. A phone left on a
kitchen counter is roughly **12,000 requests a day** — eight such tabs would
exhaust Cloudflare's free tier on their own. A hundred people looking for two
minutes each costs about 1,700.

In `docs/sync.js`, stop the timer after a few minutes without interaction and
restart it on the next touch, click or focus.

**Acceptance:** a test that leaves the page untouched and confirms polling has
stopped, and that a click restarts it.

---

## 5 · The front page and lead capture — **Yosef, then Cowork**

**Yosef, first — three things only you have:**
- the display typeface used on the sister site
- its exact hex values
- the logo mark as an SVG

**Then Cowork:** build the meals landing page in that system. The structure is
settled and matches the sister site — hero with the phone, the story, three
numbered steps, the Shabbat section, the capture form, the FAQ, the dark green
closing band.

**The capture goes at the end, after a demo, not in front of it.** Asking
before somebody has seen anything converts badly and contradicts the "nothing
is saved" promise on every screen. Fields: first name, WhatsApp number, email
optional. One new `POST /api/signups` route on the Worker.

**Acceptance:** a submission lands in the database and an email reaches
whoever is fielding them.

---

## 6 · One real week — **Yosef**

One family. One planner who can be phoned. Somebody watching every message.

**Not a pilot programme — one train.** This is the step that produces the real
defect list; everything above is preparation. Do not start a second until the
first has finished.

**Acceptance:** the family ate, and the planner would use it again without
being asked.

---

## 7 · An operator view — **Cowork, immediately after step 6 begins**

Right now nobody can answer *"did her reminder actually go out?"* without
reading the database by hand. That question arrives on day one of real use.

A single token-gated page: trains, claims, and every reminder row with its
`sent_at` and `error`. Twenty lines of HTML on the existing planner-desk
plumbing.

**Acceptance:** you can answer that question from a screen, on a phone, while
somebody is on the line.

---

## 8 · WhatsApp — **Yosef starts now, Cowork finishes later**

**Start the paperwork today, in parallel with step 1.** It is queueing, not
building, and it is the longest pole by weeks.

Meta Business verification, then a phone number, then a **pre-approved message
template** for the reminder. The setup conversation is legal free-form because
the planner messages first, which opens a 24-hour window — but the reminder
goes days later, outside it, so it needs a template Meta signs off.

**Cowork, once approved:** add the send path beside `sendSMS` and `sendEmail` in
`worker/src/index.js`. The channel is already a field rather than a branch, so
this needs no migration.

**Before then:** the app must not offer WhatsApp as a reminder channel it cannot
deliver on. That inconsistency is already fixed — do not reintroduce it.

---

## 9 · US SMS, only if needed — **Yosef**

Twilio, plus **A2P 10DLC registration** for US numbers. Unregistered traffic is
filtered silently rather than rejected loudly, which is the worst failure mode:
reminders appear to send and never arrive. Israeli and UK numbers are
unaffected.

Skip this entirely unless a US community is actually waiting.

---

## Open questions for a product decision

1. **Does the email requirement stay?** Name, number and email are all required
   to take a night. It will cost some signups. One line to relax.
2. **Minisite now or wait for WhatsApp?** Recommendation is minisite — the only
   thing genuinely needing WhatsApp is the reminder, and that is the piece
   gated on weeks of Meta approval.
3. **Does the voice earn its keep over time?** Six testers have praised the
   concept; one said *"the interaction style of a person talking to me takes
   some getting used to."* Nobody has yet used this weekly rather than looking
   at it once. This is the biggest open question in the product and only step 6
   answers it.

---

## Standing rules for any agent picking this up

- Run `npm test` and `npm run check` before committing. Both are fast.
- Bump `?v=NN` in `docs/index.html` for any change to `app.js` or `styles.css`.
- Screenshot the result at 390px wide and **look at it**. Two real bugs this
  week — a stray `</div>` and a clipped wordmark — were invisible in the diff
  and obvious in the picture.
- Never weaken `tests/people.js`. See rule 1 in `CLAUDE.md`.
- If a step above is blocked, do every step that is not, and say plainly which
  one you left and why.
