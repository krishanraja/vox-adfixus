# AdFixus ROI Calculator - Documentation

## Quick Navigation

| Document | Description |
|----------|-------------|
| [PURPOSE](./PURPOSE.md) | Why this tool exists, who it's for |
| [ARCHITECTURE](./ARCHITECTURE.md) | System design, data flow, modules |
| [FEATURES](./FEATURES.md) | Current and planned functionality |
| [DESIGN_SYSTEM](./DESIGN_SYSTEM.md) | Colors, typography, components |
| [DECISIONS_LOG](./DECISIONS_LOG.md) | Architectural decisions and rationale |
| [HISTORY](./HISTORY.md) | Version evolution and changelog |
| [COMMON_ISSUES](./COMMON_ISSUES.md) | Troubleshooting guide |
| [AUDIT_STATUS](./AUDIT_STATUS.md) | Data and calculation accuracy |
| [PROJECT_NOTES](./PROJECT_NOTES.md) | Context, formulas, stakeholder notes |
| [MASTER_INSTRUCTIONS](./MASTER_INSTRUCTIONS.md) | Development guidelines |

---

## Overview

The **AdFixus ROI Calculator** is a sales enablement tool designed for Vox Media customer engagement. It projects the financial return on investment from implementing AdFixus identity resolution technology across Vox Media's 16 digital properties (238M+ monthly pageviews).

### Key Capabilities

✅ **Domain-Specific Modeling**: Pre-loaded with Vox Media portfolio data  
✅ **Three Benefit Categories**: ID Infrastructure, CAPI Capabilities, Media Performance  
✅ **Risk Scenarios**: Conservative, Moderate, Optimistic projections  
✅ **Transparent Assumptions**: Every number is visible and adjustable  
✅ **PDF Proposals**: Branded reports with full calculation documentation  
✅ **Lead Capture**: Contact information collected before download  

---

## Quick Start

### For Users

1. Login with provided password
2. Select domains from Vox Media portfolio
3. Adjust CPM rates and CAPI campaign settings
4. Click "Calculate ROI Projection"
5. Review results, adjust assumptions as needed
6. Download PDF report (requires lead capture)

### For Developers

1. Clone repository
2. Copy `.env.example` to `.env`
3. Set `VITE_APP_PASSWORD`
4. Run `npm install && npm run dev`
5. Access at `http://localhost:5173`

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| PDF | pdfmake |
| State | React hooks |
| Backend | Supabase Edge Functions |
| Auth | Simple password (env var) |

---

## Current Status

**Version**: 3.1  
**Last Updated**: December 2024  
**Portfolio Coverage**: 16 Vox Media domains  
**Monthly Pageviews**: 238M+  

See [AUDIT_STATUS](./AUDIT_STATUS.md) for data accuracy details.

---

## Key Contacts

| Role | Responsibility |
|------|----------------|
| Product | Feature requests, data updates |
| Engineering | Bug fixes, development |
| Sales | User feedback, accuracy validation |

---

## License

Internal use only. AdFixus proprietary.
