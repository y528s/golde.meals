#!/usr/bin/env node
/* =============================================================================
   Build the calendar table from hebcal.com
   -----------------------------------------------------------------------------
     node tools/fetch-calendar.js --year 2026 --geo "Lakewood, NJ"

   Writes docs/calendar-data.js — parshiyot, yom tov, fast days and candle
   lighting times for a real place.

   This is a build step and not a runtime call on purpose. The app must work
   with no network and no third-party dependency at page load, and a meal train
   should not break because somebody else's API is having a bad afternoon.

   Hebcal's data is the authority here rather than anything computed locally.
   The calendar is intricate enough — leap years, the dechiyot, doubled
   parshiyot that split differently in Israel — that a hand-rolled version would
   look authoritative while being quietly wrong, and "Parashat Vayishlach" when
   it is Vayeitzei reads as an outsider guessing rather than as a bug.

   Hebcal is free, has no key, and asks that you cache rather than hammer it.
   That is exactly what this does.
   ============================================================================= */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf("--" + name);
  return i > -1 ? args[i + 1] : fallback;
};

const year = arg("year", String(new Date().getFullYear()));
const geonameid = arg("geonameid", "5100280");        // Lakewood, NJ
const out = path.join(__dirname, "..", "docs", "calendar-data.js");

/* maj = yom tov, min = minor fasts, s = parsha, c = candle lighting */
const url = "https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=off&nx=off" +
  "&year=" + year + "&month=x&ss=off&mf=off&c=on&geo=geoname&geonameid=" + geonameid +
  "&M=on&s=on&lg=ashkenazi";

(async () => {
  console.log("fetching " + year + " from hebcal…");
  const res = await fetch(url);
  if (!res.ok) throw new Error("hebcal returned " + res.status);
  const data = await res.json();

  const days = {};
  const put = (iso, patch) => { days[iso] = Object.assign(days[iso] || {}, patch); };

  for (const item of data.items) {
    const iso = (item.date || "").slice(0, 10);
    if (!iso) continue;

    if (item.category === "parashat") {
      /* Hebcal dates the parsha on the Shabbat; the meal train cares about the
         Friday that leads into it, since that is when somebody cooks. */
      const fri = new Date(iso + "T12:00:00Z");
      fri.setUTCDate(fri.getUTCDate() - 1);
      put(fri.toISOString().slice(0, 10), { parsha: item.title.replace(/^Parashat\s+/, "") });
    }
    if (item.category === "candles") {
      const t = /(\d{1,2}:\d{2})/.exec(item.title);
      if (t) put(iso, { candles: t[1] });
    }
    if (item.category === "holiday" && item.yomtov) put(iso, { yomtov: item.title });
    if (item.category === "fast") put(iso, { fast: item.title });
  }

  const isos = Object.keys(days).sort();
  const body =
    "/* GENERATED — do not edit. node tools/fetch-calendar.js --year " + year + "\n" +
    "   Source: hebcal.com, diaspora schedule, geonameid " + geonameid + "\n" +
    "   Built " + new Date().toISOString().slice(0, 10) + " */\n" +
    "goldeCalendar.load(\n" +
    JSON.stringify(days, null, 0) + ",\n" +
    JSON.stringify(isos[0]) + ", " + JSON.stringify(isos[isos.length - 1]) + ");\n";

  fs.writeFileSync(out, body);
  console.log("wrote " + out);
  console.log("  " + isos.length + " dated entries, " + isos[0] + " to " + isos[isos.length - 1]);
  console.log("  " + Object.values(days).filter(d => d.parsha).length + " parshiyot, " +
              Object.values(days).filter(d => d.yomtov).length + " yom tov, " +
              Object.values(days).filter(d => d.fast).length + " fasts");
  console.log("\nAdd <script src=\"calendar-data.js\"></script> after hebcal.js in index.html.");
})().catch(e => { console.error("failed: " + e.message); process.exit(1); });
