# tests

Browser suites. They drive the real app and read what a person would see.

```bash
npm install
npm test                 # 13 suites against the static app
npm run test:backend     # persistence + the double-claim race
node tests/run.js qa     # one suite
CHROME=/path/to/chrome npm test
```

| suite | what it holds down |
|---|---|
| `qa` | Golde answers real questions from live board state, not canned replies |
| `gate` | the address stays hidden until you claim a night |
| `recipe` / `scope` | asking for a recipe, declining, and who may keep it |
| `goto` | saved go-to meals, faded per night against that night's rules |
| `tone` | shiva vs birth: register, no variety nudge, **no donation ask** |
| `thanks` | the family's own words, and the guarded pause |
| `setup` | the WhatsApp setup conversation end to end |
| `newopts` | every-other-day, adults/children, free-text allergies firing |
| `glance` | the at-a-glance week, and no endearments anywhere |
| `help` | ask-the-planner and feedback buttons on every board |
| `drive` | the whole loop, desktop and 390px mobile |
| `measure2` | board height in screenfuls — catches creeping scroll |
| `addday` | a tester's exact flow: every-other-day, then slotting a day back in |
| `keeplink` | getting back to the board a week later — copy, text, email, home screen |
| `calendar` | parsha and fasts when verified; **silence** when not |
| `a11y` | 44px tap targets and a 15px text floor — measured, not eyeballed |
| `backend` / `conflict` | needs `mockapi.js`; run with `--backend` |

`mockapi.js` is a stand-in for the Cloudflare Worker implementing the same
contract — same routes, same version check, same 409 payload. Node's single
thread gives the same serialisation D1's atomic `UPDATE` gives, which is the
property under test.
