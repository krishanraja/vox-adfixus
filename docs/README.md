# AdFixus ROI Simulator — Vox Media Edition

## Quick Navigation

| Document | Description |
|----------|-------------|
| [PURPOSE](./PURPOSE.md) | Tool objectives, target audience, value propositions |
| [ARCHITECTURE](./ARCHITECTURE.md) | System design, data flow, calculation engine |
| [FEATURES](./FEATURES.md) | Complete feature inventory and user flows |
| [FORMULAS](./FORMULAS.md) | All calculation methodologies with examples |
| [DESIGN_SYSTEM](./DESIGN_SYSTEM.md) | Colors, typography, component patterns |
| [DECISIONS_LOG](./DECISIONS_LOG.md) | Architectural decisions with rationale |
| [DATA_SOURCES](./DATA_SOURCES.md) | Domain data, benchmarks, and update procedures |
| [COMMON_ISSUES](./COMMON_ISSUES.md) | Troubleshooting and debugging guide |

---

## Overview

The **AdFixus ROI Simulator** is a sales enablement tool built specifically for the Vox Media partnership opportunity. It models the financial return from implementing AdFixus identity resolution technology across Vox Media's 13 digital properties (~203.5M monthly pageviews).

### What It Does

1. **Domain Selection** — Users select from Vox Media's pre-loaded portfolio
2. **CPM Configuration** — Adjustable display and video CPM rates
3. **Risk Scenario Modeling** — Conservative, Moderate, or Optimistic projections
4. **Business Readiness Assessment** — Sliders that dynamically affect CAPI volumes and ROI
5. **PDF Proposal Generation** — Branded, auditable reports for stakeholder review

### Key Outputs

| Metric | Description |
|--------|-------------|
| Monthly Incremental Revenue | Net new revenue from ID + CAPI + Media Performance |
| Annual Incremental Revenue | 12-month projection with risk adjustments |
| ROI Multiple | Return vs. AdFixus platform costs (POC and Full Contract) |
| CAPI Campaign Projection | Dynamically calculated from Business Readiness factors |

---

## Portfolio Summary (Current)

| Metric | Value |
|--------|-------|
| **Total Domains** | 13 properties |
| **Monthly Pageviews** | ~203.5M |
| **Monthly Impressions** | ~441M (varies by ads/page) |
| **POC Domains** | 6 (The Verge, Vox, NYMag cluster, The Cut, Vulture, Grub Street) |
| **Data Source** | Briar's Internal Reporting (January 2025) |

### Domain Consolidations

- **NYMag (incl Strategist + Intelligencer)** — 3 properties rolled into 1 entry (14.9M combined pageviews)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| PDF | pdfmake (client-side generation) |
| State | React hooks (`useScenarioCalculator`) |
| Backend | Supabase Edge Functions (email only) |
| Auth | Simple password (environment variable) |

---

## Quick Start

### For Users

1. Navigate to the tool URL
2. Enter the password (contact sales for credentials)
3. Select domains from the Vox Media portfolio
4. Adjust CPM rates if needed
5. Click "Calculate ROI Projection"
6. Review results, adjust risk scenario or Business Readiness sliders
7. Download PDF report (requires lead capture)

### For Developers

```bash
# Clone and setup
git clone <repo>
cd <repo>

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set VITE_APP_PASSWORD

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Contract Pricing (January 2025)

| Phase | Cost | Duration |
|-------|------|----------|
| **POC** | $15,000 flat (50% discount) | 3 months |
| **Full Contract** | $239,140/year (~$19.9K/mo) | Year 1+ |
| **CAPI Service Fee** | 12.5% of campaign revenue | Ongoing |
| **Included Pageviews** | 70M/month | — |
| **Overage Rate** | $0.048 per 1,000 pageviews | If exceeded |

---

## Key Contacts

| Role | Responsibility |
|------|----------------|
| **Product** | Feature requests, calculation updates |
| **Engineering** | Bug fixes, deployment |
| **Sales** | User feedback, data validation |

---

## Version

**Current**: 4.0 (Vox Media Customization)  
**Last Updated**: January 2025  
**License**: AdFixus Proprietary — Internal Use Only
