# golde. meals — backend

One Cloudflare Worker. It stores meal trains, stops two people taking the same
night, and sends the reminder the evening before over SMS or email.

## Why it's shaped like this

A meal train is a few kilobytes of JSON that is always read and written whole,
so it's stored as one document per train rather than a schema to migrate every
time the front end changes shape.

The one thing that genuinely needs care is two people claiming Tuesday at the
same moment. That's handled by a version check on write —
`UPDATE ... WHERE version = ?` is atomic in D1, so exactly one write lands and
the other gets a 409 with the current state attached. The front end swaps in
the truth and tells the loser warmly; nobody finds out at the door.

Updates reach other people by polling every 7 seconds while their tab is
visible, plus an immediate refresh when they come back to it. A meal train
changes about twenty times in a week — a socket would mean connection state,
reconnection, and a Durable Object per train to save a few seconds on something
that happens twice a day.

## Deploy

```bash
cd worker
npm install -g wrangler
wrangler login

wrangler d1 create golde-meals          # put the id into wrangler.toml
wrangler d1 execute golde-meals --remote --file=./schema.sql

wrangler secret put ADMIN_TOKEN         # any long random string
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
wrangler secret put TWILIO_FROM         # +1555...
# email fallback, optional:
wrangler secret put RESEND_API_KEY

wrangler deploy
```

The Worker serves `../docs` as well, so the app and the API are one origin and
there is no CORS to think about.

## Creating a train

```bash
curl -X POST https://your-worker.workers.dev/api/trains \
  -H "authorization: Bearer $ADMIN_TOKEN" \
  -H "content-type: application/json" \
  -d '{"id":"cohens","data": { ...the train... }}'
```

Then send round `https://your-worker.workers.dev/?t=cohens`.

Without `?t=`, the app runs as the offline demo with no backend at all — which
is what keeps the GitHub Pages version working.

## Reminders

Claiming a night queues a row in `reminders`, keyed on train + slot so it can
never send twice. The cron runs daily at 17:00 UTC and sends anything due.
Swapping or cancelling removes the row while it's still unsent. A send that
fails is left unsent deliberately, so the next run retries — a late reminder
beats none.

**Before the first real train:** check the Twilio number is registered for A2P
10DLC if you're texting US numbers. Without it, messages are filtered. Email is
the fallback until that clears, and the calendar option needs neither.

## Retention

`expires_at` is set from the train's **last day of cooking**, not from when it
was created — a shiva is a week and a recovery can be months. Reads past that
date return "that week is long finished, and I've tucked it away" rather than
deleting anything.
