# Project History

## Version Timeline

### v1.0 - Initial Calculator (Legacy)
**Components**: `IdentityHealthQuiz`, `RevenueCalculator`, `ResultsDashboard`

- Quiz-based approach asking generic questions
- Basic revenue calculator with manual inputs
- Simple results display
- PDF export functionality

**Limitations**:
- Too generic for enterprise sales
- Required too much user input
- Lacked credibility without industry benchmarks

---

### v2.0 - Unified Calculation Engine
**Components**: `UnifiedCalculationEngine`, `ScenarioModeler`

**Key Changes**:
- Consolidated all calculations into single engine
- Added scenario modeling (deployment type, scope)
- Introduced risk scenarios (conservative/moderate/optimistic)
- Transparent assumption documentation

**Impact**:
- More credible projections
- Auditable calculation methodology
- Better sales enablement

---

### v3.0 - Vox Media Customization
**Components**: `voxMediaDomains.ts`, `DomainSelector`

**Key Changes**:
- Pre-populated with 16 Vox Media properties
- Domain-specific audience profiles (tech savvy, Safari share)
- Quick-select presets (Top 3, News Network, Full Portfolio)
- Category-based organization

**Impact**:
- Zero data entry for Vox sales scenarios
- Domain-aware calculations
- Enterprise-ready presentation

---

### v3.1 - CAPI Refinement (Current)
**Date**: December 2024

**Key Changes**:
- Added CAPI line item share (not all spend uses CAPI)
- Separated CAPI-eligible spend from total campaign spend
- More granular CAPI benefit calculations
- Updated domain traffic data from Vox spreadsheet

**Domain Updates** (December 2024):
- Added: The Dodo, PopSugar, Strategist, Intelligencer, NYMag, NYMag App, Punch
- Removed: Polygon
- Updated: All pageview volumes from current Vox data

**Current Portfolio**: 16 domains, 238M monthly pageviews

---

## Data Update Log

| Date | Update | Source |
|------|--------|--------|
| 2024-12 | Vox domain volumes | Customer-provided spreadsheet |
| 2024-12 | Added 7 new domains | Customer-provided spreadsheet |
| 2024-12 | Removed Polygon | Not in current portfolio |

---

## Calculation Methodology Evolution

### Phase 1: Simple Multipliers
```
revenue_uplift = pageviews × cpm_improvement × adoption_rate
```

### Phase 2: Benefit Categories
```
total_uplift = id_infrastructure + capi_benefits + media_performance
```

### Phase 3: Risk-Adjusted with Business Readiness
```
adjusted_uplift = base_benefits × risk_multipliers × readiness_factors
```

---

## Known Legacy Code

The following components are from v1.0 and may be deprecated:

| Component | Status | Notes |
|-----------|--------|-------|
| `IdentityHealthQuiz.tsx` | Legacy | Quiz-based flow |
| `RevenueCalculator.tsx` | Legacy | Old calculator UI |
| `ResultsDashboard.tsx` | Legacy | Old results display |
| `calculationEngine.ts` | Legacy | Replaced by UnifiedCalculationEngine |
| `grading.ts` | Legacy | Quiz grading logic |
| `recommendations.ts` | Legacy | Quiz recommendations |

**Current Flow**: `ScenarioModeler` → `SimplifiedInputs` → `SimplifiedResults`
