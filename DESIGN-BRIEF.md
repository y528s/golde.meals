# Design brief — static screens, every state

Hand this whole file to a designer. It is written to be pasted as-is.

The live prototype is the ground truth for behaviour and copy. Anywhere this
document and the prototype disagree, the prototype is right and this document
is out of date — say so rather than guessing.

---

## The brief

> Design static screens for **golde. meals**, a web app that helps a community
> organise meals for a family who need them — a new baby, a shiva, someone
> recovering from surgery, a family whose father is away on reserve duty.
>
> A planner answers a few questions and gets one link. They paste it into the
> WhatsApp groups they already have. People tap it, take a night, say what
> they're bringing, and get reminded the day before. There are no accounts and
> nothing to download.
>
> I need every screen, in every meaningful state, as static comps at **390 ×
> 844** (iPhone 14/15). The working prototype covers the behaviour; what it
> doesn't have is a designer's eye. Match the sister product's identity —
> cream, deep forest green, an old-style serif for display, generous rhythm —
> so the two read as the same company.

---

## Who is looking at these screens

Not you, and not me. In testers' own words:

- *"moms who might not know how to use technology"*
- *"normal Jews who can barely use their email"*
- *"busy and probably only paying 50% attention as they sign up"*

**Two floors are non-negotiable and outrank every aesthetic preference:**

| | |
|---|---|
| **44 × 44px** | minimum tap target, no exceptions |
| **15px** | minimum for any text carrying meaning. Timestamps and small tags may go to 12.5px; nothing else may. |

A comp that breaks either is rejected regardless of how good it looks.

---

## Three things that will make or break this

**1 · The same screens serve a birth and a bereavement.**
This is the hardest constraint in the product and the one most likely to be
missed. A board for a new baby and a board for a shiva are the *same screens*
with different words. Nothing in the visual design may assume celebration — no
confetti, no balloons, no exclamation marks baked into a component, no cheerful
illustration. Design the shiva case first and check the birth case against it,
not the other way round.

**2 · Three visual species, and they must never be confused.**
A tester said the sections were *"similar in colour, so I wasn't sure what all
the different sections do or mean."* The fix was structural and must survive
your redesign:

| Species | Looks like | Never |
|---|---|---|
| **Golde talking** | no card, no fill, a rule down the left. Speech looks like speech. | never a box |
| **Something to do** | the only raised white card, with a coloured left edge and a real button | never used for reference |
| **For reference** | flat, tinted, no shadow | never mistakable for a button |

An **amber** rule on Golde's speech means *read this before you cook* — a
deadline, an allergy, a clash. It has exactly that one meaning. Do not use
amber decoratively anywhere.

**3 · Every group of things gets a heading in plain words.**
Not icons, not dividers alone. A sender's page currently reads: *What this is ·
The week · 2 nights need somebody · About the Cohens · If you need something.*
The counts are live, so the heading is also the status.

---

## The screen inventory

Roughly **70 comps**. Tiered so you can stop at the end of any tier and have
something useful.

### Tier 1 — the spine (28 comps)

Everything a real person touches on a normal week.

**Front page (4)**
1. Cover, default
2. Cover, code entry focused with the keyboard up
3. Cover, code rejected — *"I don't know that one"*
4. Cover at 360 × 640, where content overflows and must scroll cleanly

**The setup conversation, meal train path (13)**
One comp per question. Golde's line, the person's previous answers above, and
the answer chips or text field below.

5. `start` — *"Hello. What can I do for you?"* → two chips, both beginning "I'm setting up"
6. `family` — who are we feeding (text)
7. `family`, re-asked — somebody typed "my mum" and she notices it isn't a name
8. `occasion` — 6 chips including Miluim and Something else
9. `occasionOther` — free text, shown only if they chose Something else
10. `length` — 5 chips including A month and Until I say stop
11. `lengthOther` — free text
12. `cadence` — 4 chips including Lunch and dinner every day
13. `adults` / `teens` / `littles` — three near-identical number screens (one comp, note the variants)
14. `headNote` — free text with a Skip
15. `allergies` — 5 chips
16. `otherAllergies` — free text with a Skip
17. `address` — free text with "I'll add it later"
18. `done` — the summary and a card linking to the board

**The board, as a sender (7)**
19. Nothing claimed yet
20. Partly filled — the common case, two nights open
21. Every night taken
22. With a night of your own — *"What you said you'd bring"* panel showing
23. The variety warning showing — *"Wednesday and Thursday are both pasta"*
24. A Friday card, with the candle deadline
25. Scrolled to the footer — the four help buttons

**Taking a night (4)**
26. The claim sheet, empty
27. The claim sheet, filled in
28. The concerns sheet — an allergy caught, with *"take it anyway"* still available
29. Confirmed

### Tier 2 — the other roles and the shapes (22 comps)

**Board as planner (5)**
30. Fresh train, nothing sent yet
31. Partly filled, with the share button
32. Settings expanded — dates, occasion, ways to help, the plain-calendar switch
33. The contact book, with somebody not opted in
34. Wrapped up — the train is over

**Board as recipient (3)**
35. The family's own view, dishes hidden
36. The family's own view, dishes shown
37. A recipe asked for and written out

**Friday night and Shabbat lunch as a table (4)**
38. Friday card, all 8 courses open — challah, apps, soup, main, side, salad, dessert, wine
39. Friday card, half taken
40. Shabbat lunch, 7 courses
41. Edit-this-day, the course picker with one course greyed because somebody has it

**The potluck (6)**
42–46. Setup steps unique to it: `host`, `gathering`, `when`, `crowd`, `pets`, `spread`
47. The potluck board — one date, a slot per dish, the tags row

**Tone (4) — the important four**
The same sender board, four times, one per register. Same layout, different words.
48. `bright` — a new baby
49. `tender` — recovery from surgery
50. `quiet` — a shiva
51. `tender` — miluim

### Tier 3 — sheets, edges and the long tail (20 comps)

**The remaining sheets (9)**
52. `keeplink` — the link, the code, and Add to Home Screen
53. `swap` — moving your night
54. `cancel` — pulling out, without guilt
55. `thanks` — the planner thanking everybody
56. `editslot` — the planner changing somebody's details
57. `recipient` — editing the family's particulars
58. `pickday` — choosing a night when you arrived without one
59. `addpeople` — pasting a list, and the contact-picker variant
60. `recipe` — reading one

**States nobody designs and everybody hits (7)**
61. Train paused — *"they have enough for now"*
62. A day nobody needs, and the tap that brings it back
63. A month-long train — the week strip scrolling, with the edge fade
64. Two meals a day — lunch and dinner slots on one card
65. Plain calendar on — Saturday is Saturday, no candle deadline, no meat-or-dairy
66. Offline / save failed
67. Somebody else took the night while you were typing

**Cross-cutting (4)**
68. Every component, one sheet — buttons, chips, inputs, cards, the three species
69. Type scale with real strings from the product
70. Colour, with contrast ratios stated
71. The week strip in all five cell states: free, taken, yours, nothing-needed, Shabbat

---

## The copy is not placeholder

Use the real strings. Golde has a voice and it is the product's main asset — a
comp with lorem ipsum, or with copy you improved, tells us nothing.

Two rules the build enforces automatically, so a comp that breaks them cannot
ship:

- **No endearments addressed to the reader.** *"Golde is your friendly robotic
  bubby"* describes her and is fine. *"Thanks, bubby"* addresses a stranger and
  is not.
- **No word that spells two ways.** Not organise/organize, not
  neighbour/neighbor, not favourite/favorite. This link gets forwarded from
  Hendon to Ramat Beit Shemesh to Lakewood. Use *set up*, *people*, *the one
  they love*.

---

## What to deliver

- **Figma**, one page per tier, one frame per comp, named to match the numbers above.
- **Components** for anything appearing more than twice: the week cell, the day
  card, Golde's speech, the section heading, buttons, chips, the sheet shell.
- **Both themes** if you have the time. Light is the priority.
- **A redlines frame** — spacing scale, type scale, the colour tokens with hex
  values, and the contrast ratio for every text-on-background pair you introduce.
- **Flag anything you had to invent.** If a state isn't in the prototype and you
  designed it anyway, say so, because it means we have a gap in the build.

---

## Questions I expect you to ask, answered early

**Can I change the green?** It comes from the sister product and meals should
read as the same company, so no — not without that conversation. Everything
else is open.

**Can I use illustration?** Yes, if it survives the shiva case. A warm domestic
mark — a set table, a cloth, stitching — works. A cartoon family does not.

**Why is there no navigation?** Because there is one page per role and nothing
to navigate. Three testers described an earlier version as having too many
layers. Do not reintroduce tabs.

**Can I make the tap targets smaller if it looks cramped?** No. Change the
layout instead.

**Should Golde have a face?** The sister product has a mark. Ask for it rather
than inventing a second one.
