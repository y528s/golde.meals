#!/usr/bin/env node
/* =============================================================================
   Test runner
   -----------------------------------------------------------------------------
   These are not unit tests. They drive a real browser through the real app and
   read what a person would see, because almost every bug worth catching in this
   project has been a copy or layout bug that a unit test would have passed.

   Several real defects were caught only here: the number field gating the
   allergen warning, the address hidden behind a fold at the moment it starts
   mattering, and compacting a night silently removing the family's way to ask
   for its recipe.

     node tests/run.js            everything against the static demo
     node tests/run.js qa gate    only those
     node tests/run.js --backend  the persistence and race tests

   Needs a Chromium. Set CHROME=/path/to/chrome if it isn't in the usual place.
   ============================================================================= */

const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const fs = require("fs");

const DIR = __dirname;
const DOCS = path.join(DIR, "..", "docs");

/* Suites that run against the plain static app. */
const STATIC = ["qa", "gate", "recipe", "scope", "goto", "tone", "thanks",
                "setup", "newopts", "glance", "help", "drive", "measure2", "addday", "keeplink", "calendar", "potluck", "a11y"];

/* Suites that need the stand-in API. */
const BACKEND = ["backend", "conflict"];

const args = process.argv.slice(2);
const wantBackend = args.includes("--backend");
const named = args.filter(a => !a.startsWith("--"));

function serveStatic(port) {
  const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css" };
  return new Promise(resolve => {
    const s = http.createServer((req, res) => {
      const f = req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0];
      const full = path.join(DOCS, f);
      if (!full.startsWith(DOCS) || !fs.existsSync(full)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "content-type": MIME[path.extname(full)] || "text/plain",
                           "cache-control": "no-store" });
      res.end(fs.readFileSync(full));
    }).listen(port, () => resolve(s));
  });
}

function run(name) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, [path.join(DIR, name + ".js")], { stdio: ["ignore","pipe","pipe"] });
    let out = "";
    p.stdout.on("data", d => out += d);
    p.stderr.on("data", d => out += d);
    const kill = setTimeout(() => p.kill("SIGKILL"), 180000);
    p.on("close", code => {
      clearTimeout(kill);
      const errs = /errors:\s*(\d+)|ERRORS \((\d+)\)/i.exec(out);
      const count = errs ? Number(errs[1] || errs[2]) : null;
      const failed = code !== 0 || /FATAL/.test(out) || (count !== null && count > 0);
      console.log((failed ? "  FAIL  " : "  ok    ") + name);
      if (failed) console.log(out.split("\n").filter(l => /FATAL|error|Error/.test(l)).slice(0,3)
        .map(l => "          " + l.trim()).join("\n"));
      resolve(!failed);
    });
  });
}

(async () => {
  const suites = named.length ? named : (wantBackend ? BACKEND : STATIC);
  const needsApi = suites.some(s => BACKEND.includes(s));

  let server, api;
  if (suites.some(s => STATIC.includes(s))) server = await serveStatic(8099);
  if (needsApi) {
    api = spawn(process.execPath, [path.join(DIR, "mockapi.js")], { stdio: "ignore" });
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log("\nrunning " + suites.length + " " + (suites.length === 1 ? "suite" : "suites") + "\n");
  let bad = 0;
  for (const s of suites) if (!(await run(s))) bad++;

  if (server) server.close();
  if (api) api.kill();

  console.log("\n" + (bad ? bad + " failed" : "all passed") + "\n");
  process.exit(bad ? 1 : 0);
})();
