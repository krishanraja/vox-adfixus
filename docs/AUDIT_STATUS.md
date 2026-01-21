# Audit Status

## Last Full Audit: January 2025

---

## Calculation Accuracy

| Component | Status | Notes |
|-----------|--------|-------|
| Domain Aggregation | ✅ Verified | Pageview × adsPerPage working correctly |
| Weighted Safari Share | ✅ Verified | Impression-weighted averaging correct |
| ID Infrastructure | ✅ Verified | Fixed 35% Safari, 65% baseline per Vox guidance |
| CPM Improvement | ✅ Verified | 25% uplift on newly addressable impressions |
| CDP Savings | ✅ Verified | Fixed $3,500/month per Vox guidance |
| CAPI Configuration | ✅ Verified | Dynamic calculation from Business Readiness |
| CAPI Service Fees | ✅ Verified | 12.5% of eligible spend |
| Media Performance | ✅ Verified | Premium share + make-good calculations |
| Risk Adjustments | ✅ Verified | Multipliers applied to all components |
| Business Readiness | ✅ Verified | Affects CPM, adoption, CAPI, and media |
| ROI Calculations | ✅ Verified | POC vs Full Contract split correct |
| Monthly Projections | ✅ Verified | Ramp-up factors applied per scenario |
| PDF Math Validation | ✅ Verified | Component sums validated before generation |

---

## Data Accuracy

### Domain Data (January 2025)

| Domain | Pageviews | Source | Status |
|--------|-----------|--------|--------|
| SB Nation | 102,866,201 | Briar's Report | ✅ Current |
| The Verge | 22,808,519 | Briar's Report | ✅ Current |
| The Dodo | 15,877,015 | Briar's Report | ✅ Current |
| NYMag (incl Strategist + Intelligencer) | 14,926,266 | Briar's Report | ✅ Consolidated |
| Vulture | 14,422,791 | Briar's Report | ✅ Current |
| Eater | 10,518,128 | Briar's Report | ✅ Current |
| The Cut | 9,110,699 | Briar's Report | ✅ Current |
| Vox | 6,015,197 | Briar's Report | ✅ Current |
| PopSugar | 3,269,639 | Briar's Report | ✅ Current |
| Thrillist | 1,323,468 | Briar's Report | ✅ Current |
| Punch | 926,506 | Briar's Report | ✅ Current |
| Curbed | 833,480 | Briar's Report | ✅ Current |
| Grub Street | 648,815 | Briar's Report | ✅ Current |

**Portfolio Totals**:
- 13 domains ✅
- ~203.5M monthly pageviews ✅
- 6 POC domains ✅

---

## Contract Pricing (January 2025)

| Item | Value | Status |
|------|-------|--------|
| POC Flat Fee | $15,000 (50% discount) | ✅ Current |
| POC Duration | 3 months | ✅ Current |
| Annual License | $239,140 | ✅ Current |
| Monthly Equivalent | $19,928 | ✅ Current |
| CAPI Service Fee | 12.5% | ✅ Current |
| Included Pageviews | 70M/month | ✅ Current |
| Overage Rate | $0.048/1K | ✅ Current |

---

## Industry Benchmarks

| Benchmark | Value | Source | Status |
|-----------|-------|--------|--------|
| Safari Traffic Share | 35% | Vox Guidance | ✅ Fixed |
| Baseline Addressability | 65% | Vox Guidance | ✅ Fixed |
| Safari Addressability Target | +20% | AdFixus POC KPI | ✅ Current |
| CPM Improvement Factor | 25% | Industry Research | ⚠️ Review Q2 |
| CAPI Baseline Match Rate | 30% | Meta Case Studies | ⚠️ Review Q2 |
| CAPI Improved Match Rate | 75% | AdFixus Data | ✅ Current |
| CDP Savings | $3,500/month | Vox Guidance | ✅ Fixed |
| ID Baseline Multiplier | 3.5 | AdFixus Analysis | ✅ Updated Jan '25 |
| ID Reduction | 69% | AdFixus Analysis | ✅ Updated Jan '25 |
| Cross-Domain Overlap | 17% | AdFixus Analysis | ✅ New Jan '25 |

---

## Ramp-Up Schedule

| Period | Factor | Status |
|--------|--------|--------|
| M1-3 (POC) | 40% | ✅ Updated Jan '25 |
| M4-6 (Q2) | 65-90%* | ✅ Updated Jan '25 |
| M7-9 (Q3) | 85-100%* | ✅ Current |
| M10-12 (Q4) | 100% | ✅ Current |

*Varies by risk scenario

---

## Security Audit

| Item | Status | Notes |
|------|--------|-------|
| No PII stored client-side | ✅ Pass | Lead data sent to email, not stored |
| Password protection | ✅ Pass | Environment variable |
| API keys in secrets | ✅ Pass | Not exposed in client bundle |
| XSS protection | ✅ Pass | React escaping |
| HTTPS only | ✅ Pass | Lovable hosting enforces HTTPS |
| Input validation | ⚠️ Minimal | Slider constraints only |

---

## Code Quality

| Area | Status | Notes |
|------|--------|-------|
| TypeScript coverage | ✅ 100% | All files typed |
| Component isolation | ✅ Good | Clear boundaries |
| State management | ✅ Clean | Single hook pattern |
| Calculation purity | ✅ Good | No side effects in engine |
| Error handling | ⚠️ Minimal | Could add more try/catch |
| Test coverage | ❌ None | Needs unit tests |
| Documentation | ✅ Complete | Full docs folder |

---

## PDF Quality

| Item | Status | Notes |
|------|--------|-------|
| Math validation | ✅ Implemented | Validates before generation |
| Logo rendering | ✅ Working | Dual logos (AdFixus + Vox) |
| First page ROI | ✅ Added | 3-column layout with ROI multiple |
| Annual formatting | ✅ Fixed | One decimal place for millions |
| CAPI table order | ✅ Fixed | POC before Year 1 |
| Disclaimer box | ✅ Present | Every page |
| Page numbering | ✅ Working | Footer includes page X of Y |

---

## Known Issues

| ID | Severity | Description | Status |
|----|----------|-------------|--------|
| AUD-001 | Low | No unit test coverage | Open |
| AUD-002 | Low | Error boundaries missing | Open |
| AUD-003 | Info | Some benchmark sources need refresh | Scheduled Q2 |

---

## Scheduled Reviews

| Item | Frequency | Next Review | Owner |
|------|-----------|-------------|-------|
| Domain traffic data | Monthly | Feb 2025 | Sales |
| Industry benchmarks | Quarterly | Apr 2025 | Product |
| Contract pricing | On change | — | Sales |
| Risk scenario defaults | Semi-annual | Jul 2025 | Product |
| Security scan | Monthly | Feb 2025 | Engineering |
| PDF output review | Quarterly | Apr 2025 | Sales |

---

## Validation Checklist (Pre-Release)

Before any deployment:

- [ ] All 13 domains appear in selector
- [ ] Full Portfolio shows "13 domains selected"
- [ ] POC preset selects 6 domains
- [ ] Calculations complete without console errors
- [ ] Risk scenario changes recalculate correctly
- [ ] Business Readiness sliders affect results
- [ ] PDF generates without errors
- [ ] PDF first page shows 3 columns (Monthly, Annual, ROI)
- [ ] CAPI table shows POC before Year 1
- [ ] Email sends successfully (if Supabase connected)
- [ ] Mobile view is usable
- [ ] Dark mode renders correctly
