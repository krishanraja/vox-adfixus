# Formulas & Calculation Methodology

## Overview

All calculations flow through `UnifiedCalculationEngine.ts`. This document details every formula with worked examples.

---

## 1. Domain Aggregation

**Source**: `domainAggregation.ts`

### Total Monthly Impressions

```
totalMonthlyImpressions = Σ (domain.monthlyPageviews × domain.adsPerPage)
```

**Example** (3 domains):
```
The Verge:  22,808,519 × 2.0 = 45,617,038 impressions
Vox:         6,015,197 × 2.0 = 12,030,394 impressions
Grub Street:   648,815 × 1.5 =    973,223 impressions
─────────────────────────────────────────────────────
Total:                         58,620,655 impressions
```

### Weighted Safari Share

```
weightedSafariShare = Σ (domain.safariShare × domain.impressions) / totalImpressions
```

**Example**:
```
The Verge:  0.42 × 45,617,038 = 19,159,156
Vox:        0.38 × 12,030,394 =  4,571,550
Grub Street: 0.39 ×   973,223 =    379,557
─────────────────────────────────────────
Total weighted: 24,110,263 / 58,620,655 = 0.411 (41.1%)
```

---

## 2. ID Infrastructure

**Source**: `calculateIdInfrastructure()` in UnifiedCalculationEngine.ts

### Addressability Improvement

Fixed values per Vox guidance:
- **Safari Share**: 35% (fixed, not domain-weighted)
- **Baseline Addressability**: 65%
- **Safari Baseline**: 0% (ITP blocks Safari identity)
- **Safari Target**: +20% improvement

```
addressabilityGain = SAFARI_SHARE × SAFARI_IMPROVEMENT
                   = 0.35 × 0.20
                   = 0.07 (7 percentage points)

newTotalAddressability = 0.65 + 0.07 = 0.72 (72%)
```

### Newly Addressable Impressions

```
safariImpressions = totalImpressions × 0.35
newlyAddressable = safariImpressions × 0.20
```

**Example** (58.6M impressions):
```
safariImpressions = 58,620,655 × 0.35 = 20,517,229
newlyAddressable = 20,517,229 × 0.20 = 4,103,446
```

### CPM Improvement Revenue

```
cpmUpliftFactor = 0.25 (25% improvement on addressable inventory)
improvedDisplayCPM = displayCPM × 1.25
improvedVideoCPM = videoCPM × 1.25

displayUplift = (newlyAddressableDisplay / 1000) × improvedDisplayCPM
videoUplift = (newlyAddressableVideo / 1000) × improvedVideoCPM
```

**Example** ($4.50 display, $15.00 video, 80/20 split):
```
newlyAddressableDisplay = 4,103,446 × 0.80 = 3,282,757
newlyAddressableVideo = 4,103,446 × 0.20 = 820,689

displayUplift = (3,282,757 / 1000) × $5.625 = $18,465
videoUplift = (820,689 / 1000) × $18.75 = $15,388
cpmImprovement = $33,853
```

### CDP Savings

Fixed at **$3,500/month** per Vox guidance (covers ID deduplication benefits).

### Total ID Infrastructure Monthly Uplift

```
idInfrastructureUplift = addressabilityRevenue + cdpSavings
                       = $33,853 + $3,500
                       = $37,353
```

---

## 3. CAPI Capabilities

**Source**: `calculateCapiCapabilities()` in UnifiedCalculationEngine.ts

### CAPI Configuration (Dynamic)

CAPI campaigns are calculated from Business Readiness factors:

```
yearlyCampaigns = BASE_CAMPAIGNS × salesReadiness × advertiserBuyIn × marketConditions
                = 50 × 0.75 × 0.80 × 0.85
                = 25.5 campaigns

avgCampaignSpend = BASE_SPEND × salesReadiness × marketConditions
                 = $100,000 × 0.75 × 0.85
                 = $63,750
```

### CAPI Match Rate Improvement

```
baselineMatchRate = 0.30 (30%)
improvedMatchRate = 0.75 (75%)
matchRateImprovement = 0.75 - 0.30 = 0.45 (45 percentage point improvement)
```

### Conversion Tracking Revenue

```
capiEligibleSpend = yearlyCampaigns × avgCampaignSpend × capiLineItemShare
                  = 25 × $63,750 × 0.60
                  = $956,250

conversionMultiplier = 0.15 (15% spend increase from better tracking)
conversionRevenue = capiEligibleSpend × conversionMultiplier
                  = $956,250 × 0.15
                  = $143,438/year = $11,953/month
```

### CAPI Service Fees

```
serviceFeeRate = 0.125 (12.5%)
monthlyServiceFees = (capiEligibleSpend / 12) × serviceFeeRate
                   = ($956,250 / 12) × 0.125
                   = $9,961/month
```

### Total CAPI Monthly Uplift

```
capiUplift = conversionRevenue + serviceFees
           = $11,953 + $9,961
           = $21,914
```

---

## 4. Media Performance

**Source**: `calculateMediaPerformance()` in UnifiedCalculationEngine.ts

### Premium Inventory Yield

```
premiumInventoryShare = 0.30 (30% of inventory qualifies as premium)
premiumYieldUplift = 0.25 (25% CPM increase on premium inventory)

premiumImpressions = totalImpressions × premiumInventoryShare
premiumRevenue = (premiumImpressions / 1000) × avgCPM × premiumYieldUplift
```

**Example**:
```
premiumImpressions = 58,620,655 × 0.30 = 17,586,197
avgCPM = (displayCPM × 0.80) + (videoCPM × 0.20) = $6.60
premiumRevenue = (17,586,197 / 1000) × $6.60 × 0.25 = $29,017
```

### Make-Good Reduction

```
baselineMakeGoodRate = 0.08 (8% of campaigns require make-goods)
improvedMakeGoodRate = 0.03 (3% with better targeting)
makeGoodSavings = currentMonthlyRevenue × (0.08 - 0.03)
                = $1,000,000 × 0.05
                = $50,000/month
```

### Total Media Performance Uplift

```
mediaPerformanceUplift = premiumRevenue + makeGoodSavings
                       = $29,017 + $50,000
                       = $79,017
```

---

## 5. Risk Adjustments

**Source**: `RISK_SCENARIOS` in riskScenarios.ts

All benefits are multiplied by risk factors:

| Factor | Conservative | Moderate | Optimistic |
|--------|--------------|----------|------------|
| adoptionRate | 0.70 | 0.75 | 0.92 |
| cpmUpliftRealization | 0.70 | 0.85 | 1.00 |
| premiumInventoryShare | 0.20 | 0.30 | 0.35 |
| capiDeploymentRate | 0.60 | 0.80 | 0.95 |
| addressabilityEfficiency | 0.80 | 0.90 | 1.00 |
| cdpSavingsRealization | 0.80 | 0.90 | 1.00 |
| salesEffectiveness | 0.70 | 0.85 | 1.00 |

### Example: Moderate Scenario

```
adjustedIdInfra = $37,353 × 0.90 × 0.85 × 0.75 = $21,440
adjustedCAPI = $21,914 × 0.80 × 0.85 × 0.75 = $11,184
adjustedMedia = $79,017 × (0.30/0.30) × 0.85 × 0.75 = $50,374

totalAdjustedMonthly = $21,440 + $11,184 + $50,374 = $82,998
```

---

## 6. Business Readiness Multipliers

**Source**: Lines 47-120 in UnifiedCalculationEngine.ts

Business Readiness sliders apply additional multipliers:

### Sales Readiness
```
salesCpmFactor = 0.4 + (salesReadiness × 0.8)
// salesReadiness = 0.5 → factor = 0.8
// salesReadiness = 0.9 → factor = 1.12

risk.cpmUpliftRealization *= salesCpmFactor
risk.premiumInventoryShare *= salesCpmFactor
risk.salesEffectiveness *= salesReadiness
```

### Training Gaps
```
trainingAdoptionFactor = 0.5 + (trainingGaps × 0.6)
// trainingGaps = 0.5 → factor = 0.8
// trainingGaps = 0.9 → factor = 1.04

risk.adoptionRate *= trainingAdoptionFactor
risk.addressabilityEfficiency *= trainingAdoptionFactor
```

### Advertiser Buy-In
```
buyInCpmFactor = 0.5 + (advertiserBuyIn × 0.7)
// advertiserBuyIn = 0.5 → factor = 0.85
// advertiserBuyIn = 0.9 → factor = 1.13

risk.cpmUpliftRealization *= buyInCpmFactor
risk.capiDeploymentRate *= advertiserBuyIn
```

---

## 7. ROI Calculations

**Source**: `calculateROI()` in UnifiedCalculationEngine.ts

### POC Phase (Months 1-3)

```
pocPlatformFee = $5,000/month
pocTotalCost = pocPlatformFee + monthlyCapiServiceFees
pocNetROI = totalMonthlyUplift - pocTotalCost
pocROIMultiple = totalMonthlyUplift / pocTotalCost
```

### Full Contract (Month 4+)

```
fullContractFee = $19,928/month
fullTotalCost = fullContractFee + monthlyCapiServiceFees
fullNetROI = totalMonthlyUplift - fullTotalCost
fullROIMultiple = totalMonthlyUplift / fullTotalCost
```

**Example** ($82,998 monthly uplift, $9,961 CAPI fees):

```
POC:
  cost = $5,000 + $9,961 = $14,961
  netROI = $82,998 - $14,961 = $68,037
  multiple = $82,998 / $14,961 = 5.5x

Full Contract:
  cost = $19,928 + $9,961 = $29,889
  netROI = $82,998 - $29,889 = $53,109
  multiple = $82,998 / $29,889 = 2.8x
```

---

## 8. Monthly Projection

**Source**: `generateMonthlyProjection()` in UnifiedCalculationEngine.ts

Ramp-up schedule (January 2025):

| Period | Conservative | Moderate | Optimistic |
|--------|--------------|----------|------------|
| M1-3 (POC) | 40% | 40% | 40% |
| M4-6 (Q2) | 65% | 80% | 90% |
| M7-9 (Q3) | 85% | 95% | 100% |
| M10-12 (Q4) | 100% | 100% | 100% |

```
monthlyUplift[n] = fullMonthlyUplift × rampUpFactor[n]
monthlyROI[n] = monthlyUplift[n] / monthlyCost[n]
```

---

## 9. Validation Checkpoints

The PDF generator validates math before creation:

```typescript
// Component sum must equal total
const calculatedTotal = idMonthly + capiMonthly + perfMonthly;
const statedTotal = results.totals.totalMonthlyUplift;
if (Math.abs(calculatedTotal - statedTotal) > 0.01) {
  throw new Error('Math validation failed');
}

// Annual must equal monthly × 12
const calculatedAnnual = statedTotal * 12;
const statedAnnual = results.totals.totalAnnualUplift;
if (Math.abs(calculatedAnnual - statedAnnual) > 0.01) {
  throw new Error('Annual validation failed');
}
```

---

## Summary: Full Calculation Flow

```
1. Aggregate domain inputs (pageviews, impressions, Safari share)
         ↓
2. Calculate base benefits:
   - ID Infrastructure (addressability + CDP savings)
   - CAPI (conversion + service fees)
   - Media Performance (premium + make-goods)
         ↓
3. Apply risk scenario multipliers
         ↓
4. Apply Business Readiness adjustments
         ↓
5. Calculate pricing (POC + Full Contract)
         ↓
6. Calculate ROI (net ROI, multiples, payback)
         ↓
7. Generate 12-month projection with ramp-up
         ↓
8. Validate all math before PDF generation
```
