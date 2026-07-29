/* =============================================================================
   Addresses for meal trains
   -----------------------------------------------------------------------------
       askgolde.com/meals/7k3n/cohen-08-26-9xqm
                          ^     ^        ^     ^
                          |     |        |     random per train
                          |     |        month and year
                          |     the family
                          the planner's own space — random, not their number

   The shape is a planner's namespace plus a readable train name, which fixes
   the real problem with a bare /cohens: every community has several Cohens and
   the good names go in a week. Under a namespace, two planners can each run a
   Cohen train and never collide.

   WHY THE PROFILE ID IS RANDOM AND NOT THE LAST FOUR OF A PHONE NUMBER

   Last-four was the first idea and it is memorable, which is a real benefit —
   but only to the planner, and only on the rare occasions they type their own
   address rather than following the link they were sent. Sharing here happens
   in WhatsApp: people tap. Typing is the exception, so optimising the scheme
   for typeability buys very little.

   Against that: four digits is ten thousand values, so a phone-derived id is
   both enumerable and a partial disclosure of a real number. Seeing
   /meals/3250/ next to a family's name in a group chat either confirms whose
   desk it is, or hands over four digits of somebody's mobile. Neither is
   catastrophic; both are avoidable for free. Random costs the planner nothing
   and asks them for nothing, which is why it beats a username too — a username
   is an extra step, an extra decision, and a collision problem.

   WHY THE TRAIN KEEPS ITS OWN SUFFIX AS WELL

   Because a planner's trains must not expose one another. Without a per-train
   suffix, anybody holding one link could guess the rest: knowing
   /meals/7k3n/cohen-08-26 makes /meals/7k3n/levy-08-26 an easy try, and that
   second one might be a shiva the family would rather not have browsed. The
   entropy has to sit on the train, not only on the namespace.

   What is behind these links is that a household has just had a baby or lost
   somebody, along with their dietary restrictions and — once you claim a night
   — where they live. A readable address is worth having. A guessable one is
   not, when that is what it opens.

   The alphabet omits 0/O/1/l/i because these get read aloud and written down.
   The id is stored on the train, never derived, so nothing breaks if the
   planner changes their number or anything else about themselves.
   ============================================================================= */

/* No 0/O/1/l/i — these get read aloud and written down. */
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export function randomSuffix(len = 4) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
}

export function normaliseName(name) {
  return String(name || "train")
    .toLowerCase()
    .replace(/^(the|a)\s+/, "")
    .replace(/\s+family$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "train";
}

/* A planner's space. Random, and lengthened rather than retried on the rare
   collision, so this always terminates. */
export function plannerKey(taken = new Set()) {
  let len = 4;
  for (let attempt = 0; attempt < 40; attempt++) {
    const key = randomSuffix(len);
    if (!taken.has(key)) return key;
    if (attempt % 8 === 7) len += 1;
  }
  return randomSuffix(8);
}

/* cohen-08-26-k7f2 */
export function trainSlug(family, when, suffix) {
  const d = when instanceof Date ? when : new Date(when + "T12:00:00Z");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(-2);
  return [normaliseName(family), mm, yy, suffix || randomSuffix()].join("-");
}

/* The whole address, as it is written down and said out loud. */
export function trainPath(plannerKey, slug) {
  return "/meals/" + plannerKey + "/" + slug;
}

/* Accepts /meals/3250/cohen-08-26-k7f2 and nothing else shaped like it. */
export function parsePath(pathname) {
  const m = /^\/meals\/([a-z0-9]{4,10})\/([a-z0-9-]{3,64})\/?$/i.exec(pathname);
  if (!m) return null;
  return { planner: m[1], slug: m[2] };
}
