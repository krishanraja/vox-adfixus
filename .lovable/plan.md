
# Plan: Safari Addressability Slider + Bug Fix + Underlying Logic Clarification

## Confirming the Underlying Logic (You Are Correct)

The engine is correctly structured. Here is the exact chain:

- **Safari = 35% of all Vox visitors** (browser share — this is a traffic composition number, not an addressability number). Chrome = 48%, Other = 17%.
- **Today**: Chrome + Other users are 100% addressable. Safari users are 0% addressable (ITP blocks all identity).
- **Today's total addressability**: (48% Chrome × 100%) + (17% Other × 100%) + (35% Safari × 0%) = **65%** baseline. This is correct.
- **With AdFixus**: If we unlock X% of Safari traffic to be addressable, total addressability = 65% + (35% Safari × X%).
  - At X = 20%: total = 65% + 7% = **72%**
  - At X = 60%: total = 65% + 21% = **86%**
  - At X = 86%: total = 65% + 30% = **95%** (the target maximum)

So to go from 65% to 95% overall addressability, you need to unlock 86% of Safari traffic. The slider should express this as **"Target overall addressability: 65% → 95%"** but internally drive `targetSafariAddressability` (i.e., what fraction of Safari users we can resolve). This is the most honest framing — it shows total portfolio addressability, not a Safari-specific %, which avoids confusion.

The **revenue math is already correct** (CPM delta model, not net-new). The slider purely changes how many Safari impressions shift from contextual → addressable CPM, and the incremental revenue updates accordingly.

---

## Bug Fix: Double-Multiplied Percentages in AddressabilityTab.tsx

The display component calls `formatPercentage(value * 100, 0)` but `details` values from the engine are **already stored as whole-number percentages** (e.g., `35` not `0.35`). This causes:

- `35 × 100 = 3500%` for Safari traffic share
- `35 × 100 = 3500%` for addressability improvement
- `8 × 100 = 800%` for make-good rate

Four lines to fix in `AddressabilityTab.tsx`:

| Line | Before | After |
|------|--------|-------|
| Safari Traffic | `(idDetails?.safariShare \|\| 0.35) * 100` | `idDetails?.safariShare ?? 35` |
| Safari Improvement | `(idDetails?.safariAddressabilityImprovement \|\| 0.30) * 100` | `idDetails?.safariAddressabilityImprovement ?? 35` |
| Make-Good Current | `(mediaDetails?.baselineMakeGoodRate \|\| 0.08) * 100` | `mediaDetails?.baselineMakeGoodRate ?? 8` |
| Make-Good Improved | `(mediaDetails?.improvedMakeGoodRate \|\| 0.03) * 100` | `mediaDetails?.improvedMakeGoodRate ?? 3` |

---

## New Feature: Safari Addressability Target Slider

### What it controls
A slider on the **Addressability tab** that lets the user set the target overall addressability (65% → 95%). The slider label should read clearly:

> **"Overall Addressability Target"**
> Currently 65% of inventory is addressable. Drag to model what happens as AdFixus unlocks Safari traffic.

Underneath the slider, show two stats that update live:
- `Safari traffic unlocked: X%` (what % of Safari visitors are now resolved)
- `Total addressable inventory: Y%` (the resulting portfolio-level number)

### Data flow

The slider value (expressed as target overall addressability, e.g. `0.86`) gets stored in `AssumptionOverrides` as a new field — the cleanest approach given the existing override pattern. We use `overrides?.targetSafariAddressability` in the engine (already a named field in the type just not yet wired to the slider).

The engine already has the structure to accept this — `calculateIdInfrastructure` reads from `overrides`. We just need to:
1. Wire up the new slider field to override `targetSafariAddressability`
2. Have the engine use `overrides?.targetSafariAddressability ?? ADDRESSABILITY_BENCHMARKS.TARGET_SAFARI_ADDRESSABILITY` instead of the fixed constant
3. Pass `setAssumptionOverrides` up to the Addressability tab (currently read-only)

### Slider design
- Range: 35% to 95% (overall addressability — the slider moves in the total addressability space)
- Default: 72% (current default — 35% Safari share × 35% of Safari unlocked + 65% baseline = 77%; need to check actual default target)
- Actually, default target = 77% (35% Safari × 35% target + 65% baseline)
- Step: 1%
- Labels: "65% (baseline)" at left, "95% (full)" at right
- Visual annotation at ~72% = "POC Target" and ~95% = "Full deployment"

Internally: when user drags to overall target `T`, engine computes `safariTargetFraction = (T - 0.65) / 0.35`. This is what drives impression count and revenue.

### ROI breakeven indicator
Below the slider, add a breakeven callout: "Positive ROI from addressability alone starts at X% overall addressability" — calculated by finding where incremental revenue covers the platform fee. This is what the user is asking for: "I want to know where we start to show positive ROI."

---

## Files to Change

| File | What Changes |
|------|-------------|
| `src/components/AddressabilityTab.tsx` | 1) Fix 4 double-multiply bugs; 2) Add Safari slider with live revenue preview; 3) Add ROI breakeven callout; 4) Accept `onAssumptionOverridesChange` prop |
| `src/utils/unifiedCalculationEngine.ts` | Wire `overrides?.targetSafariAddressability` into `calculateIdInfrastructure()` instead of fixed constant |
| `src/types/scenarios.ts` | Add `targetSafariAddressability?: number` to `AssumptionOverrides` (it already exists in the interface as a comment; just needs to be added as a live field) |
| `src/pages/ScenarioModeler.tsx` | Pass `setAssumptionOverrides` and `assumptionOverrides` to `AddressabilityTab` |

---

## What the Slider Looks Like in Context

The Addressability tab currently says "READ-ONLY — all controls on Summary tab." We will add a **single, focused control** — the addressability target slider — directly on this tab because it is a core modelling decision specific to this view. The Summary tab controls (risk scenario, timeframe, domain selection) remain there. This one slider lives here because it is about "what addressability outcome are we targeting" — a question that belongs to this analysis view.

The layout will be:

```text
┌────────────────────────────────────────────────────────────────┐
│  OVERALL ADDRESSABILITY TARGET                           [?]   │
│                                                                │
│  65% ─────────────────●────────────────────── 95%             │
│       Baseline      72% POC       86%        Full             │
│                     Target     Optimistic                      │
│                                                                │
│  Safari traffic unlocked:  20% of Safari users                │
│  Total addressable inventory:  72%  (+7pp from baseline)      │
│  Incremental revenue impact:  +$X,XXX/month                   │
└────────────────────────────────────────────────────────────────┘

┌─ ROI Breakeven ───────────────────────────────────────────────┐
│  Addressability alone covers platform fee at: 71% target      │
│  ██████████████░░░░░░░░░░ You are at 72% — above breakeven ✓  │
└────────────────────────────────────────────────────────────────┘
```

---

## Scope Summary

This is a tightly scoped change:
- **4 bug fixes** (display only, no calculation impact)
- **1 new slider** + live revenue update on Addressability tab
- **1 engine line change** to read override instead of constant
- **1 type addition** in `AssumptionOverrides`
- **1 prop addition** in ScenarioModeler to thread overrides to Addressability tab

No changes to PDF, Summary tab math, CAPI tab, or any other calculations.
