/* =============================================================================
   Addresses for meal trains
   -----------------------------------------------------------------------------
       askgolde.com/meals/3250/cohen-08-26-k7f2
                          ^     ^        ^     ^
                          |     |        |     unguessable suffix
                          |     |        month and year
                          |     the family
                          the planner — last 4 of their phone

   The shape is a planner's namespace plus a readable train name, which solves
   the real problem with a bare /cohens: every community has several Cohens, and
   the good names go in a week. Under a namespace, two planners can both run a
   train for a family called Cohen and never collide.

   THE SUFFIX IS NOT DECORATION.

   Last-four-of-a-phone-number is only ten thousand values, and "cohen-08-26" is
   a guess anybody who knows the family can make. Without the suffix, somebody
   who wanted to find a particular family's train could simply try — and what is
   behind the link is that this household has just had a baby, or is sitting
   shiva, along with their dietary restrictions and, once you claim a night,
   where they live. A readable address is worth having. A guessable one is not,
   when that is what it opens.

   Four random characters from an alphabet of 31 is about 900,000 tries per
   train, which combined with rate limiting is enough to make guessing pointless
   without making the link unreadable. It stays sayable over the phone.

   Note also that the digits are a label, not a lookup: if the planner changes
   their number, every link already shared keeps working, because the namespace
   is stored on the train rather than derived at read time.
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

/* Last four of the planner's phone. Five when four is already taken — the
   collision case is rare enough to solve by lengthening rather than by
   inventing a second scheme. */
export function plannerKey(phone, taken = new Set()) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) throw new Error("need at least four digits");
  let key = digits.slice(-4);
  let n = 5;
  while (taken.has(key) && n <= digits.length) {
    key = digits.slice(-n);
    n += 1;
  }
  return key;
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
  const m = /^\/meals\/(\d{4,10})\/([a-z0-9-]{3,64})\/?$/i.exec(pathname);
  if (!m) return null;
  return { planner: m[1], slug: m[2] };
}
