/* Pure logic, tested directly rather than through a browser. */
import { normaliseName, plannerKey, trainSlug, trainPath, parsePath, randomSuffix }
  from '../worker/src/slug.js';

let bad = 0;
const is = (got, want, what) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) bad++;
  console.log((ok ? '  ok    ' : '  FAIL  ') + what +
    (ok ? '' : `\n          got ${JSON.stringify(got)} want ${JSON.stringify(want)}`));
};

is(normaliseName('The Cohen Family'), 'cohen', 'strips "the" and "family"');
is(normaliseName('Bergman-Katz'), 'bergman-katz', 'keeps a double-barrelled name');
is(normaliseName("O'Brien"), 'o-brien', 'handles an apostrophe');
is(normaliseName(''), 'train', 'falls back rather than producing an empty path');
is(normaliseName('a'.repeat(50)).length, 24, 'caps the length');

is(/^[23456789abcdefghjkmnpqrstuvwxyz]{4}$/.test(plannerKey()), true,
   'profile id is random, not derived from a phone number');
const keys = new Set();
for (let i = 0; i < 400; i++) keys.add(plannerKey());
is(keys.size > 380, true, `profile ids vary (${keys.size}/400 unique)`);
is(plannerKey(new Set(['aaaa'])) !== 'aaaa', true, 'avoids one already taken');
{ /* every 4-char id taken: must lengthen rather than spin forever */
  const all = new Set();
  const A = '23456789abcdefghjkmnpqrstuvwxyz';
  for (const a of A) for (const b of A) for (const c of A) for (const d of A) all.add(a+b+c+d);
  is(plannerKey(all).length > 4, true, 'lengthens when the whole space is taken');
}

const s = trainSlug('The Cohen Family', '2026-08-04', 'k7f2');
is(s, 'cohen-08-26-k7f2', 'full slug');
is(trainPath('3250', s), '/meals/3250/cohen-08-26-k7f2', 'full path');

is(parsePath('/meals/3250/cohen-08-26-k7f2'), { planner:'3250', slug:'cohen-08-26-k7f2' }, 'parses');
is(parsePath('/meals/3250/cohen-08-26-k7f2/'), { planner:'3250', slug:'cohen-08-26-k7f2' }, 'trailing slash');
is(parsePath('/meals/3250'), null, 'a bare desk is not a train');
is(parsePath('/meals/7k3n/cohen-08-26-9xqm'), { planner:'7k3n', slug:'cohen-08-26-9xqm' }, 'random profile id parses');
is(parsePath('/meals/a/cohen'), null, 'profile id must be at least four');
is(parsePath('/../etc/passwd'), null, 'no traversal');
is(parsePath('/meals/3250/cohen/../../etc'), null, 'no traversal inside the slug');

/* The suffix is the security property, so check it actually varies. */
const seen = new Set();
for (let i = 0; i < 400; i++) seen.add(randomSuffix());
is(seen.size > 380, true, `suffixes are random (${seen.size}/400 unique)`);
is(/^[23456789abcdefghjkmnpqrstuvwxyz]{4}$/.test(randomSuffix()), true,
   'no 0/O/1/l/i — these get read aloud');

console.log(bad ? `\n${bad} FAILED\n` : '\nall passed\n');
process.exit(bad ? 1 : 0);
