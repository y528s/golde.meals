/* =============================================================================
   golde. meals — keeping several people looking at the same week
   -----------------------------------------------------------------------------
   Loaded before app.js. If no train id is in the URL it does nothing at all and
   the app runs exactly as the offline prototype does — which is what keeps the
   GitHub Pages demo working with no backend behind it.

   With ?t=some-train it becomes real: the board is fetched on load, written back
   on every change, and refreshed often enough that two people editing at once
   see each other within a few seconds.

   On polling rather than sockets: a meal train changes perhaps twenty times in a
   week. A WebSocket would mean connection state, reconnection, and a Durable
   Object per train, to shave six seconds off an event that happens twice a day.
   Polling while the tab is visible, plus an immediate refresh when somebody
   comes back to it, is indistinguishable to a person and an order of magnitude
   less to go wrong. The thing that actually matters — two people not both
   taking Tuesday — is solved on the write, not the read.
   ============================================================================= */

(function () {
  "use strict";

  var POLL_MS = 7000;
  var params = new URLSearchParams(location.search);
  var trainId = params.get("t");

  var Sync = {
    enabled: !!trainId,
    id: trainId,
    base: (document.querySelector('meta[name="golde-api"]') || {}).content || "/api",
    version: 0,
    saving: false,
    dirty: false,
    lastError: null,
    onchange: null      /* app.js sets this */
  };

  window.goldeSync = Sync;

  if (!Sync.enabled) return;

  function url() { return Sync.base + "/trains/" + encodeURIComponent(Sync.id); }

  /* ---- reading ------------------------------------------------------------ */

  Sync.load = function () {
    return fetch(url(), { headers: { accept: "application/json" } })
      .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
      .then(function (res) {
        if (res.status !== 200) {
          Sync.lastError = res.body.said || "I couldn't reach the board just now.";
          return null;
        }
        Sync.version = res.body.version;
        Sync.lastError = null;
        return res.body.data;
      })
      .catch(function () {
        Sync.lastError = "I can't reach the board just now. It's me, not you — I'll keep trying.";
        return null;
      });
  };

  /* Pull only when something has actually moved, so a quiet week costs nothing
     but a 200 with the same version number. */
  Sync.poll = function () {
    if (Sync.saving) return;
    Sync.load().then(function (data) {
      if (data && Sync.onchange) Sync.onchange(data, Sync.version);
    });
  };

  /* ---- writing ------------------------------------------------------------ */

  /*
     Returns "ok" | "conflict" | "offline".

     A conflict is not an error and must never be shown as one: somebody simply
     got there first. The caller replays the fresh state and tells the person in
     her voice. Their own change is dropped on purpose — re-applying it blindly
     is how two people end up on the same night.
  */
  Sync.save = function (data) {
    Sync.saving = true;
    return fetch(url(), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version: Sync.version, data: data })
    })
      .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
      .then(function (res) {
        Sync.saving = false;

        if (res.status === 200) {
          Sync.version = res.body.version;
          Sync.lastError = null;
          return { outcome: "ok" };
        }

        if (res.status === 409) {
          Sync.version = res.body.version;
          return { outcome: "conflict", data: res.body.data, said: res.body.said };
        }

        Sync.lastError = res.body.said || "That didn't save. Try once more.";
        return { outcome: "offline", said: Sync.lastError };
      })
      .catch(function () {
        Sync.saving = false;
        Sync.lastError = "I couldn't save that — you've lost signal somewhere. " +
          "Don't do it again just yet; I'll tell you when I'm back.";
        return { outcome: "offline", said: Sync.lastError };
      });
  };

  /* ---- when to look ------------------------------------------------------- */

  var timer = null;

  function start() {
    stop();
    timer = setInterval(function () {
      if (document.visibilityState === "visible") Sync.poll();
    }, POLL_MS);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  /* Coming back to the tab is the moment staleness is most likely and most
     visible, so refresh straight away rather than waiting for the next tick. */
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") Sync.poll();
  });
  window.addEventListener("online", function () { Sync.poll(); });

  Sync.start = start;
  Sync.stop = stop;
})();
