# Data Sources

## Domain Data

### Current Source

**Briar's Internal Reporting (January 2025)**

All domain data comes from Vox Media internal reporting provided by Briar.

| Domain | ID | Monthly Pageviews | Ads/Page | Safari % | In POC |
|--------|-----|-------------------|----------|----------|--------|
| SB Nation | sbnation | 102,866,201 | 2.5 | 32% | No |
| The Verge | the-verge | 22,808,519 | 2.0 | 42% | ✓ |
| The Dodo | the-dodo | 15,877,015 | 2.5 | 45% | No |
| NYMag (incl Strategist + Intelligencer) | nymag | 14,926,266 | 1.5 | 40% | ✓ |
| Vulture | vulture | 14,422,791 | 1.5 | 37% | ✓ |
| Eater | eater | 10,518,128 | 2.0 | 40% | No |
| The Cut | the-cut | 9,110,699 | 1.5 | 41% | ✓ |
| Vox | vox | 6,015,197 | 2.0 | 38% | ✓ |
| PopSugar | popsugar | 3,269,639 | 2.5 | 44% | No |
| Thrillist | thrillist | 1,323,468 | 2.5 | 34% | No |
| Punch | punch | 926,506 | 1.5 | 38% | No |
| Curbed | curbed | 833,480 | 2.0 | 38% | No |
| Grub Street | grub-street | 648,815 | 1.5 | 39% | ✓ |

**Portfolio Totals**:
- 13 domains
- ~203.5M monthly pageviews
- ~441M monthly impressions

### Domain Consolidations

**NYMag (incl Strategist + Intelligencer)** combines:
- NYMag: 4,362,773 pageviews
- Strategist: 6,566,186 pageviews
- Intelligencer: 3,997,307 pageviews
- **Combined**: 14,926,266 pageviews

Weighted averages applied for display/video split, techSavvy, and Safari share.

---

## Contract Pricing

**Source**: AdFixus Proposal (January 2025)

| Constant | Value | Notes |
|----------|-------|-------|
| POC Flat Fee | $15,000 | 50% discount (was $30K) |
| POC Duration | 3 months | |
| POC Monthly | $5,000 | |
| Annual License | $239,140 | 23% reduction from $312K |
| Full Monthly | $19,928 | |
| Included Pageviews | 70M/month | |
| Overage Rate | $0.048/1K | |
| CAPI Service Fee | 12.5% | |
| Connection Fee | $287/month | Per active connection |
| Stream Event Fee | $0.64/1K | |
| Additional Domain | $204/month | |
| Annual Increase | 8% | Year-over-year |

**Location**: `src/constants/voxMediaDomains.ts` → `CONTRACT_PRICING`

---

## Industry Benchmarks

**Source**: `src/constants/industryBenchmarks.ts`

### CAPI Benchmarks

| Benchmark | Value | Source |
|-----------|-------|--------|
| Baseline Match Rate | 30% | Meta/Google case studies |
| Improved Match Rate | 75% | AdFixus platform data |
| CAPI Service Fee | 12.5% | AdFixus pricing |
| Baseline Campaign Adoption | 40% | Industry research |
| Improved Campaign Adoption | 85% | AdFixus platform data |
| Conversion Multiplier | 15% | Meta CAPI studies |
| CTR Improvement | 12% | Meta CAPI studies |

### Addressability Benchmarks

| Benchmark | Value | Source |
|-----------|-------|--------|
| Safari Traffic Share | 35% | Fixed (Vox guidance) |
| Baseline Total Addressability | 65% | Fixed (Vox guidance) |
| Current Safari Addressability | 0% | ITP blocks identity |
| Target Safari Addressability | 20% | AdFixus POC KPI |
| CPM Improvement Factor | 25% | Industry research |

### Operational Benchmarks

| Benchmark | Value | Source |
|-----------|-------|--------|
| Baseline ID Multiplier | 3.5 | AdFixus analysis |
| Improved ID Multiplier | 1.08 | AdFixus platform data |
| ID Reduction Percentage | 69% | Calculated |
| CDP Monthly Savings | $3,500 | Fixed (Vox guidance) |
| Cross-Domain Overlap | 17% | AdFixus analysis |
| Labor Hours Saved | 20/month | Conservative estimate |

### Media Performance Benchmarks

| Benchmark | Value | Source |
|-----------|-------|--------|
| Baseline ROAS | 3.5 | Industry average |
| Improved ROAS | 4.5 | AdFixus platform data |
| Baseline Make-Good Rate | 8% | Industry average |
| Improved Make-Good Rate | 3% | AdFixus platform data |
| Premium Inventory Yield | 25% | Industry research |

### Ramp-Up Schedule (January 2025)

| Period | Factor | Rationale |
|--------|--------|-----------|
| Months 1-3 (POC) | 40% | Early adopter sellers |
| Months 4-6 (Q2) | 65-90%* | Full sales team onboarding |
| Months 7-9 (Q3) | 85-100%* | Near-full capacity |
| Months 10-12 (Q4) | 100% | Full capacity |

*Varies by risk scenario

---

## Risk Scenario Multipliers

**Source**: `src/constants/riskScenarios.ts`

| Factor | Conservative | Moderate | Optimistic |
|--------|--------------|----------|------------|
| adoptionRate | 0.70 | 0.75 | 0.92 |
| cpmUpliftRealization | 0.70 | 0.85 | 1.00 |
| premiumInventoryShare | 0.20 | 0.30 | 0.35 |
| capiDeploymentRate | 0.60 | 0.80 | 0.95 |
| addressabilityEfficiency | 0.80 | 0.90 | 1.00 |
| cdpSavingsRealization | 0.80 | 0.90 | 1.00 |
| salesEffectiveness | 0.70 | 0.85 | 1.00 |
| rampUpMonths | 12 | 9 | 6 |

---

## Business Readiness Presets

**Source**: `src/constants/readinessFactors.ts`

| Factor | Conservative | Normal | Optimistic |
|--------|--------------|--------|------------|
| salesReadiness | 0.60 | 0.75 | 0.90 |
| technicalDeploymentMonths | 12 | 6 | 3 |
| advertiserBuyIn | 0.65 | 0.80 | 0.95 |
| organizationalOwnership | 0.65 | 0.80 | 0.95 |
| marketConditions | 0.75 | 0.85 | 0.95 |
| trainingGaps | 0.60 | 0.75 | 0.90 |
| integrationDelays | 0.65 | 0.80 | 0.95 |
| resourceAvailability | 0.65 | 0.80 | 0.95 |

---

## Update Procedures

### Updating Domain Data

**File**: `src/constants/voxMediaDomains.ts`

1. Update `monthlyPageviews` with new numbers
2. Verify `adsPerPage` is still accurate
3. Check `safariShare` against latest analytics
4. Update comments with data source and date
5. Recalculate `PORTFOLIO_TOTALS` (automatic)

```typescript
// Example update
{
  id: 'the-verge',
  name: 'The Verge',
  monthlyPageviews: 22808519, // Updated Jan 2025 - Briar's report
  // ...
}
```

### Updating Benchmarks

**File**: `src/constants/industryBenchmarks.ts`

1. Identify benchmark to update
2. Document source in comments
3. Update value
4. Test calculations still produce reasonable results
5. Update `docs/DATA_SOURCES.md`

### Adding New Domains

1. Add entry to `VOX_MEDIA_DOMAINS` array in `voxMediaDomains.ts`
2. Include all required fields:
   - `id` (unique slug)
   - `name` (display name)
   - `monthlyPageviews`
   - `displayVideoSplit`
   - `category`
   - `adsPerPage`
   - `audienceProfile` (techSavvy, safariShare)
   - `inPoc` (optional)
3. Update `DOMAIN_PRESETS` if needed
4. Test domain appears in selector

### Removing Domains

1. Remove entry from `VOX_MEDIA_DOMAINS` array
2. Remove from any `DOMAIN_PRESETS` arrays
3. Clear localStorage in browser (domain selections persist)

---

## Data Validation Checklist

Before deploying data updates:

- [ ] Total pageviews match source document
- [ ] Domain count is accurate (currently 13)
- [ ] POC domain count is accurate (currently 6)
- [ ] Impressions calculation works (pageviews × adsPerPage)
- [ ] Safari shares sum to reasonable weighted average
- [ ] PDF generates without math validation errors
- [ ] ROI multiples are within expected range (2-10x)

---

## Scheduled Reviews

| Item | Frequency | Next Review | Owner |
|------|-----------|-------------|-------|
| Domain traffic data | Monthly | Feb 2025 | Sales |
| Industry benchmarks | Quarterly | Apr 2025 | Product |
| Contract pricing | On change | — | Sales |
| Risk scenario defaults | Semi-annual | Jul 2025 | Product |
