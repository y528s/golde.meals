/* =============================================================================
   golde. meals — the small backend
   -----------------------------------------------------------------------------
   Deliberately small. One meal train is a few kilobytes of JSON that is always
   read and written whole, so there is no schema to argue with and nothing to
   migrate when the front end changes shape.

   Three jobs:
     1. Hold the train, and let several people edit it without losing anybody's
        night — see the version check in PUT.
     2. Queue reminders when somebody claims a night.
     3. Send them the evening before, over SMS or email.

   Everything it says to a person is in Golde's voice, including the failures.
   ============================================================================= */

import { parsePath, randomSuffix } from "./slug.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: JSON_HEADERS });
}

/* Errors a person might read are written the way she'd say them. */
function oops(status, said) {
  return json({ ok: false, said: said }, status);
}

function nowISO() { return new Date().toISOString(); }

/* ---------------------------------------------------------------------------
   Routing
   --------------------------------------------------------------------------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      try {
        return await api(request, env, url, ctx);
      } catch (err) {
        console.error("unhandled", err && err.stack);
        return oops(500, "Something went wrong at my end, not yours. Try again in a moment.");
      }
    }

    /*
       /meals/3250/cohen-08-26-k7f2  — one train
       /meals/3250/                  — that planner's own desk

       See slug.js for why the address is shaped this way and why the random
       suffix is load-bearing rather than decorative.
    */
    const addr = parsePath(path);
    if (addr) {
      const known = await env.DB.prepare(
        "SELECT 1 FROM trains WHERE id = ? AND planner_key = ?"
      ).bind(addr.slug, addr.planner).first();

      if (known) {
        const rewritten = new URL(request.url);
        rewritten.pathname = "/";
        rewritten.searchParams.set("t", addr.slug);
        return env.ASSETS.fetch(new Request(rewritten.toString(), request));
      }
      return oops(404, "I can't find that one. Check the link, or ask whoever sent it to you.");
    }

    /*
       A planner's desk. This is the part that has to be gated.

       The id is random, which makes walking the namespace impractical — but a
       desk lists everything a planner is running, so guessing one would expose
       several families at once. That is worth a session on top rather than
       leaning on the id alone.

       No password. The planner puts in their number and gets a link by text —
       which is also exactly how somebody moves from their phone to a laptop.
    */
    const desk = /^\/meals\/([a-z0-9]{4,10})\/?$/i.exec(path);
    if (desk) {
      return plannerDesk(request, env, url, desk[1]);
    }

    /* Everything else is the prototype itself. */
    return env.ASSETS.fetch(request);
  },

  /* The evening-before reminders. */
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendDueReminders(env));
  }
};

async function api(request, env, url, ctx) {
  const parts = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean);
  const method = request.method.toUpperCase();

  // POST /api/trains                     create one (admin only)
  if (parts[0] === "trains" && parts.length === 1 && method === "POST") {
    return createTrain(request, env);
  }

  // GET  /api/trains/:id                 read it
  // PUT  /api/trains/:id                 write it, if nobody beat you to it
  if (parts[0] === "trains" && parts.length === 2) {
    if (method === "GET") return readTrain(env, parts[1]);
    if (method === "PUT") return writeTrain(request, env, parts[1], ctx);
  }

  return oops(404, "I don't know that one.");
}

/* ---------------------------------------------------------------------------
   Reading and writing a train
   --------------------------------------------------------------------------- */

async function readTrain(env, id) {
  const row = await env.DB.prepare(
    "SELECT version, data, expires_at FROM trains WHERE id = ?"
  ).bind(id).first();

  if (!row) {
    return oops(404, "I can't find that one. Check the link, or ask whoever sent it to you.");
  }
  if (row.expires_at && row.expires_at < nowISO()) {
    return oops(410, "That week is long finished, and I've tucked it away.");
  }

  return json({ ok: true, version: row.version, data: JSON.parse(row.data) });
}

/*
   The version check is the whole point of this function.

   Two people open the board. Both see Tuesday free. Both tap it. Without this,
   the second write silently overwrites the first and one of them turns up on
   Tuesday with a casserole nobody is expecting.

   UPDATE ... WHERE version = ? is atomic in D1, so exactly one of them wins.
   The loser gets a 409 with the current state attached, and the front end tells
   them warmly rather than making them find out at the door.
*/
async function writeTrain(request, env, id, ctx) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return oops(400, "I couldn't make sense of that. Try again.");
  }

  if (typeof body.version !== "number" || !body.data) {
    return oops(400, "Something's missing from that. Reload the page and have another go.");
  }

  const serialised = JSON.stringify(body.data);
  if (serialised.length > 512 * 1024) {
    return oops(413, "That's an awful lot for one week. Something has gone wrong.");
  }

  const result = await env.DB.prepare(
    "UPDATE trains SET data = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?"
  ).bind(serialised, nowISO(), id, body.version).run();

  if (!result.meta.changes) {
    /* Either it's gone, or somebody wrote first. Tell them which, and hand back
       the truth so the page can right itself without a reload. */
    const current = await env.DB.prepare(
      "SELECT version, data FROM trains WHERE id = ?"
    ).bind(id).first();

    if (!current) return oops(404, "I can't find that one any more.");

    return json({
      ok: false,
      conflict: true,
      version: current.version,
      data: JSON.parse(current.data),
      said: "Somebody got there a moment before you. Nothing's lost — here's how it stands now."
    }, 409);
  }

  /* Queue anything new that needs reminding about. Doing this after the write
     means a queued reminder always refers to a night that really is claimed. */
  if (ctx) ctx.waitUntil(queueReminders(env, id, body.data));

  return json({ ok: true, version: body.version + 1 });
}

async function createTrain(request, env) {
  const auth = request.headers.get("authorization") || "";
  if (!env.ADMIN_TOKEN || auth !== "Bearer " + env.ADMIN_TOKEN) {
    return oops(401, "That's not for you, I'm afraid.");
  }

  const body = await request.json();
  if (!body.id || !body.data) return oops(400, "I need an id and a train.");

  /* Retention runs from the last day of cooking, not from today: a shiva is a
     week and a recovery can be months. Archived, never deleted, unless asked. */
  const end = (body.data.train && body.data.train.end) || null;
  const expires = end
    ? new Date(new Date(end + "T12:00:00Z").getTime() + 365 * 864e5).toISOString()
    : null;

  try {
    await env.DB.prepare(
      "INSERT INTO trains (id, version, data, created_at, updated_at, expires_at) VALUES (?, 1, ?, ?, ?, ?)"
    ).bind(body.id, JSON.stringify(body.data), nowISO(), nowISO(), expires).run();
  } catch (e) {
    return oops(409, "There's already one of those.");
  }

  return json({ ok: true, id: body.id, version: 1 });
}

/* ---------------------------------------------------------------------------
   The planner's desk
   --------------------------------------------------------------------------- */

/*
   Held behind a token the planner receives by text, for the reason given at the
   route. The token is stored rather than signed so that it can be revoked, and
   it is compared in constant time so that a timing attack cannot walk it out a
   character at a time.
*/
async function plannerDesk(request, env, url, plannerKey) {
  const supplied = url.searchParams.get("k") || cookieValue(request, "golde_desk");
  if (supplied) {
    const row = await env.DB.prepare(
      "SELECT token FROM planners WHERE planner_key = ?"
    ).bind(plannerKey).first();

    if (row && timingSafeEqual(row.token, supplied)) {
      const rewritten = new URL(request.url);
      rewritten.pathname = "/";
      rewritten.searchParams.set("desk", plannerKey);
      const res = await env.ASSETS.fetch(new Request(rewritten.toString(), request));
      const out = new Response(res.body, res);
      /* So the link only has to be followed once per device. */
      out.headers.append("set-cookie",
        "golde_desk=" + supplied + "; Path=/meals/" + plannerKey +
        "; Max-Age=7776000; HttpOnly; Secure; SameSite=Lax");
      return out;
    }
  }

  /* No token: say whose desk it is and offer the way in, without confirming
     anything about who they are or what they are running. */
  return new Response(deskGate(plannerKey), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
  });
}

function deskGate(plannerKey) {
  return '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>golde.</title>' +
    '<style>body{font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;' +
    'background:#FAF7F0;color:#2B2721;margin:0;display:grid;place-items:center;min-height:100dvh;' +
    'padding:24px}main{max-width:26rem}h1{font-family:Georgia,serif;font-weight:400;font-size:2rem;' +
    'color:#1F5346;margin:0 0 .5rem}p{color:#4A443C}input,button{font:inherit;width:100%;' +
    'box-sizing:border-box;border-radius:999px;padding:.85rem 1.1rem;margin-top:.6rem}' +
    'input{border:1.5px solid #E2D9C7}button{border:0;background:#1F5346;color:#fff;font-weight:600}' +
    '</style><main><h1>golde.</h1>' +
    "<p>This desk belongs to somebody. If it's yours, put in your number and I'll text you " +
    "a link straight to it — no password to remember, and it works just as well on a laptop.</p>" +
    '<form method="post" action="/api/desk-link">' +
    '<input type="hidden" name="planner" value="' + plannerKey + '">' +
    '<input name="phone" type="tel" placeholder="Your mobile number" autocomplete="tel">' +
    "<button>Text me the link</button></form></main>";
}

function cookieValue(request, name) {
  const raw = request.headers.get("cookie") || "";
  const hit = raw.split(";").map(c => c.trim()).find(c => c.startsWith(name + "="));
  return hit ? hit.slice(name.length + 1) : null;
}

/* Compare without leaking where two strings first differ. */
function timingSafeEqual(a, b) {
  a = String(a || ""); b = String(b || "");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------------------------
   Reminders
   --------------------------------------------------------------------------- */

/*
   One row per claimed night, keyed on train + slot, so running this twice
   cannot produce two texts. If somebody swaps or cancels, the stale row is
   removed while it is still unsent.
*/
async function queueReminders(env, trainId, data) {
  const train = data.train || {};
  const days = data.days || [];
  const wanted = [];

  for (const day of days) {
    if (!day.needed) continue;
    for (const slot of day.slots || []) {
      if (!slot.filled) continue;
      if (!slot.channel || slot.channel === "none" || slot.channel === "calendar") continue;
      if (!slot.handle) continue;

      /* The evening before, not the morning of — people shop the night before. */
      const sendAfter = new Date(day.iso + "T17:00:00Z");
      sendAfter.setUTCDate(sendAfter.getUTCDate() - 1);

      wanted.push({
        id: trainId + ":" + slot.id,
        slot_id: slot.id,
        send_after: sendAfter.toISOString(),
        channel: slot.channel === "email" ? "email" : "sms",
        handle: slot.handle,
        body: reminderText(train, day, slot)
      });
    }
  }

  const keep = new Set(wanted.map(function (w) { return w.id; }));

  /* Drop reminders for nights that have since been given up. Only unsent ones —
     a text that has already gone out is history, not state. */
  const existing = await env.DB.prepare(
    "SELECT id FROM reminders WHERE train_id = ? AND sent_at IS NULL"
  ).bind(trainId).all();

  const stale = (existing.results || [])
    .map(function (r) { return r.id; })
    .filter(function (id) { return !keep.has(id); });

  const statements = [];
  for (const id of stale) {
    statements.push(env.DB.prepare("DELETE FROM reminders WHERE id = ?").bind(id));
  }
  for (const w of wanted) {
    statements.push(env.DB.prepare(
      "INSERT INTO reminders (id, train_id, slot_id, send_after, channel, handle, body) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(id) DO UPDATE SET send_after = excluded.send_after, " +
      "channel = excluded.channel, handle = excluded.handle, body = excluded.body " +
      "WHERE reminders.sent_at IS NULL"
    ).bind(w.id, trainId, w.slot_id, w.send_after, w.channel, w.handle, w.body));
  }

  if (statements.length) await env.DB.batch(statements);
}

/* Her voice, in 320 characters, with everything a cook needs and nothing else. */
function reminderText(train, day, slot) {
  const dow = new Date(day.iso + "T12:00:00Z")
    .toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });

  const bits = ["Tomorrow's your night for " + (train.recipientFamily || "them") + "."];
  bits.push("You said: " + slot.dish + ".");

  const when = day.candle
    ? "At the door by " + day.to + " — candles are at " + day.candle + "."
    : "Anytime between " + day.from + " and " + day.to + ".";
  bits.push(when);

  const who = [];
  if (train.household) who.push(train.household + " to feed");
  if ((train.allergies || []).indexOf("no-nuts") > -1) who.push("no nuts");
  if (who.length) bits.push(who.join(", ") + ".");

  if (train.address) bits.push(train.address + ".");
  bits.push("You've got this. — golde.");

  void dow;
  return bits.join(" ");
}

async function sendDueReminders(env) {
  const due = await env.DB.prepare(
    "SELECT * FROM reminders WHERE sent_at IS NULL AND send_after <= ? LIMIT 100"
  ).bind(nowISO()).all();

  for (const r of due.results || []) {
    try {
      if (r.channel === "sms") await sendSMS(env, r.handle, r.body);
      else await sendEmail(env, r.handle, r.body);

      await env.DB.prepare("UPDATE reminders SET sent_at = ?, error = NULL WHERE id = ?")
        .bind(nowISO(), r.id).run();
    } catch (err) {
      /* Left unsent on purpose so the next run tries again. A reminder that
         arrives late still beats one that never arrives. */
      await env.DB.prepare("UPDATE reminders SET error = ? WHERE id = ?")
        .bind(String(err && err.message).slice(0, 400), r.id).run();
      console.error("reminder failed", r.id, err);
    }
  }
}

async function sendSMS(env, to, body) {
  if (!env.TWILIO_ACCOUNT_SID) throw new Error("Twilio is not configured");

  const res = await fetch(
    "https://api.twilio.com/2010-04-01/Accounts/" + env.TWILIO_ACCOUNT_SID + "/Messages.json",
    {
      method: "POST",
      headers: {
        authorization: "Basic " + btoa(env.TWILIO_ACCOUNT_SID + ":" + env.TWILIO_AUTH_TOKEN),
        "content-type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ To: to, From: env.TWILIO_FROM, Body: body })
    }
  );

  if (!res.ok) throw new Error("Twilio " + res.status + " " + (await res.text()).slice(0, 200));
}

async function sendEmail(env, to, body) {
  if (!env.RESEND_API_KEY) throw new Error("Email is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: "Bearer " + env.RESEND_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || "golde. <hello@golde.meals>",
      to: [to],
      subject: "Tomorrow's your night",
      text: body
    })
  });

  if (!res.ok) throw new Error("Email " + res.status + " " + (await res.text()).slice(0, 200));
}
