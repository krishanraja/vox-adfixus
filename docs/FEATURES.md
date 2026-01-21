# Features

## Current Features

### 1. Domain Portfolio Selection

**Location**: `src/components/DomainSelector.tsx`

| Feature | Description |
|---------|-------------|
| Multi-select | Choose any combination of 13 Vox Media properties |
| Quick presets | "POC Domains", "Full Portfolio" one-click selection |
| Pageview overrides | Override default pageview data per-domain |
| Safari share overrides | Customize iOS/Safari audience percentage per-domain |
| Category grouping | Domains organized by: News & Tech, Entertainment, Sports, Lifestyle |

**Domain Portfolio (203.5M+ monthly pageviews)**:

| Domain | Monthly Pageviews | Category |
|--------|-------------------|----------|
| SB Nation | 129M | Sports |
| The Verge | 19M | News & Tech |
| The Dodo | 19M | Entertainment |
| Eater | 18M | Lifestyle |
| Vox | 10M | News & Tech |
| Vulture | 10M | Entertainment |
| NYMag (incl Strategist + Intelligencer) | 14.9M | Lifestyle |
| The Cut | 7M | Lifestyle |
| PopSugar | 5M | Lifestyle |
| Thrillist | 2M | Lifestyle |
| Curbed | 1M | Real Estate |
| Punch | 607K | Lifestyle |
| Grub Street | 487K | Lifestyle |

**POC Domains** (5 properties, ~61M pageviews):
- The Verge, Vox, NYMag (incl Strategist + Intelligencer), The Cut, Vulture

---

### 2. CPM Configuration

**Location**: `src/components/SimplifiedInputs.tsx`

| Input | Range | Default | Description |
|-------|-------|---------|-------------|
| Display CPM | $1.00 - $15.00 | $6.00 | Average CPM for display inventory |
| Video CPM | $5.00 - $30.00 | $18.00 | Average CPM for video inventory |

- Real-time recalculation on slider adjustment
- Tooltips explaining CPM impact on projections

---

### 3. Risk Scenario Modeling

**Location**: `src/components/ScenarioToggle.tsx`, `src/constants/riskScenarios.ts`

Three preset scenarios affecting all projections:

| Scenario | Adoption Rate | CAPI Deployment | Premium Share | Use Case |
|----------|---------------|-----------------|---------------|----------|
| Conservative | 70% | 50% | 20% | Worst-case planning |
| Moderate | 85% | 75% | 30% | Balanced projection |
| Optimistic | 95% | 90% | 40% | Best-case potential |

Each scenario adjusts:
- ID infrastructure uplift multipliers
- CAPI campaign deployment rates
- Media performance premium inventory share
- Sales ramp-up velocity

---

### 4. Results Dashboard

**Location**: `src/components/SimplifiedResults.tsx`

**Summary Cards**:
- Monthly Incremental Revenue
- Annual Incremental Revenue
- 3-Year Revenue Opportunity
- ROI Multiple (POC and Full Contract phases)

**12-Month Projection Chart**:
- Revenue uplift curve with realistic ramp-up (40% M1-3, 80% M4-6, 90% M7-9, 100% M10-12)
- ROI multiple overlay showing payback progression
- POC → Full Contract transition marker at Month 3

**Expandable Detail Sections**:
- ID Infrastructure breakdown
- CAPI Capabilities breakdown
- Media Performance breakdown
- Assumption adjustment sliders
- Business Readiness factors

---

### 5. Assumption Overrides

**Location**: `src/components/calculator/AssumptionSlider.tsx`

User-adjustable assumptions per category:

**ID Infrastructure**:
| Assumption | Range | Default | Description |
|------------|-------|---------|-------------|
| Safari baseline addressability | 40-70% | 55% | Current Safari/Firefox addressability |
| Safari with durable ID | 70-95% | 85% | Post-AdFixus addressability |
| CPM uplift factor | 10-40% | 22% | Premium for addressable inventory |
| CDP cost reduction | 5-25% | 15% | Data platform savings |

**CAPI**:
| Assumption | Range | Default | Description |
|------------|-------|---------|-------------|
| Match rate improvement | 60-90% | 75% | Conversion attribution accuracy |
| Service fee percentage | 8-18% | 12.5% | AdFixus CAPI revenue share |

**Media Performance**:
| Assumption | Range | Default | Description |
|------------|-------|---------|-------------|
| Premium inventory share | 15-50% | 30% | % of inventory qualifying for premium |
| Premium yield uplift | 10-40% | 25% | CPM increase for premium inventory |

**Business Readiness** (affects CAPI volume dynamically):
| Factor | Range | Default | Description |
|--------|-------|---------|-------------|
| Sales readiness | 50-100% | 75% | Team preparation level |
| Training gaps impact | 50-100% | 70% | Knowledge transfer effectiveness |
| Advertiser buy-in | 50-100% | 80% | Client adoption likelihood |
| Organizational ownership | 50-100% | 75% | Internal champion strength |
| Technical deployment (months) | 3-18 | 6 | Implementation timeline |
| Integration delays impact | 50-100% | 70% | Technical risk factor |
| Resource availability | 50-100% | 75% | Team bandwidth |
| Market conditions | 50-100% | 80% | External market factors |

---

### 6. CAPI Campaign Configuration

**Location**: `src/components/SimplifiedInputs.tsx`

| Input | Range | Default | Description |
|-------|-------|---------|-------------|
| Campaigns/month | 1-50 | 10 | Number of CAPI-enabled campaigns |
| Avg campaign spend | $10K-$500K | $100K | Average spend per campaign |
| CAPI line item share | 0-100% | 60% | % of spend running CAPI tracking |

**Dynamic Calculation**:
- POC campaigns = Base × Business Readiness Score × 0.4
- Year 1 campaigns = Base × Business Readiness Score × 1.0
- Revenue = Campaigns × Spend × Line Item Share × Service Fee

---

### 7. PDF Report Generation

**Location**: `src/utils/pdfGenerator.ts`

**21-page branded proposal** including:

| Section | Content |
|---------|---------|
| Cover Page | AdFixus + Vox Media co-branding |
| Executive Summary | Headline metrics, ROI multiple, scenario context |
| Domain Portfolio | Complete property breakdown with pageviews |
| ID Infrastructure | Safari addressability analysis, CPM uplift modeling |
| CAPI Capabilities | Campaign projection, match rate improvements |
| Media Performance | Premium inventory analysis, yield optimization |
| Implementation Timeline | POC phases, full deployment milestones |
| Investment Analysis | Pricing breakdown, ROI timeline |
| Appendix | Full assumptions documentation |

**Features**:
- Client-side generation (pdfmake)
- No server dependency
- Automatic download on completion
- All assumptions documented for audit trail

---

### 8. Lead Capture

**Location**: `src/components/LeadCaptureModal.tsx`

Pre-download form capturing:
- Name (required)
- Email (required, validated)
- Company (required)
- Role (required)

Data stored locally and included in PDF metadata.

---

### 9. Authentication

**Location**: `src/contexts/AuthContext.tsx`, `src/pages/Login.tsx`

- Simple password-based access control
- Environment variable configuration (`VITE_APP_PASSWORD`)
- Session persistence via localStorage
- Protected route wrapper component

---

### 10. Navigation & UX

**Location**: `src/components/Navigation.tsx`

| Feature | Description |
|---------|-------------|
| Step indicator | Visual progress through Hero → Calculator → Results |
| Reset button | Return to initial state |
| Logout button | Clear session and redirect |
| Book a Call CTA | External link to scheduling |
| AdFixus branding | Consistent logo placement |

---

## Calculation Engine

**Location**: `src/utils/unifiedCalculationEngine.ts`

The unified engine handles all financial projections:

1. **Input Aggregation**: Combines domain selections, CPM rates, CAPI configuration
2. **Risk Application**: Applies scenario-specific multipliers
3. **Component Calculation**: Computes ID, CAPI, and Media uplift independently
4. **Readiness Adjustment**: Modifies CAPI volume based on business readiness
5. **ROI Analysis**: Calculates payback periods and investment multiples
6. **Projection Generation**: Creates 12-month timeline with ramp-up curves

---

## Planned Features

### Phase 2
- [ ] Multi-currency support (GBP, EUR)
- [ ] Comparison mode (side-by-side scenarios)
- [ ] Saved scenarios (persistent)
- [ ] Email delivery of PDF reports

### Phase 3
- [ ] Custom domain entry (non-Vox publishers)
- [ ] Integration with AdFixus analytics dashboard
- [ ] Automated post-deployment validation
- [ ] API for programmatic access
