---
name: TripSure AI
description: A Thai travel magazine that can hold your money. Editorial type and photography up front, every amount that matters printed on a ticket.
colors:
  lagoon: "#1a7d71"
  lagoon-deep: "#126c61"
  lagoon-ink: "#0e5951"
  lagoon-mist: "#ebf4f1"
  lagoon-wash: "#a5d1c8"
  navy-ink: "#13233a"
  night-ink: "#0a1422"
  slate-ink: "#343e4f"
  muted-ink: "#5f6876"
  quiet-ink: "#8f9196"
  stone-paper: "#f5f4f0"
  panel-white: "#ffffff"
  hairline: "#dddad1"
  field-stroke: "#c4c0b5"
  saffron: "#c27f1e"
  saffron-ink: "#855215"
  saffron-mist: "#fbf4e8"
  terracotta: "#bc4d36"
  terracotta-ink: "#a13d29"
  terracotta-mist: "#fbefec"
  gulf-blue: "#456590"
  gulf-ink: "#2a4165"
  gulf-mist: "#eef2f7"
  night-surface: "#101c2d"
  night-raised: "#15233a"
  night-rule: "#23344f"
  night-text: "#f1f2f0"
  night-muted: "#9aa5b4"
  night-lagoon-text: "#7cc4b8"
  night-focus: "#6fb4a8"
  night-saffron-text: "#e8b867"
  night-terracotta-text: "#e99a86"
  night-gulf-text: "#a3b8d4"
  region-north: "#d6dbbf"
  region-northeast: "#ebd9ae"
  region-central: "#e6e1c8"
  region-east: "#c8ded0"
  region-south: "#c3d7e2"
  sky-sunny: "#3f5f8a"
  sky-night: "#13233a"
  sky-cloudy: "#4f5868"
  sky-rain: "#343e4f"
  sky-storm: "#1a2433"
  sky-cold: "#456590"
  series-1: "#3a62b0"
  series-2: "#c98a1a"
  series-3: "#0e8a78"
  series-4: "#c4532f"
  series-1-dark: "#6d90d8"
  series-2-dark: "#b8862a"
  series-3-dark: "#2aa58f"
  series-4-dark: "#df6c48"
typography:
  display:
    fontFamily: "Trirong, Anuphan, serif"
    fontSize: "2rem (base) / 3rem (sm) / 3.5rem (lg)"
    fontWeight: 600
    lineHeight: "1.25 (base) / 1.2 (sm+)"
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Trirong, Anuphan, serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: "2.25rem"
    letterSpacing: "-0.01em"
  section-title:
    fontFamily: "Trirong, Anuphan, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Trirong, Anuphan, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body-lead:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
  meta:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: "1rem"
  figure:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  figure-hero:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
rounded:
  sm: "3px"
  DEFAULT: "4px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  2xl: "12px"
  full: "9999px"
spacing:
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "10": "40px"
  "12": "48px"
  control: "44px"
  control-lg: "48px"
  header: "64px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.lagoon-deep}"
    textColor: "{colors.panel-white}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.lagoon-ink}"
  button-secondary:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-on-photo:
    backgroundColor: "{colors.stone-paper}"
    textColor: "{colors.navy-ink}"
    rounded: "{rounded.md}"
    padding: "0 20px"
    height: "48px"
  input-field:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.navy-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  panel:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  panel-data:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.xl}"
  ticket:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.xl}"
  ticket-stub:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.lagoon-ink}"
    typography: "{typography.figure}"
    padding: "14px 16px 16px"
  rail:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.night-text}"
    width: "288px"
  rail-item-active:
    textColor: "{colors.panel-white}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
  segmented-option-active:
    backgroundColor: "{colors.navy-ink}"
    textColor: "{colors.panel-white}"
    typography: "{typography.meta}"
    rounded: "{rounded.DEFAULT}"
    padding: "4px 10px"
  photo-tag:
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.panel-white}"
    typography: "{typography.label}"
    rounded: "{rounded.DEFAULT}"
    padding: "4px 8px"
  dialog:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.xl}"
---

# Design System: TripSure AI

## Overview

**Creative North Star: "The Travel Magazine That Holds Your Money"**

TripSure reads like a Thai travel magazine laid onto stone paper: a full-bleed destination photograph and a looped Thai serif headline open the product, and everything after it is an orderly working surface of white panels with hairline borders. A deep navy rail frames the app the way a masthead frames a magazine. The mood is calm, trustworthy, and specific to Thailand rather than the gradient-and-glow look of generic AI software.

Money is the one place the system gets a physical metaphor. Any trip with a deposit is printed as a ticket: a body carrying the photograph and itinerary, a perforated stub (dashed rule, half-circle notches cut from the ground) carrying deposit, seats, price, and a serial number in tabular figures. Colour is rationed by meaning: lagoon teal acts and selects, saffron marks money, tiers, ratings and caution, terracotta only ever means a penalty or an error, gulf blue informs.

Density is moderate: 14px body, 44px controls, 20px panel padding, 48px between page sections. Surfaces are flat at rest; depth is a hairline first and a soft navy-tinted shadow second. Light and dark themes carry the same structure; dark mode is a night version of the same paper, not a separate look.

**Key Characteristics:**
- Stone paper ground, white panels, 1px warm hairlines, navy ink rail.
- Five ink families; every stock Tailwind hue is folded onto them.
- Trirong (looped Thai serif) for titles; Anuphan for interface, labels, and figures with tabular numerals.
- The ticket stub is the signature for anything with money attached.
- Destination photography leads; gradients exist only as legibility scrims over it.
- Corners mostly 6px, panels 8 to 10px, dialogs 10px; small tags 4px.

## Colors

A restrained paper-and-ink palette with four meaning-bearing inks; hue is a signal, never decoration.

### Primary
- **Andaman Lagoon** (lagoon): the accent and focus colour (`--accent`, `--focus`); selection on the map, caret, active rail icon (lighter lagoon on navy), progress fill.
- **Deep Lagoon** (lagoon-deep): the fill of every primary button; white text on it.
- **Lagoon Ink** (lagoon-ink): primary hover, and the colour of escrow deposit figures on the ticket stub.
- **Lagoon Mist / Lagoon Wash** (lagoon-mist, lagoon-wash): selected-row and success tints; lagoon-wash is the text selection colour.

### Secondary
- **Saffron** (saffron): money, subscription tiers, star ratings, and caution states. Amber is kept as the familiar rating and warning colour on purpose.
- **Saffron Ink** (saffron-ink): saffron text on light grounds (tier names, caution copy). **Saffron Mist** (saffron-mist) is its tint.

### Tertiary
- **Terracotta** (terracotta): penalties, errors, a full trip, the attention ring on a required empty field. **Terracotta Ink** (terracotta-ink) is its text tone; **Terracotta Mist** (terracotta-mist) its tint.
- **Gulf Blue** (gulf-blue): information and weather. **Gulf Ink** (gulf-ink) for informational text; **Gulf Mist** (gulf-mist) its tint.

### Neutral
- **Stone Paper** (stone-paper): the page ground (`--background`) and the ground the ticket notches are cut from.
- **Panel White** (panel-white): every panel, card, ticket, field, and dialog (`--surface`).
- **Hairline** (hairline): borders, dividers, the ticket perforation (`--rule`).
- **Field Stroke** (field-stroke): input borders and the scrollbar thumb.
- **Navy Ink** (navy-ink): body text (`--foreground`), the navigation rail, active segmented option, tooltip fill.
- **Night Ink** (night-ink): the darkest ink; photo tags at 70% and modal backdrops at 50%.
- **Slate Ink / Muted Ink / Quiet Ink** (slate-ink, muted-ink, quiet-ink): secondary text, captions and metadata, disabled and serial-number text.

### Dark theme
`html.dark` swaps the ground to **Night Ink**, panels to **Night Surface** (night-surface), raised wells to **Night Raised**, rules to **Night Rule**, text to **Night Text** and **Night Muted**. Hue text lifts to a light tone so it holds on the night ground: night-lagoon-text, night-saffron-text, night-terracotta-text, night-gulf-text; focus becomes night-focus. Tints become 12% (50-step) and 20% (100-step) alpha washes of the 400 tone, borders 35% alpha. Primary button fill stays Deep Lagoon. Content sitting on a solid pastel fill keeps its light-theme dark text.

### Data colours (map and weather)
- **Region tints** (region-north, region-northeast, region-central, region-east, region-south): muted atlas tints for the five map regions. They are product data, not brand; in dark mode region cards take the full tint with dark text.
- **Sky colours** (sky-sunny, sky-night, sky-cloudy, sky-rain, sky-storm, sky-cold): one flat sky per weather scene, behind animated clouds, sun, rain, and lightning.

### Chart series
Four categorical series in fixed order: subscription, OTA affiliate, creation fee, penalty (series-1 to series-4; series-N-dark under `html.dark`). Exposed as `--series-1..4`. Segments in the part-to-whole bar are separated by a 2px gap and always paired with a legend table carrying label, amount, and share, so colour is never the only key.

### Named Rules
**The Five Inks Rule.** Every hue in the product folds into ink, lagoon, saffron, terracotta, or gulf. A new colour needs a new meaning, and there are no new meanings.

**The Terracotta Is Bad News Rule.** Terracotta appears only for penalties, errors, and a full trip. It is never a decorative accent or a highlight.

**The Data Tint Rule.** Region tints, sky colours, and chart series belong to the map, the weather scene, and charts. They do not leak into chrome, buttons, or cards.

## Typography

**Display Font:** Trirong (with Anuphan, serif)
**Body Font:** Anuphan (with system-ui, sans-serif)
**Label/Mono Font:** none separate; figures use Anuphan with tabular, lining numerals.

**Character:** Trirong's looped Thai serif gives headlines a printed, editorial voice; Anuphan is a clear loopless Thai sans for everything you read while working. The pairing reads as magazine headline over working copy.

### Hierarchy
- **Display** (600, 2rem / 3rem / 3.5rem across breakpoints, 1.25 then 1.2): the Home opener headline over the photograph only.
- **Headline** (600, 1.875rem, 2.25rem): page titles at the top of each tab.
- **Section title** (600, 1.5rem, 2rem): section headings within a tab and dialog titles.
- **Title** (600, 1.125rem to 1.25rem, snug): ticket titles, card and place titles, clamped to two lines.
- **Body lead** (400, 1rem to 1.125rem, 1.625): the opener paragraph and intro copy; max about 36rem.
- **Body** (400, 0.875rem, 1.25rem): the default working size for copy, fields, buttons, and table rows.
- **Label** (500, 0.75rem): field labels, captions, ticket field names, photo tags.
- **Meta** (500, 11px): serial numbers, rail badges, photo credits, segmented tier options.
- **Figure** (600, 1.25rem, tabular-nums lining-nums, line-height 1): stub amounts; **Figure hero** (2.1rem) for the featured trip stub.

### Named Rules
**The Two Voices Rule.** Trirong sets titles and nothing else; it never sets a button, a label, or a number. Anuphan sets everything you operate.

**The Tabular Money Rule.** Every baht amount, count, seat ratio, and serial is set in Anuphan with tabular lining numerals so columns of money align.

## Layout

A two-column app shell: a fixed navy rail on the left from 1024px up (collapsible to an icon rail; a 288px drawer with a 50% night-ink backdrop below 1024px), and a content column capped at 1280px with 16 / 24 / 40px side padding at base / sm / lg. A 64px sticky header sits at the top of the content column. The Home opener bleeds to the column edges and meets the header (negative margins equal to the column padding), with a minimum height of 460px, 540px from lg.

Rhythm is a 4px base: 6, 8, 12 and 16px inside components, 20px panel padding (24px from sm on larger panels), 48px between page sections. Tab headers place the headline and description left with the primary action right-aligned on the baseline from sm up, stacking on mobile. Data tables become stacked rows below lg. Tickets lay out in a responsive grid; the featured trip ticket puts its stub beneath the body on small screens and beside it from 1024px.

## Elevation & Depth

Flat by default. Depth comes first from the hairline on white over stone paper, then from soft navy-tinted shadows (rgb 19 35 58) that are short and diffuse. Data panels carry the smallest shadow; tickets lift on hover; only dialogs and the mobile drawer use the deepest shadow. The sticky header is a 92% page-ground bar with an 8px backdrop blur so content reads beneath it. In dark mode shadows are effectively invisible and navy-filled panels get a 1px 8% white inner ring instead.

### Shadow Vocabulary
- **Hairline lift** (`box-shadow: 0 1px 2px rgb(19 35 58 / 0.06)`): data panels and tables at rest.
- **Hover lift** (`box-shadow: 0 10px 24px -10px rgb(19 35 58 / 0.18)`): a ticket under the pointer; tooltips.
- **Raised** (`box-shadow: 0 4px 12px -4px rgb(19 35 58 / 0.12)`): popovers and menus.
- **Dialog** (`box-shadow: 0 28px 64px -24px rgb(19 35 58 / 0.32)`): modals, the lightbox, the mobile drawer.

### Named Rules
**The Paper And Hairline Rule.** A surface is separated from the ground by a 1px hairline first. A shadow is added for state (hover) or for a layer above the page (dialog), never to make a card feel important.

## Shapes

Gently squared corners: 6px for buttons, fields, and rail items; 8px for plain panels; 10px for tickets, data panels, and dialogs; 4px for small tags and segmented options. Full rounding is reserved for things that are round by nature: status dots, progress bars, avatars, toggles. The one distinctive silhouette is the ticket: a 10px-cornered body split by a 1.5px dashed perforation with 16px half-circle notches cut out of each edge in the colour of the ground behind it.

## Components

### Buttons
Quiet and firm: solid colour, no gradients, no shine.
- **Shape:** gently squared (6px).
- **Primary:** Deep Lagoon fill, white semibold 14px text, 44px tall, 16px side padding, optional 16px lucide icon leading.
- **Hover / Focus:** fill deepens to Lagoon Ink over 150ms; focus is a 2px lagoon outline offset 2px (night-focus in dark).
- **Secondary:** white with a field-stroke border and slate text; hover darkens the border.
- **On photography:** the Home opener pairs a Stone Paper button with navy text and a lagoon icon (48px tall) with an outline button (1px 40% white border, white text, 10% white fill on hover).

### Chips
- **Style:** small 4px-cornered tags. On photographs: 70% night-ink fill, white 12px text, a lucide map-pin. In UI: tinted mist fill with ink-toned text in the meaning colour.
- **State:** the tier switch is a segmented control: a 1px hairline frame with 2px inset, options in 11px semibold; the active option is a navy fill with white text (inverted in dark).

### Cards / Containers
- **Corner Style:** 8px plain panels, 10px data panels.
- **Background:** Panel White on Stone Paper.
- **Shadow Strategy:** hairline lift on data panels only (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 20px, 24px from sm; table rows 12px vertical, 20px horizontal.

### Inputs / Fields
- **Style:** 44px tall, 12px side padding, 1px field-stroke border, white fill, 14px navy text, quiet-grey placeholder, lagoon caret.
- **Focus:** border turns lagoon and a 2px lagoon ring at 20% opacity appears.
- **Error / Disabled:** a required empty field pulses a terracotta attention ring (1.6s) and a rejected action shakes horizontally (0.4s); both stop under reduced motion.

### Navigation
- **Rail:** Navy Ink background with a darker right edge. Wordmark in Trirong 1.35rem white with an 11px Anuphan Thai strapline. Group titles in 12px muted ink. Items are 14px, 6px-cornered, 18px lucide icons; resting items are light ink with a quiet icon, hover adds a 5% white wash, the active item gets a 9% white wash, white semibold text, and a lagoon icon at a heavier stroke. Badges are text, not pills: lagoon "new", a lagoon dot for live, saffron tabular revenue. A membership box sits at the foot in a 1px 10% white frame.
- **Header:** 64px sticky bar on the translucent page ground with a bottom hairline; search, AI quota, tier switch, account.
- **Mobile:** the rail becomes a 288px drawer sliding in over a 50% night-ink backdrop; Escape closes it.

### Trip Ticket (signature)
A community trip printed as a travel ticket.
- **Body:** 176px photograph with a 4px-cornered night-ink destination tag bottom-left and an optional credit tag top-right; below, a 12px date line with a lucide calendar, a Trirong title clamped to two lines, and a 4px seat-fill bar in lagoon with "seats left" in 12px (terracotta ink when full).
- **Stub:** separated by the dashed perforation with notches. Carries the escrow deposit per person as a Lagoon Ink figure with a shield-check icon, the serial `TS-####` in 11px tracked quiet ink, then a hairline-divided row of seats and price per person in tabular figures. An optional action (join button) sits at the foot.
- **Behaviour:** the whole ticket lifts to the hover shadow and the photo scales to 1.03 over 500ms. On a white panel the notches switch to the surface colour.
- **Featured variant:** on Community Escrow the stub becomes a side panel from 1024px (vertical perforation), raised-well fill, a 2.1rem deposit figure, and the locked pool total.

### Dialogs
10px-cornered white panel on a night-ink backdrop, dialog shadow, a 0.26s rise from 12px with a 0.985 scale, no overshoot; backdrop fades in over 0.2s. Province detail and lightbox use a night-ink body with a photo and a bottom scrim.

### Weather Scene
A flat sky colour per condition with drifting clouds, sun rays, rain, stars, and periodic lightning, held clear of the text by a mask. Every animation stops (and rain and strike layers hide) under reduced motion.

### Motion
Short and decelerating: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances (fade-in 0.22s with a 4px rise, dialog 0.26s), 150ms colour transitions, 200ms rail width and drawer slide. The OS reduced-motion setting and the in-app reduced-motion setting both neutralise animation.

## Do's and Don'ts

### Do:
- **Do** print every deposit-bearing trip as a ticket, with the amount on the stub in tabular Lagoon Ink figures and a `TS-####` serial.
- **Do** use Deep Lagoon for the one primary action in a view; secondary actions are white with a field-stroke border.
- **Do** set page and section titles in Trirong 600 and everything operable in Anuphan.
- **Do** separate surfaces with a 1px Hairline on white over Stone Paper; add a shadow only for hover or a dialog layer.
- **Do** put text over photography only on top of a bottom scrim, and credit the photograph.
- **Do** pair every chart colour with a label and value in a legend table, in the fixed series order.
- **Do** give every animation a reduced-motion fallback.

### Don't:
- **Don't** introduce a hue outside the five inks; stock Tailwind colours are remapped and must stay remapped.
- **Don't** use terracotta for anything but penalties, errors, and a full trip.
- **Don't** fill surfaces or buttons with gradients; gradients exist only as photo scrims, the skeleton shimmer, and inside the weather scene.
- **Don't** frost panels or cards with translucency and blur; the sticky header is the only blurred surface.
- **Don't** set labels, badges, or statuses as fully rounded pills; tags are 4px-cornered and rail badges are plain text.
- **Don't** use emoji as icons, in headings, or in labels; icons are lucide.
- **Don't** add small uppercase eyebrow labels above headings.
- **Don't** reuse map region tints or weather sky colours outside the map and weather scene.
