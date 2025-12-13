# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vite)                      │
├─────────────────────────────────────────────────────────────────┤
│  Pages                  │  Components              │  Hooks       │
│  ├─ ScenarioModeler    │  ├─ SimplifiedInputs     │  ├─ useScenarioCalculator
│  ├─ Login              │  ├─ SimplifiedResults    │  └─ useLeadCapture
│  └─ Index (legacy)     │  ├─ DomainSelector       │               │
│                        │  ├─ LeadCaptureModal     │               │
│                        │  └─ Navigation           │               │
├─────────────────────────────────────────────────────────────────┤
│  Utilities                           │  Constants                  │
│  ├─ UnifiedCalculationEngine        │  ├─ voxMediaDomains         │
│  ├─ domainAggregation               │  ├─ industryBenchmarks      │
│  ├─ pdfGenerator                    │  ├─ riskScenarios           │
│  └─ formatting                      │  └─ readinessFactors        │
├─────────────────────────────────────────────────────────────────┤
│                    Supabase Backend (Edge Functions)              │
│                    └─ send-pdf-email                              │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input → SimplifiedInputs → useScenarioCalculator
                                       ↓
                           UnifiedCalculationEngine.calculate()
                                       ↓
                              UnifiedResults
                                       ↓
                           SimplifiedResults (display)
                                       ↓
                    LeadCaptureModal → pdfGenerator → PDF Download
```

## Core Modules

### 1. Scenario Calculator Hook (`useScenarioCalculator.ts`)

Central state management for the calculation flow:

```typescript
interface State {
  inputs: SimplifiedInputs;           // User-provided domain/CPM data
  scenario: ScenarioState;            // Deployment + scope selection
  riskScenario: RiskScenario;         // conservative | moderate | optimistic
  assumptionOverrides: AssumptionOverrides; // User-adjusted assumptions
  results: UnifiedResults | null;     // Calculated output
}
```

### 2. Unified Calculation Engine (`UnifiedCalculationEngine.ts`)

Pure calculation logic with three benefit modules:

| Module | Inputs | Outputs |
|--------|--------|---------|
| `calculateIdInfrastructure` | Pageviews, CPMs, Safari share | Addressability revenue, CDP savings |
| `calculateCapiCapabilities` | Campaign count, spend, line item share | CAPI fees, conversion revenue, labor savings |
| `calculateMediaPerformance` | Impressions, CPMs, premium share | Premium yield, make-good savings |

### 3. Domain Aggregation (`domainAggregation.ts`)

Aggregates multi-domain selections into weighted averages:

```typescript
aggregateDomainInputs(selectedDomains, displayCPM, videoCPM, overrides)
  → { totalMonthlyPageviews, weightedDisplayVideoSplit, weightedSafariShare }
```

### 4. PDF Generator (`pdfGenerator.ts`)

Builds branded proposal PDF using pdfmake:
- Executive summary
- Domain breakdown
- ROI analysis
- Assumption documentation

## Type System

All types defined in `src/types/scenarios.ts`:

```typescript
SimplifiedInputs     // User inputs
ScenarioState        // Deployment + scope
AssumptionOverrides  // Override defaults
UnifiedResults       // Full calculation output
PricingModel         // POC + contract pricing
ROIAnalysis          // Payback periods, multiples
MonthlyProjection    // 12-month forecast
```

## Authentication

Simple password-protected access via `AuthContext`:
- Password stored in environment variable
- Session persisted in localStorage
- No user accounts (single shared access)

## Backend Integration

Supabase Edge Function for email delivery:
- `send-pdf-email`: Sends PDF report to captured lead email
- Requires Supabase project connection
