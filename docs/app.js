/* =============================================================================
   golde. meals — front-end-only prototype
   -----------------------------------------------------------------------------
   No backend. No accounts. No storage APIs. Everything below lives in memory
   and disappears when you close the tab — on purpose.

   The voice is the product. Every user-facing string in this file is supposed
   to sound like a kind, loving neighbor who is also a slightly overbearing
   Jewish grandmother: warm, a little bossy, endlessly flexible, never a
   database. If a string here reads like a system message, it's a bug.
   ============================================================================= */

(function () {
  "use strict";

  /* ===========================================================================
     1. SEED DATA — one demo meal train, richly filled
     =========================================================================== */

  function seed() {
    return {
      train: {
        recipientFamily: "the Cohens",
        recipientContact: "Sarah & Dovid Cohen",
        title: "Meals for the Cohens",
        occasion: "new-baby",
        start: "2026-08-02",
        end: "2026-08-08",
        peopleReached: 23,
        wrapped: false,
        paused: false,
        planner: "Rivky Weiss",
        plannerPhone: "15550142288",

        /* Three bands rather than a headcount, because a teenager eats more
           than an adult and a four-year-old eats almost nothing — a cook can
           only judge quantities if we say which. Free-text notes for everything
           a set of numbers cannot hold. */
        adults: 2,
        teens: 0,
        littles: 2,
        headNote: "and a brand new baby, who isn't eating yet",
        householdNote: "the youngest is four days old",
        address: "418 Marion Street, the blue door on the left",
        dropoff: "Ring the bell once. If nobody comes, leave it on the bench — it's shaded.",
        ringBell: true,

        kosherLevel: "Keeps kosher — meat and dairy separate, chalav yisrael",
        hechshers: "OU, OK, Star-K all fine. Nothing needs a hechsher on produce.",
        passover: false,

        allergies: ["no-nuts"],
        /* Free text, because a fixed list of five cannot cover dairy, soy,
           strawberries, legumes or whatever this family actually has. Each word
           typed here is matched against dishes exactly like the preset tags. */
        otherAllergies: "",
        allergyNote: "The nut allergy is the real thing, not a preference. Please read labels.",
        dislikes: ["mushrooms"],
        loves: [
          "a good chicken soup",
          "anything with lemon",
          "a challah that isn't from the store"
        ],
        showDishes: true, // family's choice: see what's coming, or keep it a surprise
        thanksSent: false
      },

      days: [
        {
          id: "d1", iso: "2026-08-02", needed: true, kosher: "meat",
          from: "4:30", to: "6:00", candle: null,
          slots: [
            { id: "s1", filled: true, kind: "meal", by: "Rivky Weiss",
              dish: "Chicken soup with lokshen, and a roast chicken with lemon and potatoes",
              at: "4:30", mine: false, delivered: false,
              recipeAsked: true,
              recipeScope: "book",
              recipe: "No measurements, I never use them. A whole chicken, cold water to cover, " +
                "bring it up slow and skim the top. Carrots, celery, a parsnip, one onion with the " +
                "skin left on, it darkens the pot. Dill at the end, never at the start. Salt " +
                "more than you think. " +
                "Lokshen cooked separate or they drink the whole pot." },
            { id: "s2", filled: true, kind: "groceries", by: "Yael Fried",
              dish: "A grocery drop — milk, eggs, coffee, fruit, and a real challah from the bakery",
              at: "5:30", mine: false, delivered: false }
          ]
        },
        {
          id: "d2", iso: "2026-08-03", needed: true, kosher: "dairy",
          from: "4:30", to: "6:00", candle: null,
          slots: [
            { id: "s3", filled: true, kind: "meal", by: "Shira Blum",
              dish: "Baked ziti and garlic bread", at: "5:00", mine: false, delivered: false }
          ]
        },
        {
          id: "d3", iso: "2026-08-04", needed: true, kosher: "dairy",
          from: "4:30", to: "6:00", candle: null,
          slots: [ { id: "s4", filled: false } ]
        },
        {
          id: "d4", iso: "2026-08-05", needed: true, kosher: "dairy",
          from: "4:30", to: "6:00", candle: null,
          slots: [
            { id: "s5", filled: true, kind: "meal", by: "Miri Katz",
              dish: "Penne alla vodka with a big salad", at: "4:30", mine: false, delivered: false }
          ]
        },
        {
          id: "d5", iso: "2026-08-06", needed: true, kosher: "meat",
          from: "4:30", to: "6:00", candle: null,
          slots: [
            { id: "s6", filled: true, kind: "meal", by: "Devorah Stern",
              dish: "Spaghetti and meatballs", at: "5:00", mine: false, delivered: false }
          ]
        },
        {
          id: "d6", iso: "2026-08-07", needed: true, kosher: "meat",
          from: "2:30", to: "4:30", candle: "7:52",
          slots: [ { id: "s7", filled: false } ]
        },
        {
          id: "d7", iso: "2026-08-08", needed: false, kosher: "any",
          from: "4:30", to: "6:00", candle: null,
          offReason: "There's enough in the fridge from Friday. Rest.",
          slots: []
        }
      ],

      /* Golde's little black book. In the real product this is the whole
         mechanism — she reaches people one to one, not by shouting into a group.
         Numbers are 555 (reserved for fiction) and go nowhere. */
      contacts: [
        { id: "c1", name: "Rivky Weiss",      phone: "+1 (555) 014-2288", channel: "whatsapp", optedIn: true },
        { id: "c2", name: "Shira Blum",       phone: "+1 (555) 014-9071", channel: "whatsapp", optedIn: true },
        { id: "c3", name: "Miri Katz",        phone: "+1 (555) 014-3345", channel: "sms",      optedIn: true },
        { id: "c4", name: "Devorah Stern",    phone: "devorah@example.com", channel: "email",  optedIn: true },
        { id: "c5", name: "Yael Fried",       phone: "+1 (555) 014-8890", channel: "whatsapp", optedIn: true },
        { id: "c6", name: "Chana Leah Gross", phone: "Calendar reminder", channel: "calendar", optedIn: false },
        { id: "c7", name: "Bracha Levi",      phone: "+1 (555) 014-2019", channel: "whatsapp", optedIn: true },
        { id: "c8", name: "Tzippy Marcus",    phone: "Not asked yet",     channel: null,       optedIn: false }
      ],

      /* What this cook has brought before. It travels with the person, not the
         train — she's helped other families and Golde remembers. Deliberately
         seeded so a returning cook is what you see. */
      cook: {
        goTo: [
          "A big pot of chicken soup with lokshen",
          "Baked ziti with garlic bread",
          "Potato and leek soup with a challah",
          "Shepherd's pie"
        ]
      },

      messages: [
        {
          id: "m1", from: "golde", dir: "in", time: "10:02", stamp: "Today",
          text: [
            "Good morning, everybody. Mazal tov — Sarah and Dovid Cohen had a baby girl on Motzei Shabbos. 💕",
            "Mother and baby are home, everyone is tired in the very best way, and nobody in that house should be thinking about dinner this week."
          ]
        },
        {
          id: "m2", from: "golde", dir: "in", time: "10:02",
          text: [
            "I've set up a week of dinners, Sunday the 2nd through Shabbos. Nobody has to make a feast. A pot of something warm is plenty, and if cooking isn't your thing, there's another way to help — I'll show you."
          ]
        },
        {
          id: "m3", from: "golde", dir: "in", time: "10:03", card: "board",
          text: ["Here's the board. Take a look and see what fits your week."]
        },
        {
          id: "m4", from: "Shira Blum", dir: "in", time: "10:14",
          text: ["Put me down for Monday! I'll bring baked ziti 🍝"]
        },
        {
          id: "m5", from: "golde", dir: "in", time: "10:14",
          text: [
            "Monday's yours, Shira. Thank you. I'll remind you Sunday night so you don't have to keep it in your head."
          ],
          reaction: "❤️"
        },
        {
          id: "m6", from: "golde", dir: "in", time: "10:16", card: "board",
          text: [
            "Two nights still have nobody on them — Tuesday and Friday. Friday's the Shabbos one, so that one has to get there early, before candle-lighting.",
            "No pressure on anyone. But if a night is sitting there open on Sunday, I'm going to mention it again. You know me."
          ]
        }
      ]
    };
  }

  /* ===========================================================================
     2. STATE
     =========================================================================== */

  var state = {
    role: "neighbor",          // organizer | neighbor | family
    surface: "setup",          // setup | chat | board
    setup: { i: 0, answers: {}, log: [{ me: false, text: ["Hello. What can I do for you?"] }] },
    data: seed(),
    filter: "open",            // open | all — what a neighbour actually came for
    details: false,            // the family's full particulars, folded away by default
    trainOpen: false,          // dates and occasion — reference, not a daily action
    contactsOpen: false,       // show the people who are already sorted
    deliveryOpen: false,       // the family's drop-off details
    sheet: null,               // { kind, ... }
    form: {},
    you: { name: "" },
    msgSeq: 100,
    slotSeq: 100,
    remindedSlots: {}
  };

  /* Planner / Sender / Recipient. Not geographical — half the people who feed a
     family are shul, friends or a sister two towns over — and none of these
     words splits on US/UK spelling. "Sender" covers groceries and gift cards
     without implying anybody cooked. These label the interface; Golde herself
     still says "everybody", because no grandmother says "sender". */
  var ROLES = {
    organizer: { label: "Planner",   who: "the planner",   blurb: "Sets up the train" },
    neighbor:  { label: "Sender",    who: "a sender",      blurb: "Sends a meal in" },
    family:    { label: "Recipient", who: "the recipient", blurb: "Receiving the meals" }
  };

  /* ===========================================================================
     3. LITTLE UTILITIES
     =========================================================================== */

  var $ = function (sel) { return document.querySelector(sel); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  var DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Shabbos"];
  var MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  function d(iso) { return new Date(iso + "T12:00:00"); }
  function dayName(iso) { return DOW[d(iso).getDay()]; }
  function dateLabel(iso) { var x = d(iso); return MON[x.getMonth()] + " " + x.getDate(); }
  function shortDate(iso) { var x = d(iso); return MON[x.getMonth()].slice(0, 3) + " " + x.getDate(); }
  function isFriday(iso) { return d(iso).getDay() === 5; }

  /* The Jewish calendar, when we have verified data for that week. Every one of
     these returns null otherwise and the app says nothing, because a wrong
     parsha reads as an outsider guessing rather than as a bug. */
  var cal = window.goldeCalendar || {
    parshaFor: function () { return null; },
    candleLighting: function () { return null; },
    noCookingOn: function () { return null; },
    noteFor: function () { return null; }
  };

  /* Verified candle-lighting beats the hand-typed field, since it is a fact
     about the sun rather than somebody's recollection. */
  function candlesFor(day) {
    return cal.candleLighting(day.iso) || day.candle || null;
  }

  function windowText(day) {
    return day.from + "–" + day.to + " pm";
  }

  function plural(n, one, many) { return n === 1 ? one : many; }

  function toast(msg) {
    var host = $("#toast-host");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .3s ease";
      el.style.opacity = "0";
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 3400);
  }

  function findDay(id) {
    return state.data.days.filter(function (x) { return x.id === id; })[0] || null;
  }
  function findSlot(dayId, slotId) {
    var day = findDay(dayId);
    if (!day) return null;
    return day.slots.filter(function (s) { return s.id === slotId; })[0] || null;
  }
  /* Claiming a night creates (or updates) the person's record. Choosing a
     channel and handing over a number IS the opt-in — the thing that makes a
     1:1 reminder allowed. Nobody is added to this list without doing that. */
  function upsertContact(name, channel, handle) {
    var list = state.data.contacts;
    var first = name.split(" ")[0].toLowerCase();
    var existing = list.filter(function (c) {
      return c.name.toLowerCase() === name.toLowerCase() ||
             c.name.split(" ")[0].toLowerCase() === first;
    })[0];

    var reachable = channel !== "none" && channel !== "calendar";
    if (existing) {
      existing.channel = channel;
      if (handle) existing.phone = handle;
      if (reachable) existing.optedIn = true;
      return existing;
    }
    var c = {
      id: "c" + (++state.slotSeq),
      name: name,
      phone: handle || (channel === "calendar" ? "Calendar reminder" : "No reminder"),
      channel: channel,
      optedIn: reachable
    };
    list.push(c);
    return c;
  }

  /* Most recent first, no duplicates, and capped — a go-to list of twenty
     go-to meals is just a menu nobody reads. */
  function rememberDish(dish) {
    var list = state.data.cook.goTo || (state.data.cook.goTo = []);
    var key = dish.trim().toLowerCase();
    var without = list.filter(function (d) { return d.trim().toLowerCase() !== key; });
    state.data.cook.goTo = [dish.trim()].concat(without).slice(0, 6);
  }

  function findContact(id) {
    return (state.data.contacts || []).filter(function (c) { return c.id === id; })[0] || null;
  }

  function locateSlot(slotId) {
    for (var i = 0; i < state.data.days.length; i++) {
      var day = state.data.days[i];
      for (var j = 0; j < day.slots.length; j++) {
        if (day.slots[j].id === slotId) return { day: day, slot: day.slots[j], index: i };
      }
    }
    return null;
  }

  function openDays() {
    return state.data.days.filter(function (day) {
      return day.needed && day.slots.some(function (s) { return !s.filled; });
    });
  }
  function filledSlots() {
    var out = [];
    state.data.days.forEach(function (day) {
      day.slots.forEach(function (s) { if (s.filled) out.push({ day: day, slot: s }); });
    });
    return out;
  }
  function myClaims() {
    return filledSlots().filter(function (x) { return x.slot.mine; });
  }

  /* Nice human list: "Tuesday and Friday" / "Tuesday, Thursday and Friday" */
  function listify(items) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + " and " + items[1];
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }

  /* ===========================================================================
     4. THE SMART BITS — allergens, kosher, variety, overlap
     Faked with keyword matching. It only has to be right enough to feel
     like somebody was paying attention.
     =========================================================================== */

  var ALLERGY_TAGS = {
    "no-nuts": {
      label: "no nuts",
      friendly: "nuts",
      words: ["nut", "nuts", "peanut", "peanuts", "almond", "almonds", "walnut", "walnuts",
              "pecan", "pecans", "cashew", "cashews", "pistachio", "pistachios", "hazelnut",
              "pesto", "pad thai", "satay", "baklava", "praline", "marzipan", "nutella",
              "macaroon", "amaretto", "frangipane", "romesco"],
      sneaky: ["pesto", "pad thai", "satay", "baklava", "praline", "marzipan", "nutella",
               "macaroon", "amaretto", "frangipane", "romesco"],
      why: "It's a real allergy, not a preference, so it's worth turning the jar around and reading the back."
    },
    /* No shellfish tag here on purpose — these households keep kosher, so it's
       already off the table. Offering it as a checkbox reads like we don't know
       who we're talking to. */
    "gluten-free": {
      label: "gluten-free",
      friendly: "gluten",
      words: ["bread", "pasta", "ziti", "penne", "spaghetti", "lasagna", "noodle", "noodles",
              "flour", "couscous", "barley", "cracker", "challah", "pita", "wrap", "breaded",
              "schnitzel", "cake", "cookie", "pie", "orzo", "matzah", "soy sauce", "meatball"],
      sneaky: ["soy sauce", "meatball", "schnitzel", "breaded"],
      why: "Flour gets everywhere — the breading, the thickening, the crumbs on top."
    },
    "no-eggs": {
      label: "no eggs",
      friendly: "eggs",
      words: ["egg", "eggs", "omelet", "omelette", "frittata", "quiche", "mayonnaise", "mayo",
              "meringue", "custard", "aioli", "meatball", "schnitzel"],
      sneaky: ["mayonnaise", "mayo", "aioli", "custard", "meatball", "schnitzel"],
      why: "They do the binding in things you'd never suspect — meatballs, breading, dressings."
    },
    "no-sesame": {
      label: "no sesame",
      friendly: "sesame",
      words: ["sesame", "tahini", "hummus", "halva", "za'atar", "zaatar", "everything bagel"],
      sneaky: ["tahini", "hummus", "halva", "za'atar", "zaatar", "everything bagel"],
      why: "Tahini and za'atar carry it quietly, and nobody reads the label on hummus."
    }
  };

  var MEAT_WORDS = ["chicken", "beef", "meat", "brisket", "schnitzel", "turkey", "lamb", "veal",
    "meatball", "meatballs", "meatloaf", "hot dog", "hotdog", "burger", "cholent", "chulent",
    "pastrami", "corned beef", "salami", "sausage", "shepherd's pie", "shepherds pie", "roast",
    "bolognese", "kebab", "shawarma", "chili con carne", "pot roast", "kishke", "duck"];

  var DAIRY_WORDS = ["cheese", "cheesy", "milk", "cream", "creamy", "butter", "buttery", "yogurt",
    "yoghurt", "alfredo", "lasagna", "lasagne", "ziti", "parmesan", "mozzarella", "ricotta",
    "feta", "pizza", "mac and cheese", "macaroni and cheese", "quiche", "blintz", "blintzes",
    "vodka sauce", "alla vodka", "cheesecake", "gratin", "bechamel", "milchig"];

  var CATEGORIES = [
    { key: "pasta", label: "pasta", words: ["pasta", "ziti", "penne", "spaghetti", "lasagna",
      "lasagne", "noodle", "noodles", "macaroni", "mac and cheese", "rigatoni", "linguine",
      "fettuccine", "orzo", "ravioli", "tortellini", "bolognese", "alfredo", "alla vodka"] },
    { key: "soup", label: "soup", words: ["soup", "chowder", "broth", "stew", "minestrone", "borscht"] },
    { key: "chicken", label: "roast chicken", words: ["roast chicken", "schnitzel", "chicken cutlet",
      "baked chicken", "grilled chicken", "chicken thighs"] },
    { key: "pizza", label: "pizza", words: ["pizza", "calzone", "focaccia"] },
    { key: "fish", label: "fish", words: ["salmon", "tilapia", "fish", "tuna", "cod", "gefilte"] },
    { key: "casserole", label: "casserole", words: ["casserole", "shepherd's pie", "shepherds pie",
      "kugel", "bake", "enchilada", "moussaka"] },
    { key: "chili", label: "chili", words: ["chili", "chilli", "cholent", "chulent", "curry", "tagine"] }
  ];

  function hasWord(text, word) {
    var t = " " + String(text).toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
    var w = " " + word.toLowerCase() + " ";
    if (t.indexOf(w) > -1) return true;
    // tolerate simple plurals / possessives
    return t.indexOf(" " + word.toLowerCase() + "s ") > -1;
  }
  function matchAny(text, words) {
    for (var i = 0; i < words.length; i++) if (hasWord(text, words[i])) return words[i];
    return null;
  }

  function dishCategory(text) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (matchAny(text, CATEGORIES[i].words)) return CATEGORIES[i];
    }
    return null;
  }
  function kosherOf(text) {
    var m = matchAny(text, MEAT_WORDS);
    var dy = matchAny(text, DAIRY_WORDS);
    if (m && !dy) return { type: "meat", word: m };
    if (dy && !m) return { type: "dairy", word: dy };
    if (m && dy) return { type: "both", word: m + " and " + dy };
    return { type: "unknown", word: null };
  }

  /* The whole gentle-check pass. Returns an array of concerns, never blocks. */
  function runChecks(dayId, dish) {
    var t = state.data.train;
    var day = findDay(dayId);
    var concerns = [];
    if (!dish || !dish.trim()) return concerns;

    /* --- allergens --------------------------------------------------------- */

    /* Whatever the family typed themselves, matched word for word. */
    (t.otherAllergies || "").split(/[,;]/).forEach(function (raw) {
      var word = raw.trim().toLowerCase();
      if (word.length < 3) return;
      var stem = word.replace(/(ies|es|s)$/, "");
      var safe = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp("\\b" + safe, "i").test(dish)) return;
      concerns.push({
        kind: "allergy",
        text: cap(t.recipientFamily) + " can't have " + word + ", and that looks like it has some in. " +
              "Want to rethink it, or is yours definitely safe?"
      });
    });

    t.allergies.forEach(function (tag) {
      var def = ALLERGY_TAGS[tag];
      if (!def) return;
      var hit = matchAny(dish, def.words);
      if (!hit) return;
      var sneaky = (def.sneaky || []).indexOf(hit) > -1;
      concerns.push({
        kind: "allergy",
        text: cap(t.recipientFamily) + " don't do " + def.friendly +
              (sneaky
                ? ", and " + hit + " likes to hide them. "
                : ", and you've got " + hit + " right there in it. ") +
              "Want to rethink it, or is yours definitely safe?"
      });
    });

    /* --- dislikes (softer than an allergy) --------------------------------- */
    t.dislikes.forEach(function (dis) {
      if (!hasWord(dish, dis)) return;
      concerns.push({
        kind: "dislike",
        text: "Sarah has never once finished a " + dis + ". Not an allergy — they'll eat around it."
      });
    });

    /* --- kosher ------------------------------------------------------------ */
    if (day && day.kosher !== "any") {
      var k = kosherOf(dish);
      var want = day.kosher;
      if (k.type !== "unknown" && k.type !== want) {
        var line;
        if (k.type === "both") {
          line = "“" + k.word + "” in the same pot — they keep meat and dairy separate. " +
                 "Your call, I just didn't want you finding out at the door.";
        } else {
          line = dayName(day.iso) + " they're hoping for " + want + ". That sounds like " + k.type +
                 ". Your call, I just didn't want you finding out at the door.";
        }
        concerns.push({ kind: "kosher", text: line });
      }
    }

    /* --- variety across adjacent days -------------------------------------- */
    var cat = isQuiet() ? null : dishCategory(dish);
    if (cat && day) {
      var idx = state.data.days.indexOf(day);
      var clashes = [];
      [idx - 1, idx + 1].forEach(function (i) {
        var n = state.data.days[i];
        if (!n || !n.needed) return;
        n.slots.forEach(function (s) {
          if (!s.filled || s.kind !== "meal") return;
          var c = dishCategory(s.dish);
          if (c && c.key === cat.key) clashes.push(dayName(n.iso));
        });
      });
      var days = unique(clashes);
      if (days.length) {
        concerns.push({
          kind: "variety",
          text: listify(days) + " " + plural(days.length, "is", "are") + " already " + cat.label +
                ". Nobody will complain, but a little variety never hurt anyone."
        });
      }
    }

    return concerns;
  }

  function unique(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }
  /* Two adults and three children is a different shop from five adults, and a
     cook can only judge quantities if we say which. */
  function allergySummary(t) {
    var named = (t.allergies || []).map(function (a) {
      return ALLERGY_TAGS[a] ? ALLERGY_TAGS[a].label : a;
    });
    (t.otherAllergies || "").split(/[,;]/).forEach(function (w) {
      w = w.trim();
      if (w) named.push("no " + w);
    });
    return named.length ? named.join(", ") : "no allergies";
  }

  function headcount(t) {
    var a = Number(t.adults) || 0, y = Number(t.teens) || 0, l = Number(t.littles) || 0;
    var bits = [];
    if (a) bits.push(a + " " + plural(a, "adult", "adults"));
    if (y) bits.push(y + " " + plural(y, "teenager", "teenagers"));
    if (l) bits.push(l + " little " + plural(l, "one", "ones"));
    if (!bits.length) return "a few";
    return listify(bits) + (t.headNote ? ", " + t.headNote : "");
  }

  /* The one-line version for reminders and cards. */
  function headcountShort(t) {
    var n = (Number(t.adults) || 0) + (Number(t.teens) || 0) + (Number(t.littles) || 0);
    return n + " to feed — " + headcount(t);
  }

  function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

  /* Lowercase the first letter so a dish reads naturally mid-sentence — but leave
     "Mrs. Klein's brisket" and other proper nouns alone. */
  function lowerFirst(s) {
    var str = String(s);
    var first = str.split(" ")[0];
    if (first.length > 1 && first !== first.toLowerCase() && first !== cap(first.toLowerCase())) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /* Live, as-you-type nudge shown under the dish field before you even submit. */
  function liveHint(dayId, dish) {
    var c = runChecks(dayId, dish);
    if (!c.length) return null;
    var first = c[0];
    var short = {
      allergy: "Careful — that one may have nuts in it. I'll ask you about it in a second.",
      kosher: "Mm. That might not match what they're hoping for that night. We'll talk.",
      variety: "That's the second one like it this week. Not a problem, just noticing.",
      dislike: "Small thing about one of the ingredients — I'll mention it before you confirm."
    };
    if (first.kind === "allergy") {
      var tag = ALLERGY_TAGS[state.data.train.allergies[0]];
      short.allergy = "Careful — that sounds like it could have " +
        (tag ? tag.friendly : "an allergen") + " in it. I'll ask you properly in a second.";
    }
    return { kind: first.kind, text: short[first.kind] || short.variety };
  }

  /* Two drop-offs on one day → stagger them so the doorbell doesn't ring twice. */
  function overlapNote(day) {
    var filled = day.slots.filter(function (s) { return s.filled; });
    if (filled.length < 2) return null;
    var names = filled.map(function (s) { return s.by + " at " + s.at; });
    return "Two drop-offs. I staggered them — " + listify(names) + ".";
  }

  /* Seeded variety clash shown on the board itself, unprompted. */
  function boardVarietyNote() {
    if (isQuiet()) return null;
    var days = state.data.days;
    for (var i = 1; i < days.length; i++) {
      var prev = days[i - 1], cur = days[i];
      if (!prev.needed || !cur.needed) continue;
      var a = prev.slots.filter(function (s) { return s.filled && s.kind === "meal"; })[0];
      var b = cur.slots.filter(function (s) { return s.filled && s.kind === "meal"; })[0];
      if (!a || !b) continue;
      var ca = dishCategory(a.dish), cb = dishCategory(b.dish);
      if (ca && cb && ca.key === cb.key) {
        return dayName(prev.iso) + " and " + dayName(cur.iso) + " are both " + ca.label +
               ". Maybe not a third.";
      }
    }
    return null;
  }

  /* ===========================================================================
     5. GOLDE SPEAKS — message helpers
     =========================================================================== */

  function nowStamp() {
    var m = state.data.messages;
    var last = m.length ? m[m.length - 1].time : "10:16";
    var parts = last.split(":");
    var h = parseInt(parts[0], 10), mi = parseInt(parts[1], 10) + 1 + Math.floor(state.msgSeq % 3);
    if (mi >= 60) { mi -= 60; h += 1; }
    if (h > 12) h -= 12;
    return h + ":" + (mi < 10 ? "0" + mi : mi);
  }

  function say(from, text, extra) {
    var msg = {
      id: "m" + (++state.msgSeq),
      from: from,
      dir: from === "you" ? "out" : "in",
      time: nowStamp(),
      text: Array.isArray(text) ? text : [text]
    };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) msg[k] = extra[k];
    state.data.messages.push(msg);
    return msg;
  }

  function goldeSays(text, extra) { return say("golde", text, extra); }

  /* ===========================================================================
     6. RENDER — chat surface
     =========================================================================== */

  function renderChat() {
    var t = state.data.train;
    var open = openDays().length;

    /* This is golde.'s own page, not a chat app. It used to imitate WhatsApp —
       the green, the ticks, the group header — and that made people think their
       real WhatsApp had done something strange. It's a minisite now. It shares
       *to* WhatsApp; it doesn't pretend to be inside it. */
    var html = "";
    html += '<header class="topbar">' +
      '<div><div class="topbar-mark">golde.</div>' +
      '<div class="topbar-sub">' + esc(t.title) + "</div></div>" +
      '<button class="iconbtn" data-act="open-board" style="margin-left:auto" ' +
        'aria-label="See the week">' + icon("grid") + "</button>" +
      "</header>";

    html += '<div class="viewing-as">Viewing as <em>' + esc(ROLES[state.role].label) + "</em></div>";

    html += '<div class="scroller feed-bg" id="chat-scroll">';

    html += '<div class="ask-card">' +
      '<div class="ask-head"><span class="wordmark">golde.</span> — ask me anything about this week</div>' +
      '<form class="ask-form" data-act="send">' +
        '<input class="ask-field" id="composer-field" autocomplete="off" ' +
          'placeholder="Who has Tuesday?" aria-label="Ask Golde a question">' +
        '<button class="ask-send" type="submit" aria-label="Ask">' + icon("send") + "</button>" +
      "</form></div>";

    html += '<button class="share-btn" data-act="share">' + icon("share") +
      " Send this to your group</button>" +
      '<p class="share-sub">Opens WhatsApp so you can pick the chat. Nothing is sent until you send it.</p>';

    html += '<div class="section-label" style="margin-top:22px">What\'s happened</div>';

    state.data.messages.slice().reverse().forEach(function (m) { html += renderNotice(m); });

    html += "</div>";

    void open;
    return html;
  }

  /* One entry in the running record. Golde's own lines read as her; anything a
     neighbor did reads as a plain fact, because that's what it is. */
  function renderNotice(m) {
    var mine = m.dir === "out";
    var golde = m.from === "golde";
    var h = '<div class="notice' + (golde ? " from-golde" : "") + (mine ? " mine" : "") + '" ' +
      'data-act="react" data-id="' + esc(m.id) + '" role="button" tabindex="0">';

    h += '<div class="notice-who">' +
      (golde ? '<span class="wordmark">golde.</span>' : esc(mine ? "You" : m.from)) +
      '<span class="notice-time">' + esc(m.time) + "</span></div>";

    if (m.card === "board") h += renderBoardCard();
    if (m.card === "donation") h += renderDonationCard();

    m.text.forEach(function (p) { h += "<p>" + esc(p) + "</p>"; });

    if (m.actions && m.actions.length) {
      h += '<div class="inline-card">';
      m.actions.forEach(function (a) {
        h += '<button class="chip-btn' + (a.solid ? " solid" : "") + '" data-act="' + esc(a.act) + '"' +
          (a.arg ? ' data-arg="' + esc(a.arg) + '"' : "") + ">" + esc(a.label) + "</button>";
      });
      h += "</div>";
    }
    if (m.reaction) h += '<span class="reaction">' + esc(m.reaction) + "</span>";
    h += "</div>";
    return h;
  }

  /* wa.me is the official, no-API way to hand off to WhatsApp: it opens the app
     with the text ready and lets the person choose the chat or group. There is
     no way to post into a group programmatically, and this is the honest
     substitute — a human still presses send. */
  function shareToWhatsApp() {
    var t = state.data.train;
    var open = openDays();
    var lines = [
      "Meals for " + t.recipientFamily + " — " + occasionText(t.occasion) + ".",
      open.length
        ? listify(open.map(function (x) { return dayName(x.iso) + " " + dateLabel(x.iso); })) +
          " still " + plural(open.length, "needs", "need") + " somebody."
        : "Every night is covered — this is just so you can see it.",
      "Pick a night here: " + boardUrl()
    ];
    window.open("https://wa.me/?text=" + encodeURIComponent(lines.join("\n\n")), "_blank",
      "noopener,noreferrer");
    toast("WhatsApp should be opening. Choose the group and press send yourself.");
  }

  function boardUrl() {
    return "golde.meals/the-cohens";
  }

  function renderBoardCard() {
    var t = state.data.train;
    var open = openDays().length;
    var sub = open === 0
      ? "Every night is spoken for"
      : open + " " + plural(open, "night", "nights") + " still open";
    return '<div class="linkcard">' +
      '<div class="lc-top">' +
        '<div class="lc-mark">golde.meals</div>' +
        '<div class="lc-title">' + esc(t.title) + "</div>" +
        '<div class="lc-sub">' + esc(shortDate(t.start) + " – " + shortDate(t.end)) + " · " + esc(sub) + "</div>" +
      "</div>" +
      '<button class="lc-open" data-act="open-board">See the week</button>' +
      "</div>";
  }

  function renderDonationCard() {
    return '<div class="linkcard"><div class="lc-top">' +
      '<div class="lc-mark">golde.</div>' +
      '<div class="lc-title">Keep golde. free for the next family</div>' +
      '<div class="lc-sub">Only if you want to. Truly.</div>' +
      '</div>' +
      '<button class="lc-open" data-act="donate">Chip in</button></div>';
  }

  /* ===========================================================================
     7. RENDER — board surface
     =========================================================================== */

  function renderBoard() {
    var t = state.data.train;
    var h = "";

    h += '<header class="board-top">' +
      '<div class="row1">' +
        '<button class="backlink" data-act="open-chat">' + icon("back") + " Back to the chat</button>" +
        '<span class="board-mark">golde.</span>' +
      "</div>" +
      '<h1 class="board-h1">' + esc(t.title) + "</h1>" +
      '<div class="board-dates">' + esc(dayName(t.start) + ", " + dateLabel(t.start)) + " through " +
        esc(dayName(t.end) + ", " + dateLabel(t.end)) + " · " + esc(occasionText(t.occasion)) + "</div>" +
      "</header>";

    h += '<div class="viewing-as">Viewing as <em>' + esc(ROLES[state.role].label) + "</em>" +
      '<button class="reset-inline" data-act="reset">reset demo</button></div>';
    h += '<div class="scroller" id="board-scroll"><div class="board-body">';

    if (state.role === "organizer") h += boardOrganizer();
    else if (state.role === "family") h += boardFamily();
    else h += boardNeighbor();

    h += "</div></div>";
    return h;
  }

  /* A shiva and a new baby are not the same event and must not sound the same.
     Everything Golde says routes through a register: bright, tender or quiet.
     Getting this wrong is the most damaging thing this product could do. */
  var OCCASIONS = {
    "new-baby":         { text: "a new baby",            tone: "bright" },
    "moving-in":        { text: "moving in",             tone: "bright" },
    "new-to-community": { text: "new to the community",  tone: "bright" },
    "just-because":     { text: "just because",          tone: "bright" },
    "recovery":         { text: "recovery from surgery", tone: "tender" },
    "shiva":            { text: "a shiva",               tone: "quiet"  }
  };

  function tone() {
    var o = OCCASIONS[state.data.train.occasion];
    return o ? o.tone : "bright";
  }
  function isQuiet() { return tone() === "quiet"; }
  function byTone(map) { return map[tone()] || map.bright; }

  function occasionText(key) {
    return (OCCASIONS[key] || OCCASIONS["new-baby"]).text;
  }

  /* --- the day cards, shared across roles ---------------------------------- */

  function dayCard(day) {
    var t = state.data.train;
    var hasOpen = day.slots.some(function (s) { return !s.filled; });
    var mine = day.slots.some(function (s) { return s.filled && s.mine; });
    var cls = "daycard" + (!day.needed ? " off" : hasOpen ? " open" : "") + (mine ? " mine" : "");

    var h = '<div class="' + cls + '">';
    h += '<div class="dc-head">' +
      '<span class="dc-day">' + esc(dayName(day.iso)) + "</span>" +
      '<span class="dc-date">' + esc(dateLabel(day.iso)) + "</span>";
    if (day.needed) {
      var c = candlesFor(day);
      h += '<span class="dc-window">' + esc(windowText(day)) +
        (c ? "<br>candles " + esc(c) : "") + "</span>";
    }
    h += "</div>";

    if (!day.needed) {
      h += '<p class="slot-empty" style="margin:10px 0 0">' +
        esc(day.offReason || "No meal needed this day.") + "</p>";
      if (state.role === "organizer" || state.role === "family") {
        h += '<div class="slot-actions"><button class="mini-link" data-act="toggle-needed" data-day="' +
          day.id + '">Actually, we could use something this day</button></div>';
      }
      h += "</div>";
      return h;
    }

    if (day.kosher !== "any") {
      var pretty = { meat: "hoping for meat", dairy: "hoping for dairy", pareve: "hoping for pareve" }[day.kosher];
      h += '<span class="dc-pref ' + day.kosher + '">' + esc(pretty) + "</span>";
    }

    var stop = cal.noCookingOn(day.iso);
    if (stop) {
      h += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc(cal.noteFor(day.iso)) + "</span></div>";
    }

    var candles = candlesFor(day);
    if (candles) {
      var parsha = cal.parshaFor(day.iso);
      h += '<div class="golde-note warn tight"><span class="gn-mark">golde.</span><span>' +
        (parsha ? "Parshas " + esc(parsha) + ". " : "") +
        "Candles at " + esc(candles) + ". Dinner has to be at the door by " + esc(day.to) +
        " — earlier if you can.</span></div>";
    }

    day.slots.forEach(function (slot) { h += slotRow(day, slot); });

    var ov = overlapNote(day);
    if (ov) {
      h += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' + esc(ov) + "</span></div>";
    }

    if (state.role === "organizer") {
      h += '<div class="slot-actions" style="margin-top:12px">' +
        '<button class="mini-link" data-act="add-slot" data-day="' + day.id + '">Add another slot</button>' +
        '<button class="mini-link" data-act="toggle-needed" data-day="' + day.id + '">No meal needed this day</button>' +
        '<button class="mini-link" data-act="edit-day" data-day="' + day.id + '">Edit this day</button>' +
        "</div>";
    }
    if (state.role === "family") {
      h += '<div class="slot-actions" style="margin-top:12px">' +
        '<button class="mini-link" data-act="toggle-needed" data-day="' + day.id +
        '">We don\'t need anything this day</button></div>';
    }

    void t;
    h += "</div>";
    return h;
  }

  /* A night nobody needs to act on. One line is enough; the card was 145px. */
  /* Asked for by a real user: "a really quick view of the week where it just
     shows filled and unfilled spots and literally nothing else". No dishes, no
     names, no windows — seven lines you can read in two seconds. */
  function glanceRow(day) {
    if (!day.needed) {
      var canAdd = state.role === "organizer" || state.role === "family";
      if (!canAdd) {
        return '<div class="glance off"><span class="g-day">' + esc(dayName(day.iso)) + "</span>" +
          '<span class="g-state">nothing needed</span></div>';
      }
      return '<button class="glance off addable" data-act="toggle-needed" data-day="' + day.id + '">' +
        '<span class="g-day">' + esc(dayName(day.iso)) + "</span>" +
        '<span class="g-state">+ add this day</span></button>';
    }
    var open = day.slots.filter(function (x) { return !x.filled; });
    var mine = day.slots.some(function (x) { return x.filled && x.mine; });
    if (!open.length) {
      return '<div class="glance done' + (mine ? " mine" : "") + '">' +
        '<span class="g-day">' + esc(dayName(day.iso)) + "</span>" +
        '<span class="g-state">' + (mine ? "yours" : "covered") + "</span></div>";
    }
    var slot = open[0];
    return '<button class="glance open" data-act="claim" data-day="' + day.id +
      '" data-slot="' + slot.id + '">' +
      '<span class="g-day">' + esc(dayName(day.iso)) + "</span>" +
      '<span class="g-state">open</span></button>';
  }

  /* A skipped day, and the one tap that brings it back. */
  function addDayRow(day) {
    return '<button class="add-day" data-act="toggle-needed" data-day="' + day.id + '">' +
      '<span class="ad-day">' + esc(dayName(day.iso)) + " " + esc(dateLabel(day.iso)) + "</span>" +
      '<span class="ad-cta">+ add this day</span></button>';
  }

  function compactDay(day) {
    var slots = day.slots.filter(function (s) { return s.filled; });
    var t = state.data.train;
    var hide = state.role === "family" && !t.showDishes;

    /* Compacting a night must not remove what you can do on it. */
    var act = "";
    if (state.role === "family" && !hide) {
      var meal = slots.filter(function (x) { return x.kind === "meal"; })[0];
      if (meal && meal.recipe) {
        act = '<button class="mini-link" data-act="see-recipe" data-slot="' + meal.id +
          '">recipe</button>';
      } else if (meal && !meal.recipeAsked && !meal.recipeDeclined) {
        act = '<button class="mini-link" data-act="ask-recipe" data-slot="' + meal.id +
          '">ask for it</button>';
      }
    }

    return '<div class="compact-day">' +
      '<span class="cd-day">' + esc(dayName(day.iso)) + "</span>" +
      '<span class="cd-dish">' + esc(hide ? "Something's coming" :
        slots.map(function (s) { return lowerFirst(s.dish); }).join(" · ")) + "</span>" +
      '<span class="cd-by">' + esc(slots.map(function (s) {
        return s.by.split(" ")[0]; }).join(", ")) + "</span>" +
      act +
      "</div>";
  }

  var KIND_ICON = { meal: "🍲", groceries: "🧺", giftcard: "💌", orderin: "🛵" };
  var KIND_LABEL = { meal: "", groceries: "Groceries", giftcard: "Gift card", orderin: "Ordering in" };

  function slotRow(day, slot) {
    var t = state.data.train;
    var h = '<div class="slot">';

    if (!slot.filled) {
      h += '<div class="slot-icon" aria-hidden="true">·</div><div class="slot-main">';
      h += '<div class="slot-empty">Nobody yet.</div>';
      if (t.paused) {
        h += '<div class="slot-by">On hold — the family has enough this week.</div>';
      } else if (state.role === "neighbor") {
        h += '<div class="slot-actions"><button class="btn sm" data-act="claim" data-day="' + day.id +
             '" data-slot="' + slot.id + '">I\'ll take ' + esc(dayName(day.iso)) + "</button>" +
             '<button class="btn sm ghost" data-act="claim-nocook" data-day="' + day.id +
             '" data-slot="' + slot.id + '">I don\'t cook</button></div>';
      } else if (state.role === "organizer") {
        h += '<div class="slot-actions">' +
             '<button class="mini-link" data-act="claim" data-day="' + day.id + '" data-slot="' + slot.id +
             '">Put someone down</button>' +
             (day.slots.length > 1 ? '<button class="mini-link danger" data-act="remove-slot" data-day="' + day.id +
               '" data-slot="' + slot.id + '">Remove this slot</button>' : "") +
             "</div>";
      }
      h += "</div></div>";
      return h;
    }

    var hideDish = state.role === "family" && !t.showDishes;
    h += '<div class="slot-icon filled" aria-hidden="true">' + (KIND_ICON[slot.kind] || "🍲") + "</div>";
    h += '<div class="slot-main">';
    h += '<div class="slot-dish">' + esc(hideDish ? "Something warm is coming. You asked me not to spoil it, so my lips are sealed." : slot.dish) + "</div>";
    h += '<div class="slot-by">' + esc(slot.by) + " · arriving " + esc(slot.at) +
      (KIND_LABEL[slot.kind] ? ' <span class="badge">' + esc(KIND_LABEL[slot.kind]) + "</span>" : "") +
      (slot.delivered ? ' <span class="badge done">delivered</span>' : "") +
      "</div>";

    if (state.role === "family" && slot.kind === "meal" && !hideDish) {
      h += '<div class="slot-actions">';
      if (slot.recipe) {
        h += '<button class="mini-link" data-act="see-recipe" data-slot="' + slot.id +
          '">See the recipe</button>';
      } else if (slot.recipeDeclined) {
        h += '<span class="slot-by">Kept in the family — and quite right too.</span>';
      } else if (slot.recipeAsked) {
        h += '<span class="slot-by">Asked. No rush on them.</span>';
      } else {
        h += '<button class="mini-link" data-act="ask-recipe" data-slot="' + slot.id +
          '">Could I have the recipe?</button>';
      }
      h += "</div>";
    }

    if (slot.mine && state.role === "neighbor" && slot.recipeAsked && !slot.recipe &&
        !slot.recipeDeclined) {
      h += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc("Sarah asked for this recipe. Nobody has to write anything down — but she asked, " +
            "and I thought you'd want to know.") + "</span>" +
        "</div><div class=\"slot-actions\">" +
        '<button class="mini-link" data-act="write-recipe" data-slot="' + slot.id +
          '">Write it out for her</button>' +
        '<button class="mini-link" data-act="decline-recipe" data-slot="' + slot.id +
          '">I\'d rather not</button></div>';
    }

    if (slot.mine && state.role === "neighbor") {
      h += '<div class="slot-actions">' +
        (slot.delivered ? "" :
          '<button class="mini-link" data-act="mark-delivered" data-slot="' + slot.id + '">Mark it delivered</button>' +
          '<button class="mini-link" data-act="swap" data-slot="' + slot.id + '">Swap my day</button>' +
          '<button class="mini-link danger" data-act="cancel" data-slot="' + slot.id + '">I can\'t make it</button>') +
        "</div>";
    } else if (state.role === "organizer") {
      h += '<div class="slot-actions">' +
        '<button class="mini-link" data-act="edit-slot" data-slot="' + slot.id + '">Change the details</button>' +
        '<button class="mini-link danger" data-act="reopen" data-slot="' + slot.id + '">Reopen it</button>' +
        "</div>";
    }
    h += "</div></div>";
    return h;
  }

  /* --- neighbor board ------------------------------------------------------ */

  function boardNeighbor() {
    var t = state.data.train;
    var h = "";
    var open = openDays();
    var mine = myClaims();

    var lede;
    if (t.wrapped) {
      lede = byTone({
        bright: "That's a wrap. Every one of you showed up.",
        tender: "That's the end of it. They're on their feet again, thanks to you.",
        quiet:  "The shiva is over. They'll be alright, slowly."
      });
    } else if (t.paused) {
      lede = "The Cohens have enough for now. Don't cook — I'll wave you back in when they're ready.";
    } else if (!filledSlots().length) {
      lede = "Nothing here yet. Let's fill it up so the Cohens don't have to think about dinner.";
    } else if (!open.length) {
      lede = "Every night is spoken for. I'm very pleased with all of you.";
    } else {
      var days = listify(open.map(function (x) { return dayName(x.iso); }));
      var still = days + " still " + plural(open.length, "has", "have") + " nobody. ";
      lede = byTone({
        bright: still + "Take whichever fits your week.",
        tender: still + "Take whichever fits your week. Plain and warm is exactly right.",
        quiet:  "There's nothing anybody can say. So we cook. " + still +
                "Nothing has to be special this week."
      });
    }
    h += '<div class="golde-note"><span class="gn-mark">golde.</span><span>' + esc(lede) + "</span></div>";


    if (mine.length) {
      h += '<div class="panel"><h3>Your night' + (mine.length > 1 ? "s" : "") + "</h3>" +
        '<p class="lede">I\'ll remind you the day before, so you can put it out of your head until then.</p>';
      mine.forEach(function (x) {
        h += '<div class="fact"><dt>' + esc(dayName(x.day.iso)) + "</dt><dd>" + esc(x.slot.dish) +
             "<br><span style=\"color:var(--muted);font-size:13px\">by " + esc(x.day.to) + " pm" +
             (x.day.candle ? ", before candles at " + esc(x.day.candle) : "") + "</span></dd></div>";
      });
      h += '<div class="fact"><dt>Where</dt><dd>' + esc(t.address) +
        '<div style="font-size:13px;color:var(--muted);margin-top:2px">' + esc(t.dropoff) +
        "</div></dd></div>";
      h += "</div>";
    }

    var openCount = open.length;
    var covered = state.data.days.filter(function (d) {
      return d.needed && !d.slots.some(function (x) { return !x.filled; });
    }).length;
    h += '<div class="chips seg">' +
      '<button class="chip small" data-act="set-filter" data-filter="open" aria-pressed="' +
        (state.filter === "open") + '">Open (' + openCount + ")</button>" +
      '<button class="chip small" data-act="set-filter" data-filter="all" aria-pressed="' +
        (state.filter === "all") + '">Everything</button>' +
      '<button class="chip small" data-act="set-filter" data-filter="glance" aria-pressed="' +
        (state.filter === "glance") + '">At a glance</button>' +
      "</div>";
    void covered;

    var vn = boardVarietyNote();
    if (vn && !t.wrapped) {
      h += '<div class="golde-note warn"><span class="gn-mark">golde.</span><span>' + esc(vn) + "</span></div>";
    }

    h += recipientPanel(false);

    if (state.filter === "glance") {
      h += '<div class="glance-list">';
      state.data.days.forEach(function (day) { h += glanceRow(day); });
      h += "</div>";
    } else {
      state.data.days.forEach(function (day) {
        var hasOpen = day.needed && day.slots.some(function (x) { return !x.filled; });
        var mine = day.slots.some(function (x) { return x.filled && x.mine; });
        if (state.filter === "open") {
          if (hasOpen || mine) h += dayCard(day);
          return;
        }
        h += (hasOpen || mine || !day.needed) ? dayCard(day) : compactDay(day);
      });
    }
    if (state.filter === "open" && !open.length) {
      h += '<div class="golde-note"><span class="gn-mark">golde.</span><span>' +
        esc("Every night is taken. Have a look at the whole week if you'd like to see what's coming.") +
        "</span></div>";
    }

    if (!t.wrapped && !t.paused) {
      h += '<button class="btn block ghost" data-act="claim-nocook" style="margin-top:4px">' +
        "Not a cook? Help another way</button>";
    }
    h += helpFooter();

    return h;
  }

  /* --- recipient facts panel ------------------------------------------------ */

  function recipientPanel(editable) {
    var t = state.data.train;
    var h = '<div class="panel"><h3>About ' + esc(t.recipientFamily) + "</h3>";

    /* The three things that decide what you cook. Everything else waits. */
    h += '<p class="lede" style="margin-bottom:10px">' +
      esc(headcount(t) + " · " + allergySummary(t) +
          " · kosher, meat and dairy separate") + "</p>";

    if (editable) {
      /* The organizer fields "where do they live?" all week — keep it in reach. */
      h += '<p class="lede" style="margin:-6px 0 10px">' + esc(t.address) + "</p>" +
        '<button class="btn block ghost" data-act="edit-recipient">Change any of this</button></div>';
      return h;
    }
    if (!state.details) {
      h += '<button class="mini-link" data-act="toggle-details">Everything else</button></div>';
      return h;
    }

    h += '<dl style="margin:0">';
    h += fact("Cooking for", headcount(t) + " — " + t.householdNote + ". Leftovers are a blessing.");
    h += fact("Allergies", t.allergies.map(function (a) {
      return '<span class="tag allergy">' + esc(ALLERGY_TAGS[a] ? ALLERGY_TAGS[a].label : a) + "</span>";
    }).join("") + '<div style="font-size:13px;color:var(--muted);margin-top:2px">' + esc(t.allergyNote) +
      " I check what you type against the usual culprits, but I can only read words — " +
      "please read the actual label.</div>", true);
    h += fact("Kosher", esc(t.kosherLevel) + '<div style="font-size:13px;color:var(--muted);margin-top:2px">' +
      esc(t.hechshers) + "</div>", true);
    if (t.loves.length) {
      h += fact("They love", t.loves.map(function (l) {
        return '<span class="tag love">' + esc(l) + "</span>";
      }).join(""), true);
    }
    if (t.dislikes.length) {
      h += fact("Skip", t.dislikes.map(function (l) {
        return '<span class="tag dislike">' + esc(l) + "</span>";
      }).join("") + '<div style="font-size:13px;color:var(--muted);margin-top:2px">Not an allergy. Nobody will ' +
        'say a word.</div>', true);
    }
    if (canSeeAddress()) {
      h += fact("Drop-off", esc(t.address) +
        '<div style="font-size:13px;color:var(--muted);margin-top:2px">' + esc(t.dropoff) + "</div>", true);
    } else {
      h += fact("Drop-off", '<span style="color:var(--muted)">' +
        esc("I'll give you the address the moment you've got a night. No sense telling a whole " +
            "group chat where a new mother lives.") + "</span>", true);
    }
    h += "</dl>";

    h += '<button class="mini-link" data-act="toggle-details">Show less</button></div>';
    return h;
  }

  /* The link gets forwarded well past the people it was meant for. Where a new
     mother lives is not something to hand to a whole group chat, so the address
     waits until somebody has actually taken a night. Organizer and family always
     see it — it's their own house. */
  function canSeeAddress() {
    return state.role !== "neighbor" || myClaims().length > 0;
  }

  /* Two things any real user needs within reach: a person, and somewhere to
     complain. Both are mailto/wa.me — no backend, works from day one. */
  function helpFooter() {
    var t = state.data.train;
    return '<button class="help-btn wide" data-act="keep-link" style="margin-top:14px">' +
        icon("link") + " Keep this link</button>" +
      '<div class="help-row">' +
      '<button class="help-btn" data-act="message-planner">' + icon("chat") + " Ask " +
        esc(t.planner.split(" ")[0]) + "</button>" +
      '<button class="help-btn" data-act="feedback">' + icon("note") + " Something's wrong</button>" +
      "</div>";
  }

  function fact(k, v, raw) {
    return '<div class="fact"><dt>' + esc(k) + "</dt><dd>" + (raw ? v : esc(v)) + "</dd></div>";
  }

  /* --- organizer board ------------------------------------------------------ */

  function boardOrganizer() {
    var t = state.data.train;
    var open = openDays();
    var h = "";

    var lede = t.wrapped
      ? "It's finished, and I've tucked it away. Nothing is lost — it just went quiet. " +
        "Everything's still here whenever you want to look."
      : open.length
        ? "You've got " + listify(open.map(function (x) { return dayName(x.iso); })) + " still open. " +
          "I'll nudge the group whenever you say the word." +
          (state.data.days.filter(function (dd) { return !dd.needed; }).length
            ? " Any day you're skipping is still listed — tap it to slot it back in."
            : "")
        : "Every night is covered. You did that. Now don't go rearranging it just because you can.";
    h += '<div class="golde-note"><span class="gn-mark">golde.</span><span>' + esc(lede) + "</span></div>";


    h += '<div class="panel"><h3>The train</h3>' +
      '<p class="lede" style="margin-bottom:10px">' +
        esc(cap(occasionText(t.occasion)) + " · " + shortDate(t.start) + " to " + shortDate(t.end)) +
      "</p>";
    if (!state.trainOpen) {
      h += '<button class="mini-link" data-act="toggle-train">Change the dates or the occasion</button>' +
        "</div>";
    } else {
      h += '<p class="lede">Change anything, any time. Moving a day around is not a crisis.</p>' +
      '<div class="f"><label for="o-family">Who are we feeding</label>' +
        '<input type="text" id="o-family" data-field="recipientFamily" value="' + esc(t.recipientFamily) + '"></div>' +
      '<div class="f"><label for="o-occasion">What\'s the occasion</label>' +
        '<select id="o-occasion" data-field="occasion">' + occasionOptions(t.occasion) + "</select></div>" +
      '<div class="f-row">' +
        '<div class="f"><label for="o-start">First day</label>' +
          '<input type="date" id="o-start" data-field="start" value="' + esc(t.start) + '"></div>' +
        '<div class="f"><label for="o-end">Last day</label>' +
          '<input type="date" id="o-end" data-field="end" value="' + esc(t.end) + '"></div>' +
      "</div>" +
      '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>Stretch the dates and I\'ll add ' +
        'the new days empty. Shorten them and I\'ll quietly let anyone affected know — nobody gets dropped ' +
        'without hearing it from me first.</span></div>' +
      '<button class="mini-link" data-act="toggle-train">Done</button>' +
      "</div>";
    }

    h += recipientPanel(true);

    h += '<div class="chips seg">' +
      '<button class="chip small" data-act="set-filter" data-filter="open" aria-pressed="' +
        (state.filter === "open") + '">Needs attention (' + open.length + ")</button>" +
      '<button class="chip small" data-act="set-filter" data-filter="all" aria-pressed="' +
        (state.filter === "all") + '">Everything</button>' +
      '<button class="chip small" data-act="set-filter" data-filter="glance" aria-pressed="' +
        (state.filter === "glance") + '">At a glance</button>' +
      "</div>";
    if (state.filter === "glance") {
      h += '<div class="glance-list">';
      state.data.days.forEach(function (day) { h += glanceRow(day); });
      h += "</div>";
    } else {
      state.data.days.forEach(function (day) {
        var hasOpen = day.needed && day.slots.some(function (x) { return !x.filled; });
        if (state.filter === "open") {
          if (hasOpen) h += dayCard(day);
          /* A day nobody is cooking on still needs to be reachable, or there is
             no way to slot one back in. */
          else if (!day.needed) h += addDayRow(day);
          return;
        }
        h += (hasOpen || !day.needed) ? dayCard(day) : compactDay(day);
      });
    }

    h += contactsPanel();

    h += '<div class="panel"><h3>When you need me</h3>' +
      '<p class="lede">One tap each. I\'ll do the asking so you don\'t have to be the one nagging.</p>';
    if (!t.wrapped) {
      h += '<button class="btn block" data-act="nudge" style="margin-bottom:9px"' +
        (open.length ? "" : " disabled") + ">Nudge the group about the open " +
        plural(open.length, "night", "nights") + "</button>";
      h += '<button class="btn block ghost" data-act="wrap">Wrap up the train</button>';
    } else {
      h += '<p class="lede" style="margin:0">All done. Nothing left for you to do, and that\'s the whole point.</p>';
    }
    h += "</div>";
    h += '<button class="help-btn wide" data-act="feedback">' + icon("note") +
      " Something's wrong — tell us</button>";

    return h;
  }

  /* --- the contact book (organizer only) ------------------------------------
     Every neighbor Golde can reach, and whether they've said yes to hearing
     from her. This is the piece that makes the real product work: she talks to
     people one to one, so the list of who she may talk to is the product. */

  function contactStatus(name) {
    var first = name.split(" ")[0].toLowerCase();
    var hit = filledSlots().filter(function (x) {
      return x.slot.by && x.slot.by.split(" ")[0].toLowerCase() === first;
    })[0];
    if (!hit) return null;
    return hit;
  }

  function contactsPanel() {
    var t = state.data.train;
    var contacts = state.data.contacts || [];
    var unsigned = contacts.filter(function (c) { return c.optedIn && !contactStatus(c.name); });
    var quiet = contacts.filter(function (c) { return !c.optedIn && c.channel !== "calendar"; });

    var h = '<div class="panel"><h3>Your people</h3>' +
      '<p class="lede">Everyone I can reach, and where they are this week. I message people one ' +
      'at a time — a reminder in a group chat is just noise.</p>';

    var needsSomething = contacts.filter(function (c) { return !c.optedIn || !contactStatus(c.name); });
    var settled = contacts.filter(function (c) { return c.optedIn && contactStatus(c.name); });
    var shown = state.contactsOpen ? contacts : needsSomething;

    shown.forEach(function (c) {
      var got = contactStatus(c.name);
      h += '<div class="contact">' +
        '<div class="contact-main">' +
          '<div class="contact-name">' + esc(c.name) +
            (c.optedIn ? "" : ' <span class="badge quiet">not opted in</span>') + "</div>" +
          '<div class="contact-sub">' + esc(c.phone) +
            (c.channel ? ' <span class="via">' + esc(channelDef(c.channel).label) + "</span>" : "") +
          "</div>" +
          '<div class="contact-state' + (got ? " has" : "") + '">' +
            (got
              ? esc(dayName(got.day.iso) + " — " + lowerFirst(got.slot.dish))
              : c.optedIn ? "Nothing yet"
                : c.channel === "calendar" ? "Keeps her own calendar — I don't write to her"
                : "Hasn't said I may write to her") +
          "</div>" +
        "</div>" +
        /* Two actions at most. A wall of links is the same problem as a wall of words. */
        '<div class="contact-acts">' +
          (!c.optedIn
            ? '<button class="mini-link" data-act="toggle-optin" data-contact="' + c.id +
              '">She said yes</button>'
            : got
              ? ""
              : '<button class="mini-link" data-act="ask-directly" data-contact="' + c.id +
                '">Ask her myself</button>') +
          '<button class="mini-link danger" data-act="remove-contact" data-contact="' + c.id +
            '">Remove</button>' +
        "</div></div>";
    });

    if (settled.length) {
      h += '<button class="mini-link" data-act="toggle-contacts" style="margin-top:10px">' +
        (state.contactsOpen
          ? "Hide the " + settled.length + " who are sorted"
          : settled.length + " more, all sorted — show them") + "</button>";
    }

    h += '<div class="f" style="margin:14px 0 0"><label for="new-contact">Add someone</label>' +
      '<div class="hint">A name is enough. I\'ll ask her myself whether she wants to hear from me.</div>' +
      '<input type="text" id="new-contact" placeholder="Faigy Berkowitz" data-newcontact="1"></div>';

    if (unsigned.length) {
      h += '<button class="btn block ghost" style="margin-top:4px" data-act="nudge-unsigned">' +
        "Write to the " + unsigned.length + " who " + plural(unsigned.length, "hasn't", "haven't") +
        " taken a night</button>";
    }
    if (quiet.length) {
      h += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc(listify(quiet.map(function (c) { return c.name.split(" ")[0]; })) + " " +
            plural(quiet.length, "hasn't", "haven't") + " said I may write to " +
            plural(quiet.length, "her", "them") + " yet, so I won't. Somebody should ask in person.") +
        "</span></div>";
    }

    h += "</div>";
    return h;
  }

  function occasionOptions(sel) {
    var opts = [
      ["new-baby", "A new baby"], ["shiva", "A shiva"], ["recovery", "Recovery from surgery"],
      ["moving-in", "Someone moving in"], ["new-to-community", "New to the community"],
      ["just-because", "Just because"]
    ];
    return opts.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === sel ? " selected" : "") + ">" + o[1] + "</option>";
    }).join("");
  }

  /* --- family board --------------------------------------------------------- */

  function boardFamily() {
    var t = state.data.train;
    var h = "";

    h += '<div class="golde-note"><span class="gn-mark">golde.</span><span>' +
      esc("You don't owe anybody a form. Fill in what helps, skip what doesn't, and " +
          "change your mind as many times as you like — I'll keep everyone updated so you never have to " +
          "explain yourself twice.") + "</span></div>";

    h += '<div class="panel"><h3>Only if it helps</h3>' +
      '<p class="lede">No pressure at all. If there\'s something that would make this week a little sweeter, ' +
      'tell me and I\'ll pass it along quietly. Nobody has to know it came from you.</p>' +

      '<div class="f"><label for="f-loves">Things you\'d be happy to see</label>' +
        '<div class="hint">One per line. Or leave it blank — that\'s an answer too.</div>' +
        '<textarea id="f-loves" data-field="loves">' + esc(t.loves.join("\n")) + "</textarea></div>" +

      '<div class="f"><label for="f-dislikes">Things to skip</label>' +
        '<div class="hint">Not allergies — just the things nobody in the house finishes.</div>' +
        '<input type="text" id="f-dislikes" data-field="dislikes" value="' + esc(t.dislikes.join(", ")) + '"></div>' +

      '<div class="f"><span class="f-legend">Real allergies</span>' +
        '<div class="hint">These are the serious ones. I\'ll stop anybody who types something risky, before ' +
        'they\'ve cooked it — not at your door.</div>' +
        '<div class="chips">' +
          '<button class="chip small" data-act="clear-allergies" aria-pressed="' +
            (!t.allergies.length && !(t.otherAllergies || "").trim()) + '">None</button>' +
          Object.keys(ALLERGY_TAGS).map(function (k) {
            var on = t.allergies.indexOf(k) > -1;
            return '<button class="chip small" data-act="toggle-allergy" data-tag="' + k +
              '" aria-pressed="' + on + '">' + esc(ALLERGY_TAGS[k].label) + "</button>";
          }).join("") + "</div>" +
        '<div class="hint" style="margin-top:9px">Anything else — dairy, soy, strawberries. ' +
        'I check these against dishes exactly like the buttons above.</div>' +
        '<input type="text" data-field="otherAllergies" placeholder="dairy, strawberries" ' +
        'value="' + esc(t.otherAllergies || "") + '"></div>' +

      '<div class="f-row">' +
        '<div class="f"><label for="f-adults">Adults</label>' +
          '<input type="text" id="f-adults" data-field="adults" value="' + esc(t.adults) + '"></div>' +
        '<div class="f"><label for="f-teens">Teens</label>' +
          '<input type="text" id="f-teens" data-field="teens" value="' + esc(t.teens || 0) + '"></div>' +
        '<div class="f"><label for="f-littles">Little ones</label>' +
          '<input type="text" id="f-littles" data-field="littles" value="' + esc(t.littles || 0) + '"></div>' +
      "</div>" +
      '<div class="hint" style="margin:-6px 0 10px">Teenagers eat more than adults and little ' +
      'ones eat almost nothing. It genuinely changes the shop.</div>' +
      '<div class="f"><label for="f-headnote">Anything else about who is eating</label>' +
        '<div class="hint">A new baby, someone staying, a grandmother who eats like a bird.</div>' +
        '<input type="text" id="f-headnote" data-field="headNote" value="' +
        esc(t.headNote || "") + '"></div>' +

      '<div class="f"><label for="f-kosher">Kosher</label>' +
        '<input type="text" id="f-kosher" data-field="kosherLevel" value="' + esc(t.kosherLevel) + '"></div>' +
      '<div class="toggle-row"><div class="tr-main">' +
        '<div class="tr-title">Show me what\'s coming</div>' +
        '<div class="tr-sub">Some like to know. Some like the surprise. Both are normal.</div></div>' +
        '<button class="switch" data-act="toggle-surprise" aria-pressed="' + t.showDishes + '" ' +
        'aria-label="Show what is coming"></button></div>' +
      "</div>";

    h += '<div class="panel"><h3>Getting it to your door</h3>';
    if (!state.deliveryOpen) {
      h += '<p class="lede" style="margin-bottom:10px">' +
        esc(t.address + " · " + (t.ringBell ? "ring the bell" : "leave it at the door")) + "</p>" +
        '<button class="mini-link" data-act="toggle-delivery">Change any of this</button></div>';
    } else {
      h += '<div class="f"><label for="f-address">Where to bring it</label>' +
        '<input type="text" id="f-address" data-field="address" value="' + esc(t.address) + '"></div>' +
      '<div class="f"><label for="f-dropoff">What should they do when they get there</label>' +
        '<textarea id="f-dropoff" data-field="dropoff">' + esc(t.dropoff) + "</textarea></div>" +

      '<div class="toggle-row"><div class="tr-main">' +
        '<div class="tr-title">Ring the bell</div>' +
        '<div class="tr-sub">Off means leave it at the door and go — no small talk required, ' +
        'and nobody will take it personally.</div></div>' +
        '<button class="switch" data-act="toggle-bell" aria-pressed="' + t.ringBell + '" ' +
        'aria-label="Ring the bell"></button></div>' +

        '<button class="mini-link" data-act="toggle-delivery" style="margin-top:6px">Done</button>' +
      "</div>";
    }

    h += '<div class="section-label">This week</div>';
    state.data.days.forEach(function (day) {
      var settled = day.needed && !day.slots.some(function (x) { return !x.filled; });
      h += settled ? compactDay(day) : dayCard(day);
    });

    var kept = filledSlots().filter(function (x) { return x.slot.recipe; });
    if (kept.length) {
      h += '<div class="panel"><h3>Recipes they gave you</h3>' +
        '<p class="lede">Yours to keep, long after the week is over.</p>';
      kept.forEach(function (x) {
        h += '<div class="fact"><dt>' + esc(x.slot.by.split(" ")[0]) + "</dt><dd>" +
          '<button class="mini-link" data-act="see-recipe" data-slot="' + x.slot.id + '">' +
          esc(cap(shortDish(x.slot.dish))) + "</button>" +
          (x.slot.recipeScope === "book"
            ? ' <span class="badge quiet">shared for the book</span>'
            : "") + "</dd></div>";
      });
      h += "</div>";
    }

    h += '<div class="panel"><h3>When it\'s too much</h3>' +
      '<p class="lede">You\'re allowed to have enough. Nobody is owed an explanation.</p>';

    /* Calling off a night somebody has already shopped and cooked for is not
       generosity, it's waste with a kind face on it. Anything already claimed
       goes through the organizer, who can judge it. */
    var imminent = filledSlots().filter(function (x) { return !x.slot.delivered; });
    if (t.paused) {
      h += '<button class="btn block" data-act="unpause">We\'re ready for meals again</button>';
    } else if (imminent.length) {
      h += '<div class="golde-note tight" style="margin:0 0 12px"><span class="gn-mark">golde.</span><span>' +
        esc(listify(imminent.map(function (x) { return x.slot.by.split(" ")[0]; })) + " " +
            plural(imminent.length, "has", "have") + " already got shopping in for you. Let me not " +
            "call that off over your head — have a word with " + organizerName() +
            ", who can sort it kindly.") + "</span></div>" +
        '<button class="btn block" data-act="message-organizer-pause">Message ' +
          esc(organizerName().split(" ")[0]) + " about it</button>" +
        '<button class="btn block quiet" style="margin-top:9px" data-act="pause">' +
          "Stop anything not yet claimed</button>";
    } else {
      h += '<button class="btn block ghost" data-act="pause">Give everyone the week off</button>';
    }
    h += '<button class="btn block quiet" style="margin-top:9px" data-act="say-thanks">' +
      "Say thank you to everyone</button>";
    h += "</div>";
    h += helpFooter();

    return h;
  }


  /* ===========================================================================
     SETUP — the one conversation that really is WhatsApp
     ---------------------------------------------------------------------------
     The organizer messages golde. first, and that is precisely what makes this
     buildable: a user-initiated message opens a 24-hour window in which a
     business may reply in free-form, with no pre-approved templates. Everything
     that ruled out a bot sitting in a group chat does not apply here.

     So this screen is styled as a chat, unlike the rest of the app — because
     here that is not an imitation, it is the medium.
     =========================================================================== */

  var SETUP = [
    { id: "start",
      say: function () { return ["Hello. What can I do for you?"]; },
      chips: [{ label: "I need a meal train", value: "yes" }] },

    { id: "family",
      say: function () { return ["Of course. Who are we feeding?"]; },
      input: { placeholder: "The Cohen family", send: "That's them" } },

    { id: "occasion",
      say: function (a) { return ["And what's happened for " + a.family + ", if I may ask?"]; },
      chips: [
        { label: "A baby", value: "new-baby" },
        { label: "A shiva", value: "shiva" },
        { label: "Surgery", value: "recovery" },
        { label: "Just moved in", value: "moving-in" },
        { label: "New here", value: "new-to-community" },
        { label: "No reason", value: "just-because" }
      ] },

    { id: "length",
      say: function (a) {
        var opener = {
          "new-baby": "Mazal tov! That's the best news I've had all week.",
          "shiva": "I'm so sorry. May they be comforted.",
          "recovery": "Refuah shleimah. Poor thing.",
          "moving-in": "How nice. Boxes everywhere, I imagine.",
          "new-to-community": "Then let's make sure they feel it.",
          "just-because": "You don't need a reason. Good for you for noticing."
        }[a.occasion];
        return [opener, "How long shall I run it for?"];
      },
      chips: [
        { label: "A week", value: "7" },
        { label: "Two weeks", value: "14" },
        { label: "Just a few days", value: "4" }
      ] },

    { id: "cadence",
      say: function () {
        return ["Every day, or every other day? Plenty of people find every other " +
                "is enough — there are usually leftovers."];
      },
      chips: [
        { label: "Every other day", value: "alternate" },
        { label: "Every day", value: "daily" },
        { label: "I'll pick the days myself", value: "manual" }
      ] },

    { id: "adults",
      say: function () { return ["How many adults are we cooking for?"]; },
      chips: [
        { label: "1", value: "1" }, { label: "2", value: "2" },
        { label: "3", value: "3" }, { label: "4", value: "4" },
        { label: "More", value: "6" }
      ] },

    { id: "teens",
      say: function () { return ["Any teenagers? They eat like adults and a half."]; },
      chips: [
        { label: "None", value: "0" }, { label: "1", value: "1" },
        { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "More", value: "4" }
      ] },

    { id: "littles",
      say: function () { return ["And little ones?"]; },
      chips: [
        { label: "None", value: "0" }, { label: "1", value: "1" },
        { label: "2", value: "2" }, { label: "3", value: "3" },
        { label: "4", value: "4" }, { label: "More", value: "5" }
      ] },

    { id: "headNote",
      say: function () {
        return ["Anything else about who's eating? A new baby, someone staying, " +
                "a fussy one — whatever you'd mention on the phone."];
      },
      input: { placeholder: "a new baby, and my mother is staying", send: "That's it" },
      skip: { label: "Nothing else", value: "" } },

    { id: "allergies",
      say: function () {
        return ["Any allergies? The real ones — the kind that send somebody to hospital."];
      },
      chips: [
        { label: "None", value: "" },
        { label: "Nuts", value: "no-nuts" },
        { label: "Gluten", value: "gluten-free" },
        { label: "Eggs", value: "no-eggs" },
        { label: "Sesame", value: "no-sesame" }
      ] },

    { id: "otherAllergies",
      say: function () {
        return ["Anything else I should watch for? Dairy, soy, strawberries — whatever " +
                "it is, type it and I'll flag it when somebody types a dish."];
      },
      input: { placeholder: "dairy, strawberries", send: "That's it" },
      skip: { label: "Nothing else", value: "" } },

    { id: "address",
      say: function () {
        return ["Do you have their address? If not, later is absolutely fine — " +
                "I won't hold anything up over it."];
      },
      input: { placeholder: "418 Marion Street", send: "That's it" },
      skip: { label: "I'll add it later", value: "" } },

    { id: "done",
      say: function (a) {
        return [
          "That's everything I need.",
          "Here's your board. Set the days you'd like covered, and there's a button on it to " +
            "send the whole thing to your group — you won't be copying and pasting anything.",
          a.cadence === "alternate"
          ? "I've set it to every other day. Change any of them on the board."
          : a.cadence === "manual"
            ? "All the days are on there — turn off the ones they don't need."
            : "Every day is on there. Turn off any they don't need.",
        a.address ? "I've got the address, so nobody will have to ask you for it."
                  : "No address yet — I'll ask the family myself so it isn't another job for you."
        ];
      },
      card: true }
  ];

  function setupStep() { return SETUP[state.setup.i] || SETUP[SETUP.length - 1]; }

  function renderSetup() {
    var st = state.setup;
    var step = setupStep();

    var h = '<header class="topbar wa">' +
      '<div><div class="topbar-mark">golde.</div>' +
      '<div class="topbar-sub">WhatsApp · online</div></div></header>';

    h += '<div class="viewing-as">A real WhatsApp chat — you messaged her first</div>';
    h += '<div class="scroller wa-bg" id="setup-scroll">';

    st.log.forEach(function (m) {
      h += '<div class="wa-row ' + (m.me ? "out" : "in") + '"><div class="wa-bubble">' +
        m.text.map(function (x) { return "<p>" + esc(x) + "</p>"; }).join("") + "</div></div>";
    });

    if (step.card) {
      h += '<div class="wa-row in"><div class="wa-bubble">' + renderBoardCard() + "</div></div>";
    }

    h += "</div>";

    h += '<div class="wa-actions">';
    if (step.chips) {
      h += '<div class="chips">' + step.chips.map(function (c, i) {
        return '<button class="chip small" data-act="setup-chip" data-i="' + i + '">' +
          esc(c.label) + "</button>";
      }).join("") + "</div>";
    }
    if (step.input) {
      h += '<form class="ask-form" data-act="setup-send">' +
        '<input class="ask-field" id="setup-field" autocomplete="off" placeholder="' +
          esc(step.input.placeholder) + '" aria-label="Your answer">' +
        '<button class="ask-send" type="submit" aria-label="Send">' + icon("send") + "</button></form>";
      if (step.skip) {
        h += '<button class="mini-link" data-act="setup-skip" style="margin-top:8px">' +
          esc(step.skip.label) + "</button>";
      }
    }
    if (step.card) {
      h += '<button class="btn block" data-act="finish-setup">Open my board</button>';
    }
    /* Demo-only. Nobody should have to set up a train twice to see the rest. */
    h += '<button class="mini-link" data-act="skip-setup" style="margin-top:10px">' +
      "Skip this — show me a train already in motion</button>";
    h += "</div>";
    return h;
  }

  function setupAdvance(answerText, key, value) {
    var st = state.setup;
    if (answerText) st.log.push({ me: true, text: [answerText] });
    if (key) st.answers[key] = value;
    st.i += 1;
    var step = setupStep();
    /* Build the train before she shows it, or the card she hands over describes
       somebody else's week. */
    if (step.card) applySetup();
    st.log.push({ me: false, text: step.say(st.answers).filter(Boolean) });
    render();
    setTimeout(function () {
      var el = $("#setup-scroll");
      if (el) el.scrollTop = el.scrollHeight;
    }, 40);
  }

  /* Everything she was told becomes the train. */
  function applySetup() {
    var a = state.setup.answers;
    var t = state.data.train;
    if (a.family) {
      t.recipientFamily = a.family;
      t.title = "Meals for " + a.family;
    }
    if (a.occasion) t.occasion = a.occasion;
    if (a.adults) t.adults = parseInt(a.adults, 10);
    if (a.teens !== undefined && a.teens !== "") t.teens = parseInt(a.teens, 10);
    if (a.littles !== undefined && a.littles !== "") t.littles = parseInt(a.littles, 10);
    t.headNote = a.headNote || "";
    t.otherAllergies = a.otherAllergies || "";
    if (a.address) t.address = a.address;
    t.allergies = a.allergies ? [a.allergies] : [];
    if (a.length) {
      var start = d(t.start);
      var end = new Date(start);
      end.setDate(end.getDate() + parseInt(a.length, 10) - 1);
      t.end = end.getFullYear() + "-" + pad(end.getMonth() + 1) + "-" + pad(end.getDate());
      regenDays();
    }
    /* A brand-new train has nobody on it — that is the honest starting state. */
    state.data.days.forEach(function (day, i) {
      day.slots = [{ id: "n" + (++state.slotSeq), filled: false }];
      /* Every other day is what most people actually run: there are leftovers,
         and asking twenty neighbours for seven nights is a harder ask than four. */
      if (a.cadence === "alternate") {
        day.needed = i % 2 === 0;
        if (!day.needed) day.offReason = "Leftovers from yesterday. Nobody needs to cook.";
      } else {
        day.needed = true;
        delete day.offReason;
      }
    });
    state.data.messages = [{
      id: "s1", from: "golde", dir: "in", time: "10:02", card: "board",
      text: ["Here's the board for " + t.recipientFamily + ". Nothing on it yet — " +
             "send it round and let's fill it up."]
    }];
    state.role = "organizer";
    state.filter = "open";
  }

  function finishSetup() { goto("board"); }

  /* ===========================================================================
     8. SHEETS (bottom sheets / modals)
     =========================================================================== */

  function renderSheet() {
    var host = $("#sheet-host"), scrim = $("#scrim");
    if (!state.sheet) {
      host.hidden = true; scrim.hidden = true; host.innerHTML = "";
      return;
    }
    host.hidden = false; scrim.hidden = false;
    host.innerHTML = SHEETS[state.sheet.kind] ? SHEETS[state.sheet.kind](state.sheet) : "";

    var dishField = host.querySelector("#claim-dish");
    if (dishField) {
      dishField.addEventListener("input", function () {
        state.form.dish = dishField.value;
        var hintEl = host.querySelector("#live-hint");
        if (!hintEl) return;
        var hint = liveHint(state.sheet.dayId, dishField.value);
        hintEl.className = "livehint" + (hint ? " " + hint.kind : "");
        hintEl.textContent = hint ? hint.text : "";
      });
      setTimeout(function () { dishField.focus(); }, 260);
    }
    var nameField = host.querySelector("#claim-name");
    if (nameField) {
      nameField.addEventListener("input", function () { state.form.name = nameField.value; });
    }
    var contactField = host.querySelector("#claim-contact");
    if (contactField) {
      contactField.addEventListener("input", function () { state.form.contact = contactField.value; });
    }
    var recipeField = host.querySelector("#recipe-text");
    if (recipeField) {
      recipeField.addEventListener("input", function () { state.form.recipe = recipeField.value; });
      setTimeout(function () { recipeField.focus(); }, 260);
    }
    var thanksField = host.querySelector("#thanks-text");
    if (thanksField) {
      thanksField.addEventListener("input", function () { state.form.thanks = thanksField.value; });
    }
    var noteField = host.querySelector("#claim-note");
    if (noteField) {
      noteField.addEventListener("input", function () { state.form.note = noteField.value; });
    }
  }

  function sheetShell(title, sub, body, foot) {
    return '<div class="sheet">' +
      '<div class="sheet-grab" aria-hidden="true"></div>' +
      '<div class="sheet-head"><h2>' + title + "</h2>" +
        (sub ? '<div class="sub">' + sub + "</div>" : "") + "</div>" +
      '<div class="sheet-body">' + body + "</div>" +
      '<div class="sheet-foot">' + foot + "</div>" +
      "</div>";
  }

  var SHEETS = {};

  /* --- claiming a night ----------------------------------------------------- */

  SHEETS.claim = function (s) {
    var t = state.data.train;
    var day = findDay(s.dayId);
    var mode = state.form.mode || "cook";

    var sub = day
      ? esc(dateLabel(day.iso) + " · " + windowText(day) +
        (day.candle ? " (candles at " + day.candle + ")" : ""))
      : "";

    var body = "";

    if (day) {
      body += '<div class="golde-note"><span class="gn-mark">golde.</span><span>' +
        esc("Cooking for " + headcount(t) + " — " + t.householdNote + ". " +
            (day.candle
              ? "At the door by " + day.to + ", before candles."
              : "Anywhere between " + day.from + " and " + day.to + ".")) +
        "</span></div>";
    }

    body += '<div class="f"><span class="f-legend">What are you thinking?</span>' +
      '<div class="chips">' +
        modeChip("cook", "I'm cooking", mode) +
        modeChip("nocook", "I don't cook", mode) +
      "</div></div>";

    if (mode === "cook") {
      var goTo = (state.data.cook.goTo || []);
      if (goTo.length) {
        var judged = goTo.map(function (dish) {
          return { dish: dish, clash: runChecks(s.dayId, dish)[0] || null };
        });
        var awkward = judged.filter(function (j) { return j.clash; }).length;
        body += '<div class="f"><span class="f-legend">Your usual</span>';
        if (awkward) {
          body += '<div class="hint">' +
            esc("I've faded the " + (awkward === 1 ? "one that doesn't" : awkward + " that don't") +
                " quite suit " + dayName(day.iso) + ". Tap " + plural(awkward, "it", "them") +
                " anyway if you like — I'm only noticing.") +
            "</div>";
        }
        body += '<div class="chips">' + judged.map(function (j, i) {
          return '<button class="chip small' + (j.clash ? " faded" : "") + '" data-act="use-goto" ' +
            'data-i="' + i + '"' + (j.clash ? ' title="' + esc(j.clash.text) + '"' : "") + ">" +
            esc(j.dish) + "</button>";
        }).join("") + "</div></div>";
      }

      body += '<div class="f"><label for="claim-dish">What are you bringing?</label>' +
        '<div class="hint">However you\'d say it out loud. “A big pot of soup” is a fine answer.</div>' +
        '<textarea id="claim-dish" placeholder="A pot of chicken soup and a challah">' +
          esc(state.form.dish || "") + "</textarea>" +
        '<div class="livehint" id="live-hint"></div></div>';

      if (t.loves.length) {
        body += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
          esc("If you're stuck: they love " + listify(t.loves) + ".") +
          "</span></div>";
      }
    } else {
      var kind = state.form.kind || "groceries";
      body += '<div class="f"><span class="f-legend">How would you like to help?</span>' +
        '<div class="hint">Just as good as a casserole. Better, some weeks.</div>' +
        '<div class="chips">' +
          kindChip("groceries", "🧺 Groceries", kind) +
          kindChip("giftcard", "💌 A gift card", kind) +
          kindChip("orderin", "🛵 Order in for them", kind) +
        "</div></div>";
      body += '<div class="f"><label for="claim-note">Anything you want them to know?</label>' +
        '<div class="hint">Optional.</div>' +
        '<textarea id="claim-note" placeholder="Milk, eggs, coffee, and something for the little ones">' +
          esc(state.form.note || "") + "</textarea></div>";
    }

    body += '<div class="f"><label for="claim-name">Your name</label>' +
      '<div class="hint">So they know who to thank. No account, nothing to remember.</div>' +
      '<input type="text" id="claim-name" placeholder="Chani Gold" value="' + esc(state.form.name || "") + '"></div>';

    /* Signing up is the opt-in. This is the moment she's allowed to ask how to
       reach you, and the only moment — so she asks once, warmly, and never again. */
    var ch = state.form.channel || "whatsapp";
    body += '<div class="f"><span class="f-legend">How should I remind you?</span>' +
      '<div class="hint">The day before, so you don\'t have to hold it in your head.</div>' +
      '<div class="chips">' +
        CHANNELS.map(function (c) {
          return '<button class="chip small" data-act="set-channel" data-channel="' + c.key +
            '" aria-pressed="' + (ch === c.key) + '">' + esc(c.label) + "</button>";
        }).join("") +
      "</div></div>";

    var def = channelDef(ch);
    if (def.needs) {
      body += '<div class="f"><label for="claim-contact">' + esc(def.fieldLabel) + "</label>" +
        '<div class="hint">Just me — it never shows up on the board. And nothing here is saved; ' +
        'this is a demo.</div>' +
        '<input type="' + (def.needs === "email" ? "email" : "tel") + '" id="claim-contact" ' +
        'placeholder="' + esc(def.placeholder) + '" value="' + esc(state.form.contact || "") + '"></div>';
    } else if (ch === "calendar") {
      body += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc("I'll hand you a calendar file and your own phone will do the nagging. " +
            "No number, nothing for me to hold onto.") + "</span></div>";
    } else {
      body += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc("Not a word from me, then. You know your own head best.") + "</span></div>";
    }

    var label = day ? "Sign me up for " + esc(dayName(day.iso)) : "Sign me up";
    var foot = '<button class="btn block" data-act="submit-claim">' + label + "</button>" +
      '<button class="btn block quiet" data-act="close-sheet">Not right now</button>';

    return sheetShell(day ? esc(dayName(day.iso)) + " is yours if you want it" : "Helping out", sub, body, foot);
  };

  /* --- how she reaches you --------------------------------------------------
     Signing up for a night is the opt-in. That's what makes a 1:1 WhatsApp
     reminder legitimate — and it's why she asks here and nowhere else. */

  var CHANNELS = [
    { key: "whatsapp", label: "WhatsApp", short: "on WhatsApp", needs: "phone",
      fieldLabel: "Your WhatsApp number", placeholder: "(555) 014-0000" },
    { key: "sms", label: "Text me", short: "by text", needs: "phone",
      fieldLabel: "Your mobile number", placeholder: "(555) 014-0000" },
    { key: "email", label: "Email", short: "by email", needs: "email",
      fieldLabel: "Your email", placeholder: "you@example.com" },
    { key: "calendar", label: "My calendar", short: "in your calendar", needs: null },
    { key: "none", label: "I'll remember", short: "not at all", needs: null }
  ];

  function channelDef(key) {
    return CHANNELS.filter(function (c) { return c.key === key; })[0] || CHANNELS[0];
  }

  /* A real .ics, built in the browser and handed over as a download. No backend,
     no API, no opt-in needed — their own phone does the reminding. */
  function calendarFile(day, slot) {
    var t = state.data.train;
    var d0 = day.iso.replace(/-/g, "");
    var start = d0 + "T" + to24(day.from) + "00";
    var end = d0 + "T" + to24(day.to) + "00";
    var desc = [
      "Dinner for " + t.recipientFamily + ".",
      "You said: " + slot.dish,
      "Cooking for " + headcount(t) + " — " + t.householdNote + ".",
      t.allergies.length ? "Allergies: " + t.allergies.map(function (a) {
        return ALLERGY_TAGS[a] ? ALLERGY_TAGS[a].label : a; }).join(", ") + "." : "",
      t.dislikes.length ? "Skip: " + t.dislikes.join(", ") + "." : "",
      day.candle ? "At the door by " + day.to + " — candles at " + day.candle + "." : "",
      t.dropoff
    ].filter(Boolean).join("\\n");

    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//golde//meals//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + day.id + "-" + slot.id + "@golde.meals",
      "DTSTAMP:" + d0 + "T000000",
      "DTSTART:" + start,
      "DTEND:" + end,
      "SUMMARY:Dinner for " + t.recipientFamily,
      "LOCATION:" + t.address.replace(/,/g, "\\,"),
      "DESCRIPTION:" + desc.replace(/,/g, "\\,"),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY",
      "DESCRIPTION:Tomorrow's your night for " + t.recipientFamily,
      "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");

    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "dinner-for-" + t.recipientFamily.replace(/[^a-z]/gi, "-").toLowerCase() + ".ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  /* "4:30" in this app always means the afternoon. */
  function to24(t) {
    var parts = String(t).split(":");
    var h = parseInt(parts[0], 10);
    if (h < 12) h += 12;
    return (h < 10 ? "0" + h : h) + (parts[1] || "00");
  }

  function modeChip(v, label, cur) {
    return '<button class="chip" data-act="set-mode" data-mode="' + v + '" aria-pressed="' +
      (cur === v) + '">' + esc(label) + "</button>";
  }
  function kindChip(v, label, cur) {
    return '<button class="chip" data-act="set-kind" data-kind="' + v + '" aria-pressed="' +
      (cur === v) + '">' + esc(label) + "</button>";
  }

  /* --- pick a day (for the "I don't cook" entry point with no day chosen) --- */

  SHEETS.pickday = function (s) {
    var body = '<p class="golde-say">Which night works for you? Anything with nobody on it is fair game, ' +
      'and if none of them fit, that\'s alright too — there\'ll be another family next month.</p>';
    var open = openDays();
    if (!open.length) {
      body += '<p class="golde-say">Would you look at that — every night is taken. What a group.</p>';
    }
    open.forEach(function (day) {
      var slot = day.slots.filter(function (x) { return !x.filled; })[0];
      body += '<button class="btn block ghost" style="margin-bottom:9px;text-align:left" data-act="claim" ' +
        'data-day="' + day.id + '" data-slot="' + slot.id + '" data-mode="' + esc(s.mode || "cook") + '">' +
        esc(dayName(day.iso) + ", " + dateLabel(day.iso)) + " · " + esc(windowText(day)) + "</button>";
    });
    return sheetShell("Pick a night", "", body,
      '<button class="btn block quiet" data-act="close-sheet">Never mind</button>');
  };

  /* --- the gentle check pop ------------------------------------------------- */

  SHEETS.concerns = function (s) {
    var body = "";
    s.concerns.forEach(function (c) {
      body += '<div class="concern ' + esc(c.kind) + '">' + esc(c.text) + "</div>";
    });
    body += '<p class="golde-say" style="margin-top:14px;font-size:16px;color:var(--muted)">' +
      "I'm not stopping you. I just notice things.</p>";

    var foot = '<button class="btn block ghost" data-act="close-concerns">Let me rethink it</button>' +
      '<button class="btn block" data-act="force-claim">It\'s fine — sign me up</button>';

    return sheetShell("One moment", "", body, foot);
  };

  /* --- cancel --------------------------------------------------------------- */

  SHEETS.cancel = function (s) {
    var loc = locateSlot(s.slotId);
    var dayLabel = loc ? dayName(loc.day.iso) : "your night";
    var body = '<p class="golde-say">Life happens. Don\'t give it another thought.</p>' +
      '<p class="golde-say">I\'ll open ' + esc(dayLabel) + ' back up and quietly let the others know. ' +
      'Nobody will ask you why, and if anybody does, send them to me.</p>' +
      '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
      esc("If it's just this week that's bad, say so and I'll come find you for the next one. " +
          "You're not on any list.") + "</span></div>";
    var foot = '<button class="btn block" data-act="confirm-cancel" data-slot="' + esc(s.slotId) + '">' +
      "Yes, please open it back up</button>" +
      '<button class="btn block quiet" data-act="close-sheet">Actually, I\'ve got it</button>';
    return sheetShell("Of course", "", body, foot);
  };

  /* --- swap ----------------------------------------------------------------- */

  SHEETS.swap = function (s) {
    var loc = locateSlot(s.slotId);
    var body = '<p class="golde-say">Easiest thing in the world. Pick the night that works better and ' +
      'I\'ll move everything over — the group, the reminder, all of it.</p>';
    var open = openDays();
    if (!open.length) {
      body += '<p class="golde-say">Only trouble is every other night is taken right now. Cancel yours ' +
        'instead and I\'ll find someone — that\'s not a failure, that\'s just Tuesday.</p>';
    }
    open.forEach(function (day) {
      var slot = day.slots.filter(function (x) { return !x.filled; })[0];
      body += '<button class="btn block ghost" style="margin-bottom:9px;text-align:left" ' +
        'data-act="confirm-swap" data-slot="' + esc(s.slotId) + '" data-day="' + day.id +
        '" data-target="' + slot.id + '">' +
        esc(dayName(day.iso) + ", " + dateLabel(day.iso)) + "</button>";
    });
    void loc;
    return sheetShell("Let's move it", "", body,
      '<button class="btn block quiet" data-act="close-sheet">Leave it where it is</button>');
  };

  /* --- organizer: edit a day ------------------------------------------------ */

  SHEETS.editday = function (s) {
    var day = findDay(s.dayId);
    if (!day) return "";
    var body = '<div class="f"><span class="f-legend">What are they hoping for?</span>' +
      '<div class="hint">A wish, not a rule. I\'ll mention it softly if somebody types the other thing.</div>' +
      '<div class="chips">' +
        ["meat", "dairy", "pareve", "any"].map(function (k) {
          var lab = { meat: "Meat", dairy: "Dairy", pareve: "Pareve", any: "No preference" }[k];
          return '<button class="chip" data-act="set-kosher" data-day="' + day.id + '" data-k="' + k +
            '" aria-pressed="' + (day.kosher === k) + '">' + lab + "</button>";
        }).join("") +
      "</div></div>" +
      '<div class="f-row">' +
        '<div class="f"><label for="ed-from">Window opens</label>' +
          '<input type="text" id="ed-from" data-dayfield="from" data-day="' + day.id + '" value="' + esc(day.from) + '"></div>' +
        '<div class="f"><label for="ed-to">Must be there by</label>' +
          '<input type="text" id="ed-to" data-dayfield="to" data-day="' + day.id + '" value="' + esc(day.to) + '"></div>' +
      "</div>";

    if (isFriday(day.iso)) {
      body += '<div class="f"><label for="ed-candle">Candle-lighting</label>' +
        '<div class="hint">I hold everyone to this one. Nothing arrives after candles.</div>' +
        '<input type="text" id="ed-candle" data-dayfield="candle" data-day="' + day.id + '" value="' +
        esc(day.candle || "") + '"></div>';
    }

    body += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
      esc("Change whatever you need. Anybody already signed up for this day hears it from me, not from a " +
          "notification that sounds like a parking ticket.") + "</span></div>";

    return sheetShell(esc(dayName(day.iso)), esc(dateLabel(day.iso)), body,
      '<button class="btn block" data-act="close-sheet">That\'s better</button>');
  };

  /* --- organizer: edit what someone is bringing ----------------------------- */

  SHEETS.editslot = function (s) {
    var loc = locateSlot(s.slotId);
    if (!loc) return "";
    var body = '<div class="f"><label for="es-by">Who\'s bringing it</label>' +
      '<input type="text" id="es-by" data-slotfield="by" data-slot="' + esc(s.slotId) + '" value="' +
      esc(loc.slot.by) + '"></div>' +
      '<div class="f"><label for="es-dish">What they\'re bringing</label>' +
      '<textarea id="es-dish" data-slotfield="dish" data-slot="' + esc(s.slotId) + '">' +
      esc(loc.slot.dish) + "</textarea></div>" +
      '<div class="f"><label for="es-at">What time it\'s arriving</label>' +
      '<input type="text" id="es-at" data-slotfield="at" data-slot="' + esc(s.slotId) + '" value="' +
      esc(loc.slot.at) + '"></div>';
    return sheetShell(esc(loc.slot.by), esc(dayName(loc.day.iso) + ", " + dateLabel(loc.day.iso)), body,
      '<button class="btn block" data-act="close-sheet">Done</button>');
  };

  /* --- organizer: edit the recipient details -------------------------------- */

  SHEETS.recipient = function () {
    var t = state.data.train;
    var body = '<p class="golde-say">The more of this I know, the fewer questions land on that family. ' +
      'Fill in what you\'ve got.</p>' +
      '<div class="f-row">' +
        '<div class="f"><label for="r-house">Adults</label>' +
          '<input type="text" id="r-house" data-field="adults" value="' + esc(t.adults) + '"></div>' +
        '<div class="f"><label for="r-teens">Teens</label>' +
          '<input type="text" id="r-teens" data-field="teens" value="' + esc(t.teens || 0) + '"></div>' +
        '<div class="f"><label for="r-littles">Littles</label>' +
          '<input type="text" id="r-littles" data-field="littles" value="' + esc(t.littles || 0) + '"></div>' +
      "</div>" +
      '<div class="f"><label for="r-headnote">Anything else about who is eating</label>' +
        '<input type="text" id="r-headnote" data-field="headNote" value="' +
        esc(t.headNote || "") + '"></div>' +
      '<div class="f"><label for="r-housenote">Anything about the household</label>' +
        '<input type="text" id="r-housenote" data-field="householdNote" value="' + esc(t.householdNote) + '"></div>' +
      '<div class="f"><label for="r-kosher">Kosher level</label>' +
        '<input type="text" id="r-kosher" data-field="kosherLevel" value="' + esc(t.kosherLevel) + '"></div>' +
      '<div class="f"><label for="r-hech">Hechshers and anything else</label>' +
        '<input type="text" id="r-hech" data-field="hechshers" value="' + esc(t.hechshers) + '"></div>' +
      '<div class="f"><span class="f-legend">Allergies</span>' +
        '<div class="hint">These are the ones I\'ll actually stop somebody over.</div>' +
        '<div class="chips">' +
          '<button class="chip small" data-act="clear-allergies" aria-pressed="' +
            (!t.allergies.length && !(t.otherAllergies || "").trim()) + '">None</button>' +
          Object.keys(ALLERGY_TAGS).map(function (k) {
            var on = t.allergies.indexOf(k) > -1;
            return '<button class="chip small" data-act="toggle-allergy" data-tag="' + k +
              '" aria-pressed="' + on + '">' + esc(ALLERGY_TAGS[k].label) + "</button>";
          }).join("") + "</div>" +
        '<div class="hint" style="margin-top:9px">Anything else — dairy, soy, strawberries. ' +
        'I check these against dishes exactly like the buttons above.</div>' +
        '<input type="text" data-field="otherAllergies" placeholder="dairy, strawberries" ' +
        'value="' + esc(t.otherAllergies || "") + '"></div>' +
      '<div class="f"><label for="r-dislikes">Things to skip</label>' +
        '<input type="text" id="r-dislikes" data-field="dislikes" value="' + esc(t.dislikes.join(", ")) + '"></div>' +
      '<div class="f"><label for="r-loves">Things they love</label>' +
        '<div class="hint">One per line.</div>' +
        '<textarea id="r-loves" data-field="loves">' + esc(t.loves.join("\n")) + "</textarea></div>" +
      '<div class="f"><label for="r-address">Address</label>' +
        '<input type="text" id="r-address" data-field="address" value="' + esc(t.address) + '"></div>' +
      '<div class="f"><label for="r-drop">Drop-off instructions</label>' +
        '<textarea id="r-drop" data-field="dropoff">' + esc(t.dropoff) + "</textarea></div>";
    return sheetShell("About the family", "", body,
      '<button class="btn block" data-act="close-sheet">Save it</button>');
  };

  /* --- getting back here ----------------------------------------------------
     The link arrives in a group chat and is buried by lunchtime. Somebody who
     took Thursday needs to find it again on Wednesday night, and "scroll up in
     WhatsApp" is not an answer. Every route out of here works offline: a text
     to yourself, an email, the clipboard, or the home screen. */

  function boardLink() {
    if (window.goldeSync && window.goldeSync.enabled) return location.href;
    return "https://golde.meals/" + (state.data.train.slug || "the-cohens");
  }

  SHEETS.keeplink = function () {
    var t = state.data.train;
    var mine = myClaims()[0];
    var body = '<p class="golde-say">This link is the whole thing. Put it somewhere ' +
      "you'll find it on a Wednesday night.</p>";

    body += '<div class="linkbox">' + esc(boardLink()) + "</div>";

    if (mine) {
      body += '<div class="golde-note tight"><span class="gn-mark">golde.</span><span>' +
        esc("You've got " + dayName(mine.day.iso) + ", so it'll be in your reminder as well. " +
            "This is belt and braces.") + "</span></div>";
    }

    body += '<p class="lede" style="margin-top:14px">Or add it to your home screen — Share, ' +
      "then \u201cAdd to Home Screen\u201d. It sits there like an app, and there's nothing " +
      "to install.</p>";

    var foot =
      '<button class="btn block" data-act="copy-link">Copy it</button>' +
      '<button class="btn block ghost" data-act="text-link">Text it to myself</button>' +
      '<button class="btn block ghost" data-act="email-link">Email it to myself</button>' +
      '<button class="btn block quiet" data-act="close-sheet">Done</button>';

    return sheetShell("Keep this link", esc(t.title), body, foot);
  };

  /* --- recipes -------------------------------------------------------------- */

  /* "Chicken soup with lokshen, and a roast chicken…" → "chicken soup recipe" */
  function shortDish(dish) {
    var d = String(dish).split(/,| with | and /)[0].trim().toLowerCase();
    if (d.length > 32) d = d.slice(0, 32).replace(/\s+\S*$/, "");
    return d + " recipe";
  }

  SHEETS.recipe = function (s) {
    var loc = locateSlot(s.slotId);
    if (!loc) return "";
    var body = '<p class="golde-say">However you\'d tell it to a friend on the phone. ' +
      'Nobody needs grams.</p>' +
      '<div class="f"><label for="recipe-text">' + esc(cap(shortDish(loc.slot.dish))) + "</label>" +
      '<textarea id="recipe-text" rows="8" placeholder="A whole chicken, cold water to cover, ' +
        'bring it up slow and skim the top…">' + esc(state.form.recipe || "") + "</textarea></div>" +

      '<div class="f"><span class="f-legend">Who may have it?</span>' +
        '<div class="hint">Sarah either way. The second one means it could turn up in the ' +
        'neighbourhood book one day, with your name on it.</div>' +
        '<div class="chips">' +
          '<button class="chip small" data-act="set-recipe-scope" data-scope="private" ' +
            'aria-pressed="' + (state.form.recipeScope !== "book") + '">Just Sarah</button>' +
          '<button class="chip small" data-act="set-recipe-scope" data-scope="book" ' +
            'aria-pressed="' + (state.form.recipeScope === "book") + '">Sarah, and the book</button>' +
        "</div></div>";
    return sheetShell("For Sarah", esc(dayName(loc.day.iso) + "'s dinner"), body,
      '<button class="btn block" data-act="save-recipe">Send it to her</button>' +
      '<button class="btn block quiet" data-act="close-sheet">Not just now</button>');
  };

  SHEETS["recipe-view"] = function (s) {
    var loc = locateSlot(s.slotId);
    if (!loc || !loc.slot.recipe) return "";
    var body = '<div class="recipe-card">' + esc(loc.slot.recipe) + "</div>" +
      '<p class="golde-say" style="font-size:16px;color:var(--muted);margin-top:14px">' +
      esc("From " + loc.slot.by + ", who made it for you on " + dayName(loc.day.iso) + ".") + "</p>";
    return sheetShell(esc(cap(shortDish(loc.slot.dish))), "", body,
      '<button class="btn block" data-act="close-sheet">Keep it</button>');
  };

  /* Switching occasion in the demo swaps the household too, otherwise you get a
     shiva for a family who just had a baby and the point is lost. */
  var OCCASION_SETUPS = {
    "new-baby": { family: "the Cohens", contact: "Sarah & Dovid Cohen", household: 5,
      householdNote: "two little ones, and a brand new baby girl",
      opening: [
        "Mazal tov — Sarah and Dovid Cohen had a baby girl on Motzei Shabbos. 💕 Mother and baby " +
          "are home and everybody is tired in the very best way.",
        "Nobody in that house should be thinking about dinner this week. A pot of something warm " +
          "is plenty."
      ] },
    "shiva": { family: "the Levys", contact: "Malka Levy", household: 9,
      householdNote: "and there's a minyan most evenings, so cook generously",
      opening: [
        "Malka Levy's mother passed away on Sunday. The family are sitting shiva until Thursday.",
        "There's a minyan most evenings, so the house is full from six. I've put a week of dinners " +
          "together. Nothing fancy — there's no room for fancy this week, and nobody wants it."
      ] },
    "recovery": { family: "the Steins", contact: "Yehuda Stein", household: 4,
      householdNote: "and he can't stand at a stove for another fortnight",
      opening: [
        "Yehuda Stein had his surgery on Tuesday and he's home, thank God. He's mending, he just " +
          "can't stand at a stove for another fortnight.",
        "So: dinners. Plain and warm is exactly right — nobody there is after a production."
      ] },
    "moving-in": { family: "the Roths", contact: "Ayala Roth", household: 6,
      householdNote: "and the kitchen is still in boxes",
      opening: [
        "The Roths moved in on Sunday and their kitchen is still in boxes.",
        "A few dinners while they dig themselves out, and they'll know they landed somewhere good."
      ] },
    "new-to-community": { family: "the Adlers", contact: "Nomi Adler", household: 3,
      householdNote: "and they don't know a soul here yet",
      opening: [
        "The Adlers have just moved here and they don't know a soul yet.",
        "Bring them dinner and stay five minutes at the door. The dinner is the excuse — the five " +
          "minutes is the point."
      ] },
    "just-because": { family: "the Bergers", contact: "Faigy Berger", household: 5,
      householdNote: "and it's been a long month, that's all",
      opening: [
        "Nothing has happened to the Bergers. It's been a long month, that's all, and Faigy sounded " +
          "tired on the phone.",
        "You don't need a reason to feed somebody. A few dinners, quietly."
      ] }
  };

  /* --- demo controls -------------------------------------------------------- */

  SHEETS.demo = function () {
    var body = '<div class="demo-disclaimer">Demo control. This panel is not part of the real product — ' +
      'it exists so one person can walk through all three sides of a meal train without three phones. ' +
      'Nothing here is saved anywhere.</div>';

    body += '<div class="f"><span class="f-legend">Viewing as</span><div class="role-grid">' +
      Object.keys(ROLES).map(function (k) {
        return '<button class="role-card" data-act="set-role" data-role="' + k + '" aria-pressed="' +
          (state.role === k) + '"><b>' + esc(ROLES[k].label) + "</b><span>" + esc(ROLES[k].blurb) +
          "</span></button>";
      }).join("") + "</div></div>";

    body += '<div class="f"><span class="f-legend">The occasion</span>' +
      '<div class="hint">She does not sound the same at a shiva as she does at a birth. ' +
      'Switch it and read the board again.</div>' +
      '<div class="chips">' + Object.keys(OCCASIONS).map(function (k) {
        return '<button class="chip small" data-act="set-occasion" data-occasion="' + k +
          '" aria-pressed="' + (state.data.train.occasion === k) + '">' +
          esc(cap(OCCASIONS[k].text)) + "</button>";
      }).join("") + "</div></div>";

    body += '<div class="f"><span class="f-legend">Jump ahead</span>' +
      '<div class="hint">The real golde. sends these on her own schedule. Here you can skip the waiting.</div>' +
      '<button class="btn block ghost" style="margin-bottom:9px" data-act="fastforward">' +
        "Send tomorrow's reminder now</button>" +
      '<button class="btn block ghost" style="margin-bottom:9px" data-act="restart-setup">' +
        "Set up a new train from scratch</button>" +
      '<button class="btn block" data-act="reset">Reset everything, back to the start</button></div>';

    return sheetShell("Demo controls", "Not part of the product", body,
      '<button class="btn block" data-act="close-sheet">Back to it</button>');
  };

  /* ===========================================================================
     9. ACTIONS
     =========================================================================== */

  function openSheet(kind, extra) {
    state.sheet = Object.assign({ kind: kind }, extra || {});
    render();
  }
  function closeSheet() {
    state.sheet = null;
    if (state.pendingRemote) {
      state.data = state.pendingRemote;
      state.pendingRemote = null;
    }
    render();
  }

  function goto(surface) {
    state.surface = surface;
    render();
    if (surface === "chat") scrollChatToBottom();
  }

  /* The newest notice sits directly under the ask box, so "up to date" means
     the top of the page. Nothing to scroll to. */
  function scrollChatToBottom() {
    setTimeout(function () {
      var s = $("#chat-scroll");
      if (s) s.scrollTop = 0;
    }, 30);
  }

  /* --- claiming ------------------------------------------------------------- */

  function startClaim(dayId, slotId, mode) {
    if (!dayId) {
      openSheet("pickday", { mode: mode || "cook" });
      return;
    }
    state.form = { mode: mode || "cook", kind: "groceries", dish: "", note: "",
                   name: state.you.name || "", channel: "whatsapp", contact: "" };
    openSheet("claim", { dayId: dayId, slotId: slotId });
  }

  function submitClaim() {
    var s = state.sheet;
    var f = state.form;
    var day = findDay(s.dayId);
    var name = (f.name || "").trim();

    if (f.mode === "cook" && !(f.dish || "").trim()) {
      toast("Tell me what you're bringing — even roughly. “Something warm” counts.");
      var df = document.querySelector("#claim-dish");
      if (df) df.focus();
      return;
    }
    if (!name) {
      toast("Just your name, so they know who to thank.");
      var nf = document.querySelector("#claim-name");
      if (nf) nf.focus();
      return;
    }
    var chDef = channelDef(f.channel || "whatsapp");
    if (chDef.needs && !(f.contact || "").trim()) {
      toast(chDef.needs === "email"
        ? "An email address and I'll do the rest."
        : "A number, or I've no way to reach you.");
      var cf = document.querySelector("#claim-contact");
      if (cf) cf.focus();
      return;
    }

    if (f.mode === "cook") {
      var concerns = runChecks(s.dayId, f.dish);
      if (concerns.length && !s.forced) {
        openSheet("concerns", { dayId: s.dayId, slotId: s.slotId, concerns: concerns });
        return;
      }
    }
    void day;
    commitClaim();
  }

  function commitClaim() {
    var s = state.sheet;
    var f = state.form;
    var day = findDay(s.dayId);
    var slot = findSlot(s.dayId, s.slotId);
    if (!day || !slot) { closeSheet(); return; }

    var name = (f.name || "").trim();
    state.you.name = name;

    var dish, kind;
    if (f.mode === "cook") {
      dish = f.dish.trim();
      kind = "meal";
    } else {
      kind = f.kind || "groceries";
      var base = {
        groceries: "A grocery drop",
        giftcard: "A gift card, so they can order whatever the day calls for",
        orderin: "Dinner ordered in and sent to the door"
      }[kind];
      dish = base + ((f.note || "").trim() ? " — " + f.note.trim() : "");
    }

    var others = day.slots.filter(function (x) { return x.filled; }).length;
    var channel = f.channel || "whatsapp";
    slot.filled = true;
    slot.kind = kind;
    slot.by = name;
    slot.dish = dish;
    slot.mine = true;
    slot.delivered = false;
    slot.at = others > 0 ? staggerTime(day) : day.from;
    slot.channel = channel;

    /* The signup pushes a record into the platform. This is where a stranger
       becomes someone Golde is allowed to write to, and by which route. */
    upsertContact(name, channel, (f.contact || "").trim());
    if (kind === "meal") rememberDish(dish);
    if (channel === "calendar") calendarFile(day, slot);

    state.sheet = null;
    state.form = {};

    /* Golde's confirmation, in the thread. */
    say("you", "I'll take " + dayName(day.iso) + " — " + lowerFirst(dish));

    var lines = [];
    lines.push(byTone({
      bright: dayName(day.iso) + "'s yours. Thank you.",
      tender: dayName(day.iso) + "'s yours. Thank you.",
      quiet:  dayName(day.iso) + "'s yours. Thank you."
    }));
    if (isQuiet()) {
      lines.push("You don't have to say anything at the door. Being there is the thing.");
    }

    var when = day.candle
      ? "It's the Shabbos one — at the door by " + day.to + ", before candles at " + day.candle + "."
      : "Anywhere between " + day.from + " and " + day.to + ".";

    if (channel === "none") {
      lines.push("No reminder, as you asked. " + when);
    } else if (channel === "calendar") {
      lines.push("It's in your calendar now, with an alert the day before. " + when);
    } else {
      lines.push("I'll remind you the day before " + channelDef(channel).short +
        ", so you don't have to keep it in your head. " + when);
    }
    if (kind !== "meal") {
      lines.push("Not everybody cooks, and honestly some weeks this is the more useful thing.");
    }

    var stillOpen = openDays();
    if (stillOpen.length) {
      lines.push("That leaves " + listify(stillOpen.map(function (x) { return dayName(x.iso); })) +
        ". I'll keep working on it. Go enjoy your evening.");
    } else {
      lines.push("And that's the whole week covered. Every single night. I'm not going to make a fuss, " +
        "but I'm a little bit making a fuss.");
    }

    goldeSays(lines, {
      actions: [
        { label: "See the board", act: "open-board" },
        { label: "Keep this link", act: "keep-link" }
      ]
    });

    persist();
    goto("chat");
    toast(dayName(day.iso) + " is yours. A reminder is on its way the day before.");
  }

  function staggerTime(day) {
    var taken = day.slots.filter(function (s) { return s.filled && s.at; }).map(function (s) { return s.at; });
    var options = ["4:30", "5:00", "5:30", "6:00"];
    if (day.candle) options = ["2:30", "3:00", "3:30", "4:00"];
    for (var i = 0; i < options.length; i++) {
      if (taken.indexOf(options[i]) === -1) return options[i];
    }
    return day.from;
  }

  /* --- cancel / swap / delivered -------------------------------------------- */

  function confirmCancel(slotId) {
    var loc = locateSlot(slotId);
    if (!loc) { closeSheet(); return; }
    var dayLabel = dayName(loc.day.iso);
    loc.slot.filled = false;
    delete loc.slot.kind; delete loc.slot.by; delete loc.slot.dish;
    delete loc.slot.mine; delete loc.slot.delivered; delete loc.slot.at;

    state.sheet = null;
    goldeSays([
      "Consider it handled. " + dayLabel + " is open again and nobody needs a reason.",
      "Everybody, " + dayLabel + " came free. If it fits your week, it's there. If it doesn't, that's alright too."
    ]);
    persist();
    goto("chat");
    toast("Done. " + dayLabel + " is open again — no explanation needed.");
  }

  function confirmSwap(slotId, dayId, targetSlotId) {
    var loc = locateSlot(slotId);
    var newDay = findDay(dayId);
    var target = findSlot(dayId, targetSlotId);
    if (!loc || !newDay || !target) { closeSheet(); return; }

    var oldLabel = dayName(loc.day.iso);
    var newLabel = dayName(newDay.iso);

    target.filled = true;
    target.kind = loc.slot.kind;
    target.by = loc.slot.by;
    target.dish = loc.slot.dish;
    target.mine = true;
    target.delivered = false;
    target.at = newDay.from;

    loc.slot.filled = false;
    delete loc.slot.kind; delete loc.slot.by; delete loc.slot.dish;
    delete loc.slot.mine; delete loc.slot.delivered; delete loc.slot.at;

    state.sheet = null;
    goldeSays([
      "Moved. You're on " + newLabel + " now, and " + oldLabel + " is open again — I'll find somebody, " +
        "that's my job, not yours.",
      "Your reminder moved with you. Nothing for you to remember."
    ]);
    persist();
    goto("chat");
    toast("You're on " + newLabel + " now.");
  }

  function markDelivered(slotId) {
    var loc = locateSlot(slotId);
    if (!loc) return;
    loc.slot.delivered = true;
    state.sheet = null;
    goldeSays([
      "That's one more night that family didn't have to think about. Thank you.",
      "Go sit down."
    ]);
    persist();
    goto("chat");
  }

  /* --- organizer actions ----------------------------------------------------- */

  function nudge() {
    var t = state.data.train;
    var open = openDays();
    if (!open.length) return;
    var names = listify(open.map(function (x) { return dayName(x.iso); }));
    var lines = byTone({
      bright: [
        "Hello again, everybody. Not nagging — noticing.",
        names + " " + plural(open.length, "is", "are") + " still open for " + t.recipientFamily +
          ". If one of them fits your week, wonderful. If not, no hard feelings and nobody's counting."
      ],
      tender: [
        "Quietly, everybody.",
        names + " " + plural(open.length, "is", "are") + " still open for " + t.recipientFamily +
          ". Only if it fits your week."
      ],
      quiet: [
        names + " " + plural(open.length, "is", "are") + " still open at " + t.recipientFamily + ".",
        "No explanation needed either way. Nobody is keeping a list."
      ]
    });
    var friday = open.filter(function (x) { return x.candle; })[0];
    if (friday) {
      lines.push("Friday's the Shabbos one — it has to be at the door by " + friday.to +
        ", before candles at " + friday.candle + ". Worth knowing before you volunteer.");
    }
    lines.push("And if cooking isn't your thing, groceries or a gift card help just as much. Truly.");
    goldeSays(lines, { card: "board" });
    goto("chat");
    toast("Sent, gently. Nobody was guilted.");
  }

  function wrapTrain() {
    var t = state.data.train;
    t.wrapped = true;
    var n = filledSlots().length;
    goldeSays(byTone({
      bright: [
        "That's a wrap, everybody.",
        n + " " + plural(n, "delivery", "deliveries") + " and one very grateful family. Sarah asked me " +
          "to tell you she cried a little at the chicken soup, which I think we all saw coming.",
        "You didn't just feed them. You made a hard, beautiful week softer. That's the whole thing."
      ],
      tender: [
        n + " " + plural(n, "delivery", "deliveries") + ", and they're back on their feet.",
        "They didn't have to think about dinner once while they were mending. That was you."
      ],
      quiet: [
        n + " " + plural(n, "delivery", "deliveries") + " over the week of the shiva.",
        "Nobody in that house cooked, and nobody in that house was alone at dinnertime. " +
          "They'll remember exactly who was at the door."
      ]
    }));

    /* No money is asked for at a shiva. Not softened, not once — not asked. */
    if (!isQuiet()) {
      goldeSays([
        "If this made it easier, you're welcome to chip in so it stays free for the next family. " +
          "Only if you want to. I mean that — I'd never ask twice."
      ], { card: "donation" });
    }
    state.sheet = null;
    persist();
    goto("chat");
  }

  /* --- family actions -------------------------------------------------------- */

  function organizerName() { return state.data.train.organizer || "Rivky Weiss"; }

  function pause() {
    state.data.train.paused = true;
    goldeSays([
      "Everybody, the Cohens have enough for now. Freezer's full, counters are full, and they're alright.",
      "So: take the week off. Don't cook, don't drop anything by, don't feel a thing about it. " +
        "This is good news — it means it worked.",
      "I'll wave you back in when they're ready. Nobody loses their place."
    ]);
    persist();
    goto("chat");
    toast("Done. Everybody has the week off, and nobody will ask why.");
  }

  function unpause() {
    state.data.train.paused = false;
    var open = openDays();
    goldeSays([
      "Good news — the Cohens are ready for a little more help.",
      open.length
        ? listify(open.map(function (x) { return dayName(x.iso); })) + " " +
          plural(open.length, "is", "are") + " open again whenever you're ready."
        : "Everything's still covered, so there's nothing to do but keep being lovely."
    ]);
    persist();
    goto("chat");
  }

  function defaultThanks() {
    return byTone({
      bright: "I don't have the words yet, so this will have to do. Thank you. All of you.\n\n" +
        "We opened the door every night this week and there was food and a note and somebody's " +
        "handwriting on the lid. I'll never forget it.",
      tender: "Thank you, all of you. We didn't think about dinner once, and that was the whole " +
        "difference.",
      quiet: "Thank you. There's nothing else I can manage to say yet, but thank you."
    });
  }

  function sayThanks() {
    state.form = { thanks: state.data.train.thanksDraft || defaultThanks() };
    openSheet("thanks", {});
  }

  SHEETS.thanks = function () {
    var body = '<p class="golde-say">I\'ve written something to start you off. Change every word ' +
      'of it if you like — it should sound like you, not like me.</p>' +
      '<div class="f"><textarea id="thanks-text" rows="8">' + esc(state.form.thanks || "") +
      "</textarea></div>";
    return sheetShell("In your own words", "", body,
      '<button class="btn block" data-act="send-thanks">Send it to everyone</button>' +
      '<button class="btn block quiet" data-act="close-sheet">Not yet</button>');
  };

  /* --- reminder (fast-forward) ------------------------------------------------ */

  function fastForward() {
    var t = state.data.train;
    var mine = myClaims().filter(function (x) { return !x.slot.delivered; })[0];
    var pick = mine || filledSlots().filter(function (x) { return !x.slot.delivered; })[0];
    if (!pick) {
      state.sheet = null;
      goldeSays(["Nothing to remind anybody about just yet. Grab a night and I'll have something to nag you with."]);
      goto("chat");
      return;
    }
    var day = pick.day, slot = pick.slot;
    var lines = [];
    lines.push("Tomorrow's your night for the Cohens" + (slot.mine ? "" : ", " + slot.by) + ".");
    if (slot.kind === "meal") {
      lines.push("You said: " + slot.dish + ".");
    } else {
      lines.push("You're sending: " + slot.dish + ".");
    }
    lines.push(
      (day.candle
        ? "At the door by " + day.to + " — candles are at " + day.candle + ", so please don't cut it fine."
        : "Anytime between " + day.from + " and " + day.to + ".") +
      " " + headcountShort(t) + ", " + t.householdNote + ". " +
      (t.allergies.indexOf("no-nuts") > -1 ? "No nuts. " : "") +
      t.address + "."
    );
    lines.push(byTone({
      bright: "You've got this.",
      tender: "You've got this.",
      quiet:  "Just the food. Nothing else is required of you."
    }));

    if (slot.channel && slot.channel !== "whatsapp") {
      lines.unshift("(" + cap(channelDef(slot.channel).short) + ", as you asked.)");
    }

    goldeSays(lines, {
      actions: slot.mine ? [
        { label: "DONE — it's delivered", act: "mark-delivered", arg: slot.id, solid: true },
        { label: "Something came up", act: "cancel", arg: slot.id }
      ] : [
        { label: "See the board", act: "open-board" }
      ]
    });
    state.remindedSlots[slot.id] = true;
    state.sheet = null;
    goto("chat");
  }

  /* --- composer -------------------------------------------------------------- */

  function sendMessage(text) {
    text = (text || "").trim();
    if (!text) return;
    say(state.role === "family" ? "Sarah Cohen" : "you", text);
    if (state.role === "family") {
      state.data.messages[state.data.messages.length - 1].dir = "out";
    }

    goldeSays(answerAbout(text));
    render();
    scrollChatToBottom();
  }

  /* She reads the board before she opens her mouth. A canned reply to a real
     question is worse than saying nothing — it makes her look like a machine
     pretending. Everything below is answered from live state. */

  function findDayByName(text) {
    var t = " " + text.toLowerCase() + " ";
    var days = state.data.days;
    for (var i = 0; i < days.length; i++) {
      var n = dayName(days[i].iso).toLowerCase();
      if (t.indexOf(n) > -1) return days[i];
      if (n === "shabbos" && (t.indexOf("saturday") > -1 || t.indexOf("shabbat") > -1 ||
          t.indexOf("shabbes") > -1)) return days[i];
    }
    return null;
  }

  function findPersonInText(text) {
    var t = text.toLowerCase();
    var hit = null;
    filledSlots().forEach(function (x) {
      if (!x.slot.by) return;
      var first = x.slot.by.split(" ")[0].toLowerCase();
      if (first.length > 2 && t.indexOf(first) > -1) hit = x;
    });
    return hit;
  }

  function describeDay(day) {
    if (!day.needed) {
      return "Nobody needs to bring anything on " + dayName(day.iso) + ". " +
        (day.offReason || "It's covered.");
    }
    var filled = day.slots.filter(function (s) { return s.filled; });
    var open = day.slots.filter(function (s) { return !s.filled; });
    var lines = [];

    if (filled.length) {
      lines.push(filled.map(function (s) {
        return s.by + " has it — " + lowerFirst(s.dish) + ", arriving " + s.at + ".";
      }).join(" "));
    }
    if (open.length) {
      lines.push(filled.length
        ? "There's still room for one more if you want it."
        : dayName(day.iso) + " is wide open. It's yours if you want it.");
    } else if (filled.length) {
      lines.push(dayName(day.iso) + " is covered.");
    }
    lines.push(day.candle
      ? "It's the Shabbos one — at the door by " + day.to + ", before candles at " + day.candle + "."
      : "Window's " + day.from + " to " + day.to + ".");
    return lines.join(" ");
  }

  function answerAbout(text) {
    var t = text.toLowerCase();
    var train = state.data.train;

    /* A question about a specific day beats every generic answer. */
    var day = findDayByName(text);
    if (day) return [describeDay(day)];

    /* A question about a specific person. */
    var person = findPersonInText(text);
    if (person) {
      return [person.slot.by + " has " + dayName(person.day.iso) + " — " +
        lowerFirst(person.slot.dish) + ", arriving " + person.slot.at + "."];
    }

    var open = openDays();

    if (/cancel|can'?t make|something came up|drop out|back out/.test(t)) {
      return ["Life happens, don't give it another thought. Tell me which night and I'll open it " +
        "back up and quietly let the others know."];
    }
    if (/thank|todah|toda raba/.test(t)) {
      return ["Don't thank me. Thank the " + train.peopleReached + " people who said yes. " +
        "I only did the pestering."];
    }
    if (/(what|which|any|anything|something)[^?]{0,20}(open|left|available|free|still need)|still open|nights? left/.test(t)) {
      return open.length
        ? [listify(open.map(function (x) { return dayName(x.iso); })) + " " +
           plural(open.length, "is", "are") + " still open." +
           (open.filter(function (x) { return x.candle; }).length
             ? " The Friday one has to be there before candles."
             : "")]
        : ["Not a single night left. Every one is spoken for."];
    }
    if (/who.*(bringing|cooking|sending|has|signed)|what.*everyone/.test(t)) {
      var taken = filledSlots();
      if (!taken.length) return ["Nobody yet. You could be the first."];
      var byDay = [];
      taken.forEach(function (x) {
        var row = byDay.filter(function (r) { return r.id === x.day.id; })[0];
        if (!row) { row = { id: x.day.id, day: x.day, names: [] }; byDay.push(row); }
        row.names.push(x.slot.by);
      });
      return ["Here's the week so far: " + byDay.map(function (r) {
        return dayName(r.day.iso) + " is " + listify(r.names);
      }).join(", ") + "."];
    }
    if (/what.*bring|what should i|ideas|suggest|recommend/.test(t)) {
      return ["They love " + listify(train.loves) + ". No nuts, and skip the " +
        listify(train.dislikes) + ". Beyond that, whatever's easy for you — easy for you is the point."];
    }
    if (/allerg|nut/.test(t)) {
      return [train.allergyNote + " " +
        "Type your dish into the board and I'll check it before you cook a thing."];
    }
    if (/kosher|dairy|meat|pareve|hechsher|chalav/.test(t)) {
      return [train.kosherLevel + ". " + train.hechshers];
    }
    if (/how many|headcount|family of|portions|how much/.test(t)) {
      return ["Cooking for " + headcount(train) + " — " + train.householdNote + ". " +
        "Leftovers are a blessing."];
    }
    if (/where|address|drop|door|deliver to/.test(t)) {
      return canSeeAddress()
        ? [train.address + ". " + train.dropoff]
        : ["Take a night first and the address is yours straight away. " +
           "I don't hand out where a new mother lives to anyone who happens to have the link."];
    }
    if (/when|what time|deadline|candle|shabb/.test(t)) {
      var fri = state.data.days.filter(function (x) { return x.candle; })[0];
      return ["Most nights, 4:30 to 6:00." +
        (fri ? " Friday's different — at the door by " + fri.to + ", before candles at " + fri.candle + "."
             : "") + " I'll remind you either way."];
    }
    if (/^(hi|hello|hey|good morning|good evening|shalom)\b/.test(t)) {
      return ["Hello. " + (open.length
        ? listify(open.map(function (x) { return dayName(x.iso); })) + " " +
          plural(open.length, "is", "are") + " still open, if you're asking."
        : "Everything's covered this week, so this is purely social.")];
    }
    if (/help|how do|how does|what do i/.test(t)) {
      return ["Open the board, pick a night, tell me what you're bringing. That's the whole thing."];
    }

    return ["I'm not sure I follow — I'm better with the practical questions. " +
      "Ask me who has which night, what's still open, what they eat, or when to be there."];
  }

  /* --- misc ------------------------------------------------------------------ */

  function toggleNeeded(dayId) {
    var day = findDay(dayId);
    if (!day) return;
    day.needed = !day.needed;
    if (day.needed) {
      if (!day.slots.length) day.slots.push({ id: "n" + (++state.slotSeq), filled: false });
      delete day.offReason;
      toast(dayName(day.iso) + " is back on the board.");
    } else {
      day.slots = day.slots.filter(function (s) { return s.filled; });
      day.offReason = "No meal needed this day. Somebody's already got it covered, and that's allowed.";
      toast("No meal on " + dayName(day.iso) + ". I'll tell the group so nobody cooks for nothing.");
    }
    persist();
    render();
  }

  function addSlot(dayId) {
    var day = findDay(dayId);
    if (!day) return;
    day.slots.push({ id: "n" + (++state.slotSeq), filled: false });
    day.needed = true;
    persist();
    render();
    toast("Room for one more on " + dayName(day.iso) + ".");
  }

  function removeSlot(dayId, slotId) {
    var day = findDay(dayId);
    if (!day) return;
    day.slots = day.slots.filter(function (s) { return s.id !== slotId; });
    persist();
    render();
  }

  function reopen(slotId) {
    var loc = locateSlot(slotId);
    if (!loc) return;
    var who = loc.slot.by;
    loc.slot.filled = false;
    delete loc.slot.kind; delete loc.slot.by; delete loc.slot.dish;
    delete loc.slot.mine; delete loc.slot.delivered; delete loc.slot.at;
    persist();
    render();
    toast(dayName(loc.day.iso) + " is open again. I'll let " + who + " know myself — kindly.");
  }

  function regenDays() {
    var t = state.data.train;
    var start = d(t.start), end = d(t.end);
    if (isNaN(start) || isNaN(end) || end < start) return;
    var keep = {};
    state.data.days.forEach(function (day) { keep[day.iso] = day; });
    var out = [], cur = new Date(start), guard = 0;
    while (cur <= end && guard++ < 60) {
      var iso = cur.getFullYear() + "-" + pad(cur.getMonth() + 1) + "-" + pad(cur.getDate());
      if (keep[iso]) out.push(keep[iso]);
      else out.push({
        id: "g" + (++state.slotSeq), iso: iso, needed: true,
        kosher: "any", from: isFriday(iso) ? "2:30" : "4:30", to: isFriday(iso) ? "4:30" : "6:00",
        candle: isFriday(iso) ? "7:52" : null,
        slots: [{ id: "n" + (++state.slotSeq), filled: false }]
      });
      cur.setDate(cur.getDate() + 1);
    }
    state.data.days = out;
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  /* ===========================================================================
     10. EVENT WIRING
     =========================================================================== */

  var ACTIONS = {
    "open-board": function () { goto("board"); },

    "setup-chip": function (el) {
      var step = setupStep();
      var c = step.chips[parseInt(el.getAttribute("data-i"), 10)];
      if (!c) return;
      var key = ["occasion", "length", "cadence", "adults", "teens", "littles", "allergies"]
        .indexOf(step.id) > -1 ? step.id : null;
      setupAdvance(c.label, key, c.value);
    },

    "setup-skip": function () {
      setupAdvance(setupStep().skip.label, setupStep().id, "");
    },

    "finish-setup": function () { finishSetup(); },
    "skip-setup": function () {
      /* Straight to the board, which is where a real link lands you. Routing the
         demo through the feed first added a hop nobody has in the product and
         made the whole thing look like it has more layers than it does. */
      state.role = "neighbor";
      goto("board");
      toast("This is what tapping the link in your group chat gets you.");
    },
    "restart-setup": function () {
      state.setup = { i: 0, answers: {},
        log: [{ me: false, text: ["Hello. What can I do for you?"] }] };
      state.surface = "setup";
      state.sheet = null;
      render();
    },
    "open-chat": function () { goto("chat"); },
    "close-sheet": function () { closeSheet(); },

    "set-role": function (el) {
      state.role = el.getAttribute("data-role");
      state.sheet = null;
      render();
      /* The board is a different page for each role — start them at the top of it. */
      var bs = $("#board-scroll");
      if (bs) bs.scrollTop = 0;
      toast("Now viewing as " + ROLES[state.role].label + ". Same train, different pair of eyes.");
    },

    "claim": function (el) {
      startClaim(el.getAttribute("data-day"), el.getAttribute("data-slot"),
        el.getAttribute("data-mode") || "cook");
    },
    "claim-nocook": function (el) {
      var dayId = el.getAttribute("data-day");
      if (!dayId) { openSheet("pickday", { mode: "nocook" }); return; }
      startClaim(dayId, el.getAttribute("data-slot"), "nocook");
    },
    "set-mode": function (el) { state.form.mode = el.getAttribute("data-mode"); render(); },
    "set-kind": function (el) { state.form.kind = el.getAttribute("data-kind"); render(); },
    "use-goto": function (el) {
      var i = parseInt(el.getAttribute("data-i"), 10);
      var dish = (state.data.cook.goTo || [])[i];
      if (dish == null) return;
      state.form.dish = dish;
      state.form.mode = "cook";
      render();
    },
    "set-channel": function (el) {
      state.form.channel = el.getAttribute("data-channel");
      state.form.contact = "";
      render();
    },
    "submit-claim": function () { submitClaim(); },
    "close-concerns": function () {
      openSheet("claim", { dayId: state.sheet.dayId, slotId: state.sheet.slotId });
    },
    "force-claim": function () {
      state.sheet.forced = true;
      commitClaim();
    },

    "swap": function (el) { openSheet("swap", { slotId: el.getAttribute("data-slot") }); },
    "confirm-swap": function (el) {
      confirmSwap(el.getAttribute("data-slot"), el.getAttribute("data-day"), el.getAttribute("data-target"));
    },
    "cancel": function (el) {
      openSheet("cancel", { slotId: el.getAttribute("data-slot") || el.getAttribute("data-arg") });
    },
    "confirm-cancel": function (el) { confirmCancel(el.getAttribute("data-slot")); },
    "mark-delivered": function (el) {
      markDelivered(el.getAttribute("data-slot") || el.getAttribute("data-arg"));
    },

    "add-slot": function (el) { addSlot(el.getAttribute("data-day")); },
    "remove-slot": function (el) { removeSlot(el.getAttribute("data-day"), el.getAttribute("data-slot")); },
    "toggle-needed": function (el) { toggleNeeded(el.getAttribute("data-day")); },
    "edit-day": function (el) { openSheet("editday", { dayId: el.getAttribute("data-day") }); },
    "edit-slot": function (el) { openSheet("editslot", { slotId: el.getAttribute("data-slot") }); },
    "edit-recipient": function () { openSheet("recipient", {}); },
    "reopen": function (el) { reopen(el.getAttribute("data-slot")); },
    "set-filter": function (el) {
      state.filter = el.getAttribute("data-filter");
      render();
      var bs = $("#board-scroll"); if (bs) bs.scrollTop = 0;
    },
    "toggle-details": function () { state.details = !state.details; render(); },
    "toggle-train": function () { state.trainOpen = !state.trainOpen; render(); },
    "toggle-contacts": function () { state.contactsOpen = !state.contactsOpen; render(); },
    "toggle-delivery": function () { state.deliveryOpen = !state.deliveryOpen; render(); },
    "set-kosher": function (el) {
      var day = findDay(el.getAttribute("data-day"));
      if (day) day.kosher = el.getAttribute("data-k");
      changed();
    },
    "share": function () { shareToWhatsApp(); },
    "message-planner": function () {
      var t = state.data.train;
      window.open("https://wa.me/" + t.plannerPhone + "?text=" +
        encodeURIComponent("Hello " + t.planner.split(" ")[0] + " — about the meals for " +
          t.recipientFamily + "…"), "_blank", "noopener,noreferrer");
      toast("Opening WhatsApp. It's a 555 number in the demo — it goes nowhere.");
    },

    "keep-link": function () { openSheet("keeplink", {}); },

    "copy-link": function () {
      var link = boardLink();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(
          function () { toast("Copied. Paste it wherever you'll look for it."); },
          function () { toast("This browser wouldn't let me copy. Select it and copy by hand."); });
      } else {
        toast("Select the link above and copy it by hand — this browser won't let me.");
      }
    },

    "text-link": function () {
      var t = state.data.train;
      window.location.href = "sms:?&body=" +
        encodeURIComponent(t.title + " — " + boardLink());
      toast("Opening your messages with it written out. Send it to yourself.");
    },

    "email-link": function () {
      var t = state.data.train;
      window.location.href = "mailto:?subject=" + encodeURIComponent(t.title) +
        "&body=" + encodeURIComponent(t.title + "\n\n" + boardLink() +
          "\n\nEverything's on there — who has which night, and what they're bringing.");
      toast("Opening your email. Send it to yourself and it's findable forever.");
    },

    "feedback": function () {
      var t = state.data.train;
      var body = "What were you trying to do?\n\n\n" +
        "What happened instead?\n\n\n" +
        "Anything Golde said that felt wrong?\n\n\n" +
        "---\n" + t.title + " · " + shortDate(t.start) + "-" + shortDate(t.end) +
        " · viewing as " + ROLES[state.role].label;
      window.location.href = "mailto:hello@golde.meals" +
        "?subject=" + encodeURIComponent("golde. - " + t.title) +
        "&body=" + encodeURIComponent(body);
      toast("Opening your email. Say anything — blunt is useful.");
    },
    /* Asking for a recipe is the one thing the family gets to give back. It has
       to land as a compliment, never as another errand for the cook. */
    "ask-recipe": function (el) {
      var loc = locateSlot(el.getAttribute("data-slot"));
      if (!loc) return;
      loc.slot.recipeAsked = true;
      var first = loc.slot.by.split(" ")[0];
      goldeSays([
        first + ", Sarah asked for your " + shortDish(loc.slot.dish) + ".",
        "She said they haven't stopped talking about it. Only if you feel like writing it out — " +
          "and if it's your mother's and you'd rather keep it, that's an answer too."
      ]);
      goto("chat");
      toast("Passed along. No pressure on them at all.");
    },

    "set-recipe-scope": function (el) {
      state.form.recipeScope = el.getAttribute("data-scope");
      render();
    },

    "write-recipe": function (el) {
      state.form = { recipe: "", recipeScope: "private" };
      openSheet("recipe", { slotId: el.getAttribute("data-slot") });
    },

    "save-recipe": function () {
      var loc = locateSlot(state.sheet.slotId);
      var text = (state.form.recipe || "").trim();
      if (!loc) { closeSheet(); return; }
      if (!text) {
        toast("Write it however you'd tell it to a friend on the phone.");
        return;
      }
      loc.slot.recipe = text;
      loc.slot.recipeScope = state.form.recipeScope === "book" ? "book" : "private";
      loc.slot.recipeDeclined = false;
      state.sheet = null;
      goldeSays([
        "I've given Sarah the recipe. She'll have it forever now, and every time she makes it " +
          "she'll think of you. That's not nothing.",
        loc.slot.recipeScope === "book"
          ? "And I've kept a copy for the neighbourhood book, with your name on it. Nothing goes " +
            "in without your say-so — that was your say-so."
          : "Just for her, as you said. It goes nowhere else."
      ]);
      persist();
      goto("chat");
    },

    "decline-recipe": function (el) {
      var loc = locateSlot(el.getAttribute("data-slot"));
      if (!loc) return;
      loc.slot.recipeDeclined = true;
      state.sheet = null;
      goldeSays([
        "Of course. Some recipes stay in the family and that's exactly as it should be.",
        "I told Sarah it's a family one. She understood immediately — she's got two of those herself."
      ]);
      goto("chat");
      toast("Handled. Nobody was made to feel awkward.");
    },

    "see-recipe": function (el) {
      openSheet("recipe-view", { slotId: el.getAttribute("data-slot") });
    },

    "nudge": function () { nudge(); },

    "ask-directly": function (el) {
      var c = findContact(el.getAttribute("data-contact"));
      if (!c) return;
      var open = openDays();
      state.sheet = null;
      goldeSays([
        "I wrote to " + c.name.split(" ")[0] + " myself, just her — no group, nobody watching.",
        "I said: “" + (open.length
          ? listify(open.map(function (x) { return dayName(x.iso); })) + " " +
            plural(open.length, "is", "are") + " still open for the Cohens. Only if it fits your week."
          : "Everything's covered — I just wanted to say thank you.") + "”"
      ]);
      goto("chat");
      toast("Sent to " + c.name + " privately.");
    },

    "toggle-optin": function (el) {
      var c = findContact(el.getAttribute("data-contact"));
      if (!c) return;
      c.optedIn = !c.optedIn;
      changed();
      toast(c.optedIn
        ? "Lovely. I'll keep " + c.name.split(" ")[0] + " in the loop."
        : "Not another word to " + c.name.split(" ")[0] + " from me.");
    },

    "remove-contact": function (el) {
      var id = el.getAttribute("data-contact");
      var c = findContact(id);
      state.data.contacts = state.data.contacts.filter(function (x) { return x.id !== id; });
      changed();
      if (c) toast(c.name + " is off my list. No hard feelings.");
    },

    "nudge-unsigned": function () {
      var contacts = state.data.contacts || [];
      var unsigned = contacts.filter(function (c) { return c.optedIn && !contactStatus(c.name); });
      var open = openDays();
      if (!unsigned.length || !open.length) return;
      goldeSays([
        "I wrote to " + listify(unsigned.map(function (c) { return c.name.split(" ")[0]; })) +
          " — separately, one at a time, not a group blast.",
        "Nothing heavy. Just that " + listify(open.map(function (x) { return dayName(x.iso); })) + " " +
          plural(open.length, "is", "are") + " open, and only if it fits their week."
      ]);
      goto("chat");
      toast("Written to " + unsigned.length + ", one at a time.");
    },
    "wrap": function () { wrapTrain(); },

    "clear-allergies": function () {
      state.data.train.allergies = [];
      state.data.train.otherAllergies = "";
      changed();
    },

    "toggle-allergy": function (el) {
      var tag = el.getAttribute("data-tag");
      var list = state.data.train.allergies;
      var i = list.indexOf(tag);
      if (i > -1) list.splice(i, 1); else list.push(tag);
      changed();
    },
    "toggle-bell": function () {
      var t = state.data.train;
      t.ringBell = !t.ringBell;
      t.dropoff = t.ringBell
        ? "Ring the bell once. If nobody comes, leave it on the bench — it's shaded."
        : "Please just leave it at the door and go. No knock, no bell. Somebody is probably asleep.";
      changed();
    },
    "toggle-surprise": function () {
      state.data.train.showDishes = !state.data.train.showDishes;
      changed();
      toast(state.data.train.showDishes
        ? "You'll see everything that's coming."
        : "My lips are sealed. You'll find out at the door.");
    },
    "pause": function () { pause(); },
    "unpause": function () { unpause(); },
    "say-thanks": function () { sayThanks(); },

    "send-thanks": function () {
      var t = state.data.train;
      var text = (state.form.thanks || "").trim();
      if (!text) { toast("Say anything at all, or nothing. Both are allowed."); return; }
      t.thanksSent = true;
      t.thanksDraft = text;
      state.sheet = null;
      say(t.recipientContact.split(" &")[0], text.split(/\n\n+/));
      goldeSays(byTone({
        bright: ["There it is. Now everybody go have a good cry and then eat something yourselves."],
        tender: ["There it is. Go on, all of you — you've earned a quiet evening."],
        quiet:  ["There it is."]
      }));
      persist();
      goto("chat");
    },

    "message-organizer-pause": function () {
      var t = state.data.train;
      var msg = "It's " + t.recipientContact.split(" &")[0] + " — we've got more than enough food " +
        "just now. Could we quietly slow things down for a few days? I don't want anyone put out.";
      window.open("https://wa.me/15550142288?text=" + encodeURIComponent(msg), "_blank",
        "noopener,noreferrer");
      toast("Opening WhatsApp with it written for you. Change any of it.");
    },

    "donate": function () {
      state.sheet = null;
      goldeSays(["That's very kind of you, and it means the next family doesn't pay a thing. " +
        "I won't ask again, and I won't make a speech about it."]);
      goto("chat");
      toast("Thank you. (Nothing was actually charged — this is a prototype.)");
    },

    "set-occasion": function (el) {
      var key = el.getAttribute("data-occasion");
      var t = state.data.train;
      t.occasion = key;
      var setup = OCCASION_SETUPS[key];
      if (setup) {
        t.recipientFamily = setup.family;
        t.recipientContact = setup.contact;
        t.title = "Meals for " + setup.family;
        t.household = setup.household;
        t.householdNote = setup.householdNote;
        delete t.thanksDraft;   /* a birth's thank-you is not a shiva's */
        /* A shiva announced under "Mazal tov, a baby girl" is worse than no demo
           at all — the record has to be rebuilt with the occasion. */
        state.data.messages = [
          { id: "o1", from: "golde", dir: "in", time: "10:02", text: setup.opening },
          { id: "o2", from: "golde", dir: "in", time: "10:03", card: "board",
            text: [byTone({
              bright: "Here's the week. Take a look and see what fits.",
              tender: "Here's the week. Take whatever fits — no need to tell me why if it doesn't.",
              quiet:  "Here's the week."
            })] }
        ];
      }
      state.sheet = null;
      render();
      toast("Now a " + occasionText(key) + ". Listen to how she changes.");
    },

    "fastforward": function () { fastForward(); },
    "reset": function () {
      if (sync.enabled) {
        toast("Not on a real week. That would undo other people's evenings.");
        return;
      }
      state.data = seed();
      state.role = "neighbor";
      state.surface = "setup";
      state.setup = { i: 0, answers: {},
        log: [{ me: false, text: ["Hello. What can I do for you?"] }] };
      state.sheet = null;
      state.form = {};
      state.you = { name: "" };
      render();
      toast("Back to the beginning. Same family, same week.");
    },

    "react": function (el) {
      var id = el.getAttribute("data-id");
      var m = state.data.messages.filter(function (x) { return x.id === id; })[0];
      if (!m) return;
      m.reaction = m.reaction ? null : "❤️";
      render();
    }
  };

  document.addEventListener("click", function (ev) {
    var el = ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!el) {
      if (ev.target.id === "scrim") closeSheet();
      return;
    }
    var act = el.getAttribute("data-act");
    if (act === "send") return; // handled by submit
    if (ACTIONS[act]) {
      ev.preventDefault();
      ACTIONS[act](el);
    }
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && state.sheet) { closeSheet(); return; }
    if (ev.key === "Enter" || ev.key === " ") {
      var el = ev.target.closest ? ev.target.closest('[data-act="react"]') : null;
      if (el) { ev.preventDefault(); ACTIONS.react(el); }
    }
  });

  document.addEventListener("submit", function (ev) {
    var setupForm = ev.target.closest ? ev.target.closest('[data-act="setup-send"]') : null;
    if (setupForm) {
      ev.preventDefault();
      var f = $("#setup-field");
      var v = (f && f.value.trim()) || "";
      if (!v) return;
      if (f) f.value = "";
      setupAdvance(v, setupStep().id, v);
      return;
    }
    var form = ev.target.closest ? ev.target.closest('[data-act="send"]') : null;
    if (!form) return;
    ev.preventDefault();
    var field = $("#composer-field");
    if (!field) return;
    var v = field.value;
    field.value = "";
    sendMessage(v);
  });

  /* Enter-to-send in the composer, Shift+Enter for a new line. */
  document.addEventListener("keydown", function (ev) {
    if (ev.target && ev.target.id === "composer-field" && ev.key === "Enter" && !ev.shiftKey &&
        ev.target.tagName === "TEXTAREA") {
      ev.preventDefault();
      var v = ev.target.value;
      ev.target.value = "";
      sendMessage(v);
    }
  });

  /* Free-text fields on the board write straight into state on blur. */
  document.addEventListener("change", function (ev) {
    var el = ev.target;
    if (!el.getAttribute) return;

    if (el.getAttribute("data-newcontact")) {
      var name = el.value.trim();
      el.value = "";
      if (!name) return;
      state.data.contacts.push({
        id: "c" + (++state.slotSeq), name: name, phone: "+1 (555) 014-" +
          (1000 + (state.slotSeq * 37) % 8999), optedIn: false
      });
      render();
      toast(name + " is on my list. I'll ask her before I write to her.");
      return;
    }

    var field = el.getAttribute("data-field");
    if (field) {
      var t = state.data.train;
      if (field === "loves") t.loves = el.value.split("\n").map(trim).filter(Boolean);
      else if (field === "dislikes") t.dislikes = el.value.split(",").map(trim).filter(Boolean);
      else if (field === "adults" || field === "littles" || field === "teens") {
        t[field] = parseInt(el.value, 10) || 0;
      }
      else if (field === "headNote") t.headNote = el.value.trim();
      else t[field] = el.value;
      if (field === "recipientFamily") t.title = "Meals for " + el.value;
      if (field === "start" || field === "end") regenDays();
      render();
      return;
    }

    var dayField = el.getAttribute("data-dayfield");
    if (dayField) {
      var day = findDay(el.getAttribute("data-day"));
      if (day) day[dayField] = el.value.trim() || null;
      render();
      return;
    }

    var slotField = el.getAttribute("data-slotfield");
    if (slotField) {
      var loc = locateSlot(el.getAttribute("data-slot"));
      if (loc) loc.slot[slotField] = el.value;
      render();
    }
  });

  function trim(s) { return s.trim(); }

  /* ===========================================================================
     11. RENDER LOOP
     =========================================================================== */

  /* One place to say "that changed, write it down". */
  function changed() {
    persist();
    render();
  }

  function render() {
    var setupEl = $("#surface-setup"), chatEl = $("#surface-chat"), boardEl = $("#surface-board");

    var chatScroll = keepScroll("#chat-scroll");
    var boardScroll = keepScroll("#board-scroll");

    setupEl.innerHTML = state.surface === "setup" ? renderSetup() : "";
    chatEl.innerHTML = renderChat();
    boardEl.innerHTML = renderBoard();

    $("#phone").setAttribute("data-surface", state.surface);
    setupEl.setAttribute("data-pos", state.surface === "setup" ? "on" : "off-left");
    chatEl.setAttribute("data-pos",
      state.surface === "chat" ? "on" : state.surface === "board" ? "off-left" : "off-right");
    boardEl.setAttribute("data-pos", state.surface === "board" ? "on" : "off-right");
    setupEl.setAttribute("aria-hidden", state.surface !== "setup");
    chatEl.setAttribute("aria-hidden", state.surface !== "chat");
    boardEl.setAttribute("aria-hidden", state.surface !== "board");

    restoreScroll("#chat-scroll", chatScroll);
    restoreScroll("#board-scroll", boardScroll);

    renderSheet();
  }

  function keepScroll(sel) {
    var el = $(sel);
    if (!el) return null;
    return { top: el.scrollTop, atTop: el.scrollTop < 40 };
  }
  function restoreScroll(sel, saved) {
    if (!saved) return;
    var el = $(sel);
    if (!el) return;
    el.scrollTop = saved.atTop ? 0 : saved.top;
  }

  /* ===========================================================================
     Talking to the backend
     ---------------------------------------------------------------------------
     Off entirely unless a train id is in the URL, so the public demo keeps
     working with nothing behind it. When it is on, every change is written
     straight away and the board refreshes itself every few seconds.
     =========================================================================== */

  var sync = window.goldeSync || { enabled: false };

  /* Called after anything that changes the train. Optimistic: the person sees
     their change immediately and we reconcile behind them. */
  function persist() {
    if (!sync.enabled) return;
    sync.save(state.data).then(function (res) {
      if (res.outcome === "ok") return;

      if (res.outcome === "conflict") {
        /* Somebody was quicker. Take their version — dropping ours is the
           point — and say so kindly, because from where this person is sitting
           nothing has gone wrong. */
        state.data = res.data;
        render();
        toast(res.said || "Somebody got there a moment before you. Here's how it stands now.");
        return;
      }
      toast(res.said || "That didn't save. Have another go in a moment.");
    });
  }

  /* A poll came back with somebody else's change. Don't yank the page out from
     under a person mid-sentence — if a sheet is open, wait until they're done. */
  function adoptRemote(data) {
    if (state.sheet) { state.pendingRemote = data; return; }
    var before = JSON.stringify(state.data);
    if (JSON.stringify(data) === before) return;
    state.data = data;
    render();
  }

  if (sync.enabled) {
    sync.onchange = adoptRemote;
  }

  /* Tiny inline icon set — no network, no icon font. */
  function icon(name) {
    var paths = {
      back: '<path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" ' +
            'stroke-linecap="round" stroke-linejoin="round"/>',
      grid: '<path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round"/>',
      chat: '<path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-6.4A8 8 0 1121 12z" fill="none" ' +
            'stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>',
      note: '<path d="M5 4h14v16l-4-3H5z" fill="none" stroke="currentColor" stroke-width="1.9" ' +
            'stroke-linejoin="round"/>',
      link: '<path d="M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7L12 19" ' +
            'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
      share: '<path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M12 15V3m0 0L8 7m4-4l4 4" ' +
             'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
             'stroke-linejoin="round"/>',
      send: '<path d="M3.2 20.5l17.4-7.6a1 1 0 000-1.83L3.2 3.5a.85.85 0 00-1.2.86L2.9 9.6c.03.4.33.73.73.8L15 12l-11.37 1.6c-.4.06-.7.4-.73.8L2 19.64c-.04.65.6 1.12 1.2.86z" ' +
            'fill="currentColor"/>'
    };
    return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
      (paths[name] || "") + "</svg>";
  }

  /* ===========================================================================
     12. GO
     =========================================================================== */

  $("#demo-fab").addEventListener("click", function () { openSheet("demo", {}); });

  /* With a real train behind it, the seed is only a placeholder until the
     backend answers — and setup is skipped, because this train already exists. */
  if (sync.enabled) {
    state.surface = "board";
    state.role = "neighbor";
    render();
    sync.load().then(function (data) {
      if (data) {
        state.data = data;
      } else if (sync.lastError) {
        toast(sync.lastError);
      }
      render();
      sync.start();
    });
  } else {
    render();
  }
  scrollChatToBottom();

})();
