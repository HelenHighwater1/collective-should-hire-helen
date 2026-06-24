# Should I S-Corp? — Build Plan

An interactive, fully-reactive tax savings calculator for freelancers deciding whether an S Corp election would save them money. Built as a single-page React + TypeScript + Tailwind + Vite app, deployed to Vercel. Visual direction: Excalidraw-flavored — clean, modern, slightly playful, hand-drawn feel, strong accent color, smooth live transitions.

---

## Guiding principles

- **Sequential stages.** We finish and verify one stage in the browser before moving to the next. I won't start a stage until you say go.
- **Minimal dependencies.** Core is React + TS + Tailwind + Vite only. The only library I'd consider adding is a small one for the hand-drawn aesthetic (see Stage 1 decision); I'll flag it and get your sign-off before adding.
- **`state_tax_data.json` is the source of truth.** No invented state numbers. The math reads from this file and degrades gracefully when a field is `null` or a state is missing.
- **Fully reactive.** No submit button. Both visualizations recompute on every keystroke / change.

---

## Stage 1 — Scaffold & Layout Shell
Stand up the Vite + React + TS + Tailwind project with the three-column responsive layout (left viz / center input card / right viz) plus the subtle footer, using placeholder boxes so the skeleton is visible and correctly proportioned in the browser.

## Stage 2 — Center Input Card
Build the polished, self-contained input card: currency-formatted income field, all-50-states dropdown, single/married-filing-jointly toggle, and a collapsible "Refine your estimate" section (collapsed by default) holding business expenses — all wired to React state and visibly updating.

## Stage 3 — Tax Math Engine
Write pure, testable TypeScript utilities: hardcoded 2026 federal brackets constant, SE/FICA logic (15.3% to the SS wage base, 2.9% above), sole-prop calculation, S-Corp calculation (50% default salary split, FICA on salary only, flat $2,500 overhead), and a state-tax module that consumes `state_tax_data.json` (income tax + annual report fee / franchise tax) with graceful fallbacks. Verified via a temporary on-screen debug readout.

## Stage 4 — Live Pie Charts
Render the left (Sole Proprietorship) and right (S Corporation) panels: each with a title, a pie chart of the correct slices, and a total-tax summary number below — wired to the Stage 3 engine so both update instantly and simultaneously as inputs change.

## Stage 5 — S-Corp Insights
Add the right-panel highlighted delta callout ("You keep $X more as an S Corp") and the gentle "may not pencil out" warning when net profit is below $60K, including the negative case where the S Corp is worse.

## Stage 6 — Excalidraw Polish & Animation
Apply the full visual identity: hand-drawn aesthetic, Excalidraw color palette + accent color, hand-drawn-style font, smooth animated transitions on the pie slices and summary numbers, micro-interactions, and final responsive/footer cleanup so it feels alive and intentional.

## Stage 7 — Deploy Prep (optional)
Production build check, basic accessibility/meta/title pass, and Vercel configuration so the app is ready to ship.

---

## Slice definitions (for reference)

**Sole Proprietorship pie:** Federal Income Tax · Self-Employment / FICA Tax · State Tax · You Keep
**S Corporation pie:** Federal Income Tax · FICA Tax (salary only) · State Tax & Fees · You Keep

## Decisions to confirm before / during the build

1. **Filename:** the project already contains `state_tax_data.json` (not `stateTaxData.json`) and it holds real data, not an empty `{}`. I'll consume this real file as-is unless you'd prefer I rename it or stub it.
2. **Hand-drawn rendering (Stage 6):** to get the true Excalidraw sketchy look I may add a tiny library (e.g. `roughjs`) and/or the Excalifont/Virgil hand-drawn font. Alternatively I can hand-roll an SVG approximation with zero new deps. I'll recommend and confirm at Stage 6.
3. **Excalidraw screenshot:** I know the Excalidraw aesthetic well, so it's not strictly required — but if you have a specific screenshot/look in mind, sharing it before Stage 6 would help me match it precisely.

---

*Built as a portfolio project — not tax advice. Consult a CPA.*
