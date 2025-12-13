# Features

## Current Features

### 1. Domain Portfolio Selection

**Location**: `src/components/DomainSelector.tsx`

| Feature | Description |
|---------|-------------|
| Multi-select | Choose any combination of 16 Vox Media properties |
| Quick presets | "Top 3", "News Network", "Full Portfolio" one-click selection |
| Pageview overrides | Override default pageview data per-domain |
| Safari share overrides | Customize iOS/Safari audience percentage per-domain |
| Category grouping | Domains organized by: News & Tech, Entertainment, Sports, Lifestyle, Real Estate |

**Domain Portfolio (238M+ monthly pageviews)**:
- SB Nation (129M), The Verge (19M), The Dodo (19M)
- Eater (18M), Vox (10M), Vulture (10M)
- NYMag (7M), The Cut (7M), Strategist (5M)
- PopSugar (5M), Intelligencer (4M), Thrillist (2M)
- Curbed (1M), NYMag App (761K), Punch (607K), Grub Street (487K)

### 2. CPM Configuration

**Location**: `src/components/SimplifiedInputs.tsx`

- Display CPM slider: $1.00 - $15.00
- Video CPM slider: $5.00 - $30.00
- Real-time recalculation on adjustment

### 3. CAPI Campaign Configuration

**Location**: `src/components/SimplifiedInputs.tsx`

| Input | Range | Default | Description |
|-------|-------|---------|-------------|
| Campaigns/month | 1-50 | 10 | Number of CAPI-enabled campaigns |
| Avg campaign spend | $10K-$500K | $100K | Average spend per campaign |
| CAPI line item share | 0-100% | 60% | % of spend running CAPI tracking |

### 4. Risk Scenario Modeling

**Location**: `src/constants/riskScenarios.ts`

Three preset scenarios with adjustable assumptions:

| Scenario | Adoption Rate | CAPI Deployment | Premium Share |
|----------|---------------|-----------------|---------------|
| Conservative | 70% | 50% | 20% |
| Moderate | 85% | 75% | 30% |
| Optimistic | 95% | 90% | 40% |

### 5. Results Dashboard

**Location**: `src/components/SimplifiedResults.tsx`

**Summary Cards**:
- Monthly / Annual / 3-Year revenue uplift
- Revenue source breakdown (ID Infrastructure, CAPI, Media Performance)
- ROI multiples (POC phase, Full contract)

**12-Month Projection Chart**:
- Revenue uplift curve with ramp-up
- ROI multiple overlay
- POC → Full Contract transition marker

**Expandable Detail Sections**:
- ID Infrastructure breakdown
- CAPI Capabilities breakdown
- Media Performance breakdown
- Assumption adjustment sliders
- Business Readiness factors

### 6. Assumption Overrides

**Location**: `src/components/calculator/AssumptionSlider.tsx`

User-adjustable assumptions per category:

**ID Infrastructure**:
- Safari baseline addressability (40-70%)
- Safari with durable ID (70-95%)
- CPM uplift factor (10-40%)
- CDP cost reduction (5-25%)

**CAPI**:
- Match rate improvement (60-90%)
- Service fee percentage (8-18%)

**Media Performance**:
- Premium inventory share (15-50%)
- Premium yield uplift (10-40%)

**Business Readiness**:
- Sales readiness (50-100%)
- Training gaps impact (50-100%)
- Advertiser buy-in (50-100%)
- Organizational ownership (50-100%)
- Technical deployment months (3-18)
- Integration delays impact (50-100%)
- Resource availability (50-100%)
- Market conditions (50-100%)

### 7. PDF Report Generation

**Location**: `src/utils/pdfGenerator.ts`

Branded proposal PDF including:
- AdFixus logo and branding
- Executive summary with headline numbers
- Domain-by-domain breakdown
- Full assumption documentation
- ROI analysis with payback periods
- Contact information

### 8. Lead Capture

**Location**: `src/components/LeadCaptureModal.tsx`

Pre-download form capturing:
- Name
- Email
- Company
- Role

---

## Planned Features

### Phase 2
- [ ] Multi-currency support (GBP, EUR)
- [ ] Comparison mode (side-by-side scenarios)
- [ ] Historical data import
- [ ] Saved scenarios (persistent)

### Phase 3
- [ ] Custom domain entry (non-Vox publishers)
- [ ] Integration with AdFixus analytics
- [ ] Automated post-deployment validation
