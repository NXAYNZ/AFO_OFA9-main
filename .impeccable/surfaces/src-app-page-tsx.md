---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

# TripSure AI — app shell and all tabs

## Scope and mode

Whole single-page app (`src/app/page.tsx` and every tab, modal, and shared component). Mode: Operate for the shell and tool tabs (map, planner, escrow, reviews, judge dashboard, modals); the Home tab's opening band is the one Persuade moment inside the shell.

## Audience, job, constraints

Thai travellers planning domestic trips and joining group trips with a locked deposit; judges reviewing the hackathon business model. Thai-first copy. Preserve all behaviour, data, copy facts, light/dark themes, and reduced-motion support. Full redesign requested by the user on 2026-10-24 ("Editorial Travel Intelligence"); the old look is anti-reference.

## Direction contract

THESIS: A Thai travel magazine that can hold your money. Editorial type and photography set the mood; every amount that matters is printed on a ticket. Refuses the category default of gradient hero banners, pill badges, emoji headings, and rainbows of identical rounded cards.

OWN-WORLD: Stone paper ground (#F5F4F0) under white panels with hairline borders; a deep navy ink shell rail (#13233A); Andaman lagoon teal (#1A7D71) for primary action and selection; saffron (#C27F1E) for money, tier, star ratings, and caution states (amber is the familiar warning and rating colour, kept on purpose); terracotta (#BC4D36) only for penalties and errors; muted gulf blue for information and weather; lagoon also marks selection on the map. Cited adaptations: the five map regions keep muted atlas tints because the region is product data; the animated weather sky stays because it is an existing feature, painted on flat per-scene sky colours with clouds held clear of the text. Trirong (looped Thai serif) for page titles and headlines, Anuphan for all UI, labels, and data with tabular figures. Corners 6–12px, no decorative gradients (photo scrims only), no glass, lucide icons only.

STORY: The visitor sees where to go, what it costs, and who is committed, then plans with AI or locks a deposit on a trip in one or two actions.

FIRST VIEWPORT: Navy rail on the left with the wordmark and grouped navigation; a slim stone header with search, AI quota, tier, and account. Home opens on a full-bleed destination photograph with a large Trirong headline set over a bottom scrim, two actions underneath (plan with AI primary, browse trips secondary), followed at once by the search panel.

FORM: Brief-pinned direction. Operate shell lends type, palette, density, and one signature move: the ticket stub. Any trip with a deposit renders as a ticket whose perforated stub (dashed rule, notched edges) carries the deposit, seats, and price. Direction stays brief-pinned; the roll was run only to record the reference. seed:598a6dfd74088418

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
