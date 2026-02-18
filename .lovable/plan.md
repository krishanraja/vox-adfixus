
# Media Performance $1.1M: Diagnostic, Math Correction, and Communication Fix

## Diagnosis: Two Separate Problems

### Problem 1 — The Math Is Inflated (Make-Good Savings)

The make-good savings are calculated as a percentage of **total monthly revenue** ($3.3M for full portfolio). This is wrong in two ways:

**Current code (line 643-645 of unifiedCalculationEngine.ts):**
```
baselineMakeGoods = currentMonthlyRevenue × 5%   → $165K/month
improvedMakeGoods = currentMonthlyRevenue × 2%   → $66K/month  
makeGoodSavings   = $99K/month
```

**Why this is wrong:**
1. Make-goods only apply to **direct-sold, guaranteed inventory** — not programmatic. For a publisher like Vox, roughly 40% of revenue is direct-sold at most. The rest is programmatic/open market and doesn't have make-good obligations.
2. A 5% baseline make-good rate applied to ALL $3.3M/month generates $99K in savings. But if make-goods only apply to the $1.3M direct-sold portion, the savings are $39K — less than half.
3. The improvement (5% → 2%) is credible, but the base it applies to needs to be defensible.

**Corrected calculation:**
- `directSoldShare = 0.40` (40% of inventory is direct-sold guaranteed — standard industry figure for premium publisher)
- `directSoldRevenue = currentMonthlyRevenue × 0.40`
- Make-good savings = `directSoldRevenue × (5% - 2%)` = $1.32M × 3% = **$39.6K/month** (vs current $99K)

**Premium Yield Uplift — this part is sound:**
- 20% of impressions classified as premium
- 15% CPM uplift on premium inventory
- This generates ~$54K/month base before risk adjustments
- This is defensible: it's based on impression count × CPM delta, not revenue percentage

**Annual Media Performance after fix:**
- Make-good savings: ~$39.6K/month (was ~$99K)
- Premium yield: ~$54K/month (unchanged)
- Combined base: ~$93.6K/month (was ~$153K/month)
- After deployment (1.2×), risk, adoption: **~$650-700K/year** instead of $1.1M

That's still significant — and now it's a number a CFO can interrogate without embarrassing anyone.

### Problem 2 — The Communication Is Too Thin

The current description "Operational improvements from better data - fewer make-goods, higher yield" is a single line that makes a $1.1M claim with zero mechanism. A CFO will immediately ask: "Where does $1.1M come from?" and there's nowhere to look.

The fix is to expose the calculation components explicitly in the UI, not just the total, and give each component a clean narrative anchor.

---

## What the $1.1M Actually Consists Of (Current)

| Component | Monthly | Annual (12mo) | Driver |
|-----------|---------|--------------|--------|
| Premium Yield | ~$54K | ~$648K | 20% of impressions × 15% CPM uplift |
| Make-Good Savings | ~$99K | ~$1.19M | 5%→2% of ALL $3.3M monthly revenue |
| After risk + adoption | ~$92K | ~$1.1M | moderate scenario multipliers |

The premium yield is defensible. The make-good savings are not — they're applied to all revenue, not just direct-sold.

---

## Proposed Fix: Three-Part Plan

### Part 1 — Engine Fix: Scope Make-Good Savings to Direct-Sold Inventory

**File: `src/constants/industryBenchmarks.ts`**

Add one constant to `MEDIA_PERFORMANCE_BENCHMARKS`:
```typescript
DIRECT_SOLD_INVENTORY_SHARE: 0.40,  // 40% of publisher revenue is direct-sold (industry standard for premium publishers)
```

**File: `src/utils/unifiedCalculationEngine.ts`** — `calculateMediaPerformance()` lines 643-645:

Change from:
```typescript
const baselineMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE;
const improvedMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE;
```

To:
```typescript
const directSoldRevenue = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.DIRECT_SOLD_INVENTORY_SHARE;
const baselineMakeGoods = directSoldRevenue * MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE;
const improvedMakeGoods = directSoldRevenue * MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE;
```

This brings the make-good savings from ~$99K/month to ~$39K/month for the full portfolio — a 60% reduction in that component, bringing total Media Performance from ~$1.1M to ~$650-700K annually (still the largest component, still compelling, but defensible).

### Part 2 — AddressabilityTab UI: Show the Breakdown, Not Just the Total

Currently the Addressability tab shows Media Performance as a single number. The fix is to expose the two sub-components with their logic visible:

**In `src/components/AddressabilityTab.tsx`**, replace the current Media Performance single-number card with a two-row breakdown:

```
┌─ Media Performance ──────────────────────────────────────────────┐
│  $XXX,XXX / year              Operational                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Premium Yield Uplift             $XXX,XXX/yr   │            │
│  │  20% of impressions sold as premium             │            │
│  │  15% CPM uplift vs standard inventory           │            │
│  │  Mechanism: Better audience data → higher       │            │
│  │  advertiser willingness to pay for premium PMP  │            │
│  └─────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │  Make-Good Reduction              $XXX,XXX/yr   │            │
│  │  Direct-sold inventory: 40% of total revenue    │            │
│  │  Make-good rate: 5% → 2% (3pp improvement)     │            │
│  │  Mechanism: Better conversion tracking means    │            │
│  │  campaigns deliver to goal, fewer compensations │            │
│  └─────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────┘
```

This converts a vague "$1.1M from operational stuff" into two specific, quantified mechanisms that a CFO can interrogate and agree or disagree with independently.

### Part 3 — SummaryTab: Fix the "How This Works" Description

**In `src/components/SummaryTab.tsx`**, the "How This Works" paragraph currently says:

> "Media Performance ($1.1M): Operational improvements from better data - fewer make-goods, higher yield."

Change this to a two-part explanation that matches the actual components:

> **"Media Performance ($XXX,XXX):** Two distinct revenue effects — (1) **Premium Yield**: Better audience data enables 15% CPM uplift on ~20% of inventory sold into premium or performance deals. (2) **Make-Good Reduction**: Direct-sold campaigns deliver more accurately against goals, reducing compensations from 5% to 2% of guaranteed revenue. Together, these generate $XXX,XXX in recovered value annually."

This description should be dynamic — it pulls the actual component values from `results.mediaPerformance` so it always reflects the current scenario.

---

## Files to Change

| File | Change | Why |
|------|--------|-----|
| `src/constants/industryBenchmarks.ts` | Add `DIRECT_SOLD_INVENTORY_SHARE: 0.40` | Scope make-goods to direct-sold only |
| `src/utils/unifiedCalculationEngine.ts` | Scope make-good calc to `directSoldRevenue` | Fix inflated savings number |
| `src/components/AddressabilityTab.tsx` | Expand Media Performance card to show Premium Yield + Make-Good separately with mechanism text | Make the number auditable |
| `src/components/SummaryTab.tsx` | Rewrite "How This Works" Media Performance description to be component-specific and dynamic | Make the narrative defensible |

---

## Expected Impact on Numbers

With the 40% direct-sold scoping fix:

| Scenario | Current Media Performance (12mo) | After Fix (12mo) |
|----------|----------------------------------|------------------|
| Conservative | ~$800K | ~$480K |
| Moderate | ~$1.1M | ~$660K |
| Optimistic | ~$1.3M | ~$780K |

The total deal value drops by roughly $400-440K in the moderate scenario. This is the right trade: a number that gets torn apart in a CFO meeting costs more than losing $400K from the headline. The remaining $660K is defensible line by line.

---

## What Stays the Same

- ID Infrastructure calculation: unchanged
- CAPI calculation: unchanged
- Safari addressability slider: unchanged
- CAPI sliders: unchanged
- Risk multiplier logic: unchanged
- PDF export config: unchanged
- All other tabs: unchanged

---

## On the Communication Side (No-Code Fix)

The label "Operational" in the card badge is also contributing to the problem — it sounds like cost savings, not revenue. Consider relabeling this card's badge from "Operational" to "Yield + Quality" which is more accurate (premium yield improvement + quality-driven make-good reduction). This is a one-word change in the AddressabilityTab component.
