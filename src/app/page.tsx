'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useMember } from '@/lib/useMember';
import { useLaunch } from '@/components/landing/LaunchTransition';
import { RevealObserver } from '@/components/motion';
import { LandingNav, LandingHero, FeatureStrip, WhyAndPricing, LandingFooter, SearchQuery, scrollToId } from '@/components/landing/LandingSections';
import { PlannerShowcase } from '@/components/landing/PlannerShowcase';
import { QuotationModal, OtaModal, CommunityModal, TrialModal, OtaCategory } from '@/components/landing/Modals';
import {
  DATE_PRESETS,
  DEFAULT_DESTINATION,
  Destination,
  PlannerModes,
  buildDays,
  computeBudget,
  resolveDestination,
} from '@/components/landing/plannerData';

const ECO_BUDGET = 12000;
const SAVE_KEY = 'tripsure_landing_plan';

export default function LandingPage() {
  // The hero search edits a draft; the planner below only changes when "ค้นหา" is pressed
  const [draft, setDraft] = useState<SearchQuery>({ destination: 'เชียงใหม่', dateIdx: 0, people: 2, budget: 15000 });
  const [query, setQuery] = useState<SearchQuery>(draft);
  const [dest, setDest] = useState<Destination>(DEFAULT_DESTINATION);
  const [modes, setModes] = useState<PlannerModes>({ eco: false, accessible: false, rainy: false });
  const [budgetBeforeEco, setBudgetBeforeEco] = useState<number | null>(null);
  const [swaps, setSwaps] = useState<Record<string, number>>({});
  const [extraDays, setExtraDays] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [saved, setSaved] = useState(false);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [ota, setOta] = useState<OtaCategory | null>(null);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  const account = useMember();
  const { launch, overlay: launchOverlay } = useLaunch('/workspace');

  const days = useMemo(() => buildDays(dest, modes, swaps, extraDays), [dest, modes, swaps, extraDays]);
  const lines = useMemo(() => computeBudget(dest, days, query.people, modes), [dest, days, query.people, modes]);

  const preset = DATE_PRESETS[query.dateIdx] ?? DATE_PRESETS[0];
  const dateLabel = `${preset.start} - ${preset.start + days.length - 1} ${preset.monthLong}`;
  const dayLabels = days.map((_, i) => `${preset.start + i} ${preset.month}`);
  const nights = days.length - 1;
  const title = customTitle ?? `ทริป${dest.name} ${days.length} วัน ${nights} คืน`;

  // A short "AI is thinking" beat so changes read as a re-plan; data itself is instant
  const replan = useCallback((fn: () => void) => {
    setThinking(true);
    setSaved(false);
    fn();
    window.setTimeout(() => setThinking(false), 450);
  }, []);

  const handleSearch = () => {
    replan(() => {
      const next = resolveDestination(draft.destination);
      if (next.key !== dest.key) {
        setSwaps({});
        setExtraDays(0);
        setActiveDay(0);
        setCustomTitle(null);
      }
      setDest(next);
      setQuery(draft);
      if (modes.eco && draft.budget !== ECO_BUDGET) {
        setModes((m) => ({ ...m, eco: false }));
        setBudgetBeforeEco(null);
      }
    });
    scrollToId('planner');
  };

  const toggleMode = (m: keyof PlannerModes) =>
    replan(() => {
      const on = !modes[m];
      setModes((prev) => ({ ...prev, [m]: on }));
      setSwaps({});
      if (m === 'eco') {
        if (on) {
          setBudgetBeforeEco(query.budget);
          setQuery((q) => ({ ...q, budget: ECO_BUDGET }));
          setDraft((q) => ({ ...q, budget: ECO_BUDGET }));
        } else if (budgetBeforeEco !== null) {
          setQuery((q) => ({ ...q, budget: budgetBeforeEco }));
          setDraft((q) => ({ ...q, budget: budgetBeforeEco }));
          setBudgetBeforeEco(null);
        }
      }
    });

  const swapStop = (d: number, i: number) => replan(() => setSwaps((s) => ({ ...s, [`${d}-${i}`]: (s[`${d}-${i}`] ?? 0) + 1 })));

  const addDay = () =>
    replan(() => {
      setExtraDays((n) => n + 1);
      setActiveDay(days.length);
    });

  const save = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ title, query, modes, swaps, extraDays, dest: dest.key, savedAt: Date.now() }));
    } catch (e) {}
    setSaved(true);
  };

  const focusSearch = () => {
    scrollToId('top');
    window.setTimeout(() => document.getElementById('hero-destination')?.focus(), 450);
  };

  return (
    <div className="min-h-screen bg-tsn-0 text-tsn-900 font-prompt [--focus:#0057FF] [color-scheme:light] selection:bg-tsb-100">
      <LandingNav
        onSearch={focusSearch}
        onStart={launch}
        member={account.member}
        onSignIn={account.openSignIn}
        onEditProfile={account.openProfile}
        onSignOut={account.signOut}
      />

      <main>
        <LandingHero query={draft} onChange={setDraft} onSubmit={handleSearch} />

        <FeatureStrip
          onPlanner={() => scrollToId('planner')}
          onCompare={(c) => setOta(c)}
          onMap={() => document.getElementById('route-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          onBudget={() => document.getElementById('budget-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          onSafety={() => setCommunityOpen(true)}
          onBusiness={() => scrollToId('pricing')}
        />

        <PlannerShowcase
          title={title}
          onRename={setCustomTitle}
          cover={dest.cover}
          dateLabel={dateLabel}
          people={query.people}
          budget={query.budget}
          days={days}
          dayLabels={dayLabels}
          activeDay={Math.min(activeDay, days.length - 1)}
          onSelectDay={setActiveDay}
          onAddDay={addDay}
          slots={dest.slots}
          modes={modes}
          onToggleMode={toggleMode}
          onSwap={swapStop}
          lines={lines}
          approx={dest.approxCoords}
          thinking={thinking}
          saved={saved}
          onSave={save}
          onOpenQuote={() => setQuoteOpen(true)}
          onOpenOta={(c) => setOta(c)}
        />

        <WhyAndPricing
          onCommunity={() => setCommunityOpen(true)}
          onTrial={() => setTrialOpen(true)}
          onCard={(i) => {
            if (i === 0) setOta('hotel');
            else if (i === 1) document.getElementById('route-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else document.getElementById('budget-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      </main>

      <LandingFooter />

      <QuotationModal open={quoteOpen} onClose={() => setQuoteOpen(false)} tripTitle={title} dateLabel={dateLabel} people={query.people} lines={lines} days={days} />
      <OtaModal open={ota !== null} onClose={() => setOta(null)} initial={ota ?? 'hotel'} destName={dest.name} people={query.people} lines={lines} />
      <CommunityModal open={communityOpen} onClose={() => setCommunityOpen(false)} />
      <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
      {account.dialogs}
      {launchOverlay}
      <RevealObserver />
    </div>
  );
}
