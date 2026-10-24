# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Thai travellers planning domestic trips, alone or in groups, in Thai. Two jobs dominate: working out where to go and what it will cost (AI planner, map, price comparison, weather), and getting a group to actually show up (community trips with a locked deposit). *(Inferred from the codebase and brief; the user did not separately confirm the primary persona.)*

## Product Purpose

TripSure AI (ทริปชัวร์) combines travel discovery with financial trust. It plans a budget-fitted trip with AI, compares hotel and transport prices across OTAs, shows weather, and lets people open or join group trips whose deposits sit in a Smart Escrow so that a member who cancels pays a penalty that partly compensates the rest of the group.

## Positioning

Trip planning and trip commitment in one place: the plan, the price, and the money that keeps the group together share one record. The escrow penalty mechanism (10% of the deposit: 5% platform, 5% shared to the remaining members) is the claim a plain planner or OTA cannot make.

## Operating Context

- Single-page Next.js app with tabs: Home, Thailand map (77 provinces, attractions, region top places), AI Planner & OTA, Community Escrow, Reviews & trust scores, Judge Revenue dashboard, plus hotel/flight search, weather, create-trip, subscription, settings, profile and auth modals.
- Built as a hackathon project ("Make Me Money"); the Judge Revenue tab demonstrates the business model to judges with simulated transactions. Mock data stands in when APIs or Supabase are not configured.
- Light and dark themes plus a reduced-motion setting, stored per browser.

## Capabilities and Constraints

- AI planning: Google Gemini 2.5 Flash with a full offline fallback.
- Weather: TMD / Open-Meteo.
- Auth and profiles: Supabase Google sign-in, or a browser-only demo profile.
- Tiers: FREE (2 AI plans/month), GOLD ฿149/month (5 plans, 50% off trip creation fee), PLATINUM ฿299/month (unlimited plans, creation fee waived, price alerts).
- Fees: 3.5% trip creation fee; 10% flake penalty split 5% platform / 5% to remaining members.
- Stack: Next.js 15 App Router, React 19, Tailwind CSS 3, lucide-react icons.

## Brand Commitments

- Name: TripSure AI / ทริปชัวร์. Existing logo in `src/app/icon.png`.
- The interface communicates trustworthiness, clarity, travel inspiration, intelligence, and professionalism, and must not read as a generic AI SaaS dashboard (user brief, 2026-10-24).
- Thai is the primary interface language; English appears for product and feature names.

## Evidence on Hand

- Destination photography: `public/images/places/*` (11 places × 3), `public/images/bangkok-bg-*.gif`, plus remote place photos referenced in `src/data/placePhotos.ts`.
- Province and attraction data for all 77 provinces (`src/data/thailandTravel.ts`), map geometry from OpenGISData-Thailand.
- Wheelchair access data from OpenStreetMap for a subset of places (`src/data/placeAccessibility.ts`).
- Users, trips, reviews, transactions, and revenue figures are mock data (`src/lib/mockData.ts`). There are no real customers, testimonials, or market statistics; future work must not invent them.

## Product Principles

1. Money and commitments are always legible: every deposit, fee, and penalty shows its amount and where it goes.
2. Plan, price, and group live on one record; a trip moves from idea to locked deposit without re-entering data.
3. Inspiration earns the click, clarity closes it: destination imagery leads, numbers and actions are never hidden behind it.
4. Demo honesty: simulated data and judge-only controls stay identifiable as such.

## Accessibility & Inclusion

Accessible-travel information (wheelchair access, elderly members in the group) is a real product feature and should stay visible where places are shown.
