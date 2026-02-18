
# CAPI Tab: Live Campaign Sliders

## Architecture Understanding

The data flow is already set up for this. `AssumptionOverrides` has `capiYearlyCampaigns` and `capiAvgCampaignSpend` fields. The engine's `calculateCapiConfiguration()` checks for these overrides first before deriving from readiness factors. The only missing piece is that `CapiTab` has no way to set overrides — it is purely read-only today.

The pattern to follow is identical to what was done on the Addressability tab: pass `assumptionOverrides` and `onAssumptionOverridesChange` down, run a local `useMemo` recalculation off the slider values, and display the live result.

---

## What the Sliders Control

**Slider 1 — CAPI Campaigns Per Year**
- Range: 2 → 50 (step 1)
- Default: whatever `results.capiCapabilities.capiConfiguration.yearlyCampaigns` is (the engine-calculated value)
- Label: "CAPI Campaigns / Year"
- Sublabel: shows monthly average (e.g. "~1.3/month")

**Slider 2 — Average Campaign Spend**
- Range: $25K → $500K (step $5K)
- Default: whatever `results.capiCapabilities.capiConfiguration.avgCampaignSpend` is
- Label: "Avg Campaign Spend"
- Sublabel: shows current value formatted (e.g. "$79K")
- Annotation at $600K: "Cap kicks in above this" — but since we cap the slider at $500K, show the annotation at the right edge

Both sliders update the `assumptionOverrides` state instantly, which triggers a recalculation in the CAPI tab's local `useMemo`. The portfolio economics, "Annual Net to Vox" hero number, context card, and alignment model cards all update live.

---

## What Updates Live

When either slider moves:
1. `capiYearlyCampaigns` and/or `capiAvgCampaignSpend` are written into `assumptionOverrides`
2. `calculateCampaignPortfolio(localCampaigns, localAvgSpend)` re-runs via `useMemo` → updates hero card + campaign economics table
3. `generateAllScenarios(results)` still uses `results` from the engine — but the hero card and portfolio stats use the local slider values directly, so they respond instantly without a full engine recalculation
4. A note is shown when slider values diverge from the engine defaults: "You are modelling X campaigns at $Y avg spend (engine default: A campaigns at $B avg spend)"

**Important design decision**: The alignment model cards at the bottom use `results` from the engine (which requires a full recalculation). To avoid complexity, the sliders will update `assumptionOverrides` which gets passed back up to `ScenarioModeler`, and `ScenarioModeler` will call `setAssumptionOverrides` which already triggers a full recalculation via `useScenarioCalculator`. This means ALL outputs (including the alignment models) update correctly.

The local state in `CapiTab` tracks the slider display values, and writes them to `assumptionOverrides` on change.

---

## Layout of the New Slider Section

The sliders sit inside the existing "Your CAPI Configuration" hero card, replacing the static badge at the top right and the static 3-stat grid, with an interactive version:

```text
┌─ Your CAPI Configuration ─────────────────────────────────────┐
│                                                                │
│  CAPI Campaigns / Year                        [16]            │
│  2 ────────────────●──────────────────────── 50               │
│  ~1.3/month                        ~4.2/month                 │
│                                                                │
│  Avg Campaign Spend                        [$79K]             │
│  $25K ─────────●─────────────────────── $500K                 │
│  Below cap                    Approaching cap ($600K)         │
│                                                                │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐ │
│  │ 16         │ │ $79K       │ │ $XXX,XXX                   │ │
│  │ Campaigns  │ │ Avg Spend  │ │ Annual Net to Vox          │ │
│  └────────────┘ └────────────┘ └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/CapiTab.tsx` | Add local slider state, accept `assumptionOverrides` + `onAssumptionOverridesChange` props, add two sliders in hero card, recalculate portfolio live |
| `src/pages/ScenarioModeler.tsx` | Pass `assumptionOverrides` and `onAssumptionOverridesChange` down to `<CapiTab>` |

That is all. Two files. No engine changes needed — `capiYearlyCampaigns` and `capiAvgCampaignSpend` override support already exists in the engine.

---

## Slider Initialization Logic

On mount, read from `assumptionOverrides.capiYearlyCampaigns` if set, else fall back to `results.capiCapabilities.capiConfiguration.yearlyCampaigns`. Same for avg spend. This ensures if the user has already set overrides (e.g. from a previous session), the slider starts at the right value.

---

## One Edge Case

The `CampaignEconomicsTable` currently uses a hardcoded `EXAMPLE_CAMPAIGNS` array and doesn't respond to slider changes. That table shows the cap mechanics at different spend levels — it's intentionally illustrative, not portfolio-specific. It will remain static (the fixed example campaigns at $79K, $150K, $300K etc.) since its purpose is to explain the cap mechanic, not model the user's specific portfolio. The **portfolio hero card** and **"Annual Net to Vox"** are the live-updating outputs.

---

## Regression Check

- Summary tab totals: Will update correctly when slider moves (because `onAssumptionOverridesChange` triggers `useScenarioCalculator.updateAssumptionOverrides` which recalculates `results`)
- Addressability tab: Unaffected (different override keys)
- PDF export: Will reflect whatever campaign values are set when user clicks Download (already reads from `results`)
- Alignment models: Will update because they read from `results` which recalculates
