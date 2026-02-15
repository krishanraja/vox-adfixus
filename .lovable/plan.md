

# Fix Safari Math + Add Composable Revenue Stream Selection for PDF

## Problem 1: Safari Revenue is Overstated

**Current logic (WRONG):**
```
newlyAddressableDisplay impressions x (displayCPM x 1.25) = FULL revenue as "uplift"
```

This assumes Safari impressions earn $0 today. They don't -- Vox runs contextual ads on Safari. The real uplift is only the CPM delta from contextual to addressable.

**Correct logic:**
```
Safari impressions currently earn: contextualCPM (roughly 70-80% of addressable CPM)
After AdFixus: addressableCPM (displayCPM x 1.25)
Real uplift = addressableCPM - contextualCPM (only the delta)
```

Using industry benchmarks: contextual CPM is roughly 65-75% of addressable CPM. So if display CPM is $4.50 (addressable), contextual is roughly $3.15-$3.38. The delta is $1.12-$1.35 per CPM, not $5.63.

**This means the current ID Infrastructure number is inflated by roughly 3-4x on the addressability component.**

### Changes to `src/constants/industryBenchmarks.ts`:
- Add `CONTEXTUAL_CPM_RATIO: 0.72` to `ADDRESSABILITY_BENCHMARKS` (contextual CPM is ~72% of addressable CPM -- conservative, defensible)

### Changes to `src/utils/unifiedCalculationEngine.ts`:
- In `calculateIdInfrastructure()`, change the uplift calculation from:
  - `(impressions / 1000) x improvedCPM` (treats as net new)
  - To: `(impressions / 1000) x (improvedCPM - contextualCPM)` (only the delta)
- Where `contextualCPM = displayCPM x CONTEXTUAL_CPM_RATIO`
- The `cpmUpliftFactor` (25%) still applies on top of the base addressable CPM

This means:
- Addressable display CPM = $4.50 x 1.25 = $5.63
- Contextual display CPM = $4.50 x 0.72 = $3.24
- Delta = $2.39 per CPM (vs current $5.63 -- a 58% reduction in this component)

---

## Problem 2: Composable Revenue Streams for PDF Export

The user needs to select/deselect which revenue streams appear in the PDF before export because:
- CAPI may not be part of the POC (Vox sales restructuring)
- The structural story (ID Infra + Media Performance) should stand on its own
- Different presentations need different configurations

### New Type: `src/types/scenarios.ts`
Add a new interface:
```typescript
export interface PdfExportConfig {
  includeIdInfrastructure: boolean;    // Default: true (always on)
  includeCapiRevenue: boolean;         // Default: true (can toggle off)
  includeMediaPerformance: boolean;    // Default: true (can toggle off)
  includeCampaignEconomics: boolean;   // Default: true (follows CAPI toggle)
  includeCarSalesProofPoint: boolean;  // Default: true (follows CAPI toggle)
}
```

### New Component: Revenue Stream Selector
Create a component that appears between the "Download" button click and actual PDF generation. This will be a modal/sheet with checkboxes:

- **ID Infrastructure** (Safari Recovery + CDP Savings) -- always checked, cannot uncheck (it's the foundation)
- **CAPI Revenue** -- toggleable (when off, also hides campaign economics and CarSales)
- **Media Performance** -- toggleable
- Preview of total deal value updates live as streams are toggled
- "Generate PDF" button that passes the config to pdfGenerator

### Changes to `src/components/SummaryTab.tsx`:
- Replace direct `onDownloadPDF` call with opening the revenue stream selector
- Pass current results and timeframe to the selector

### New Component: `src/components/PdfExportConfig.tsx`
- Sheet/Dialog with checkboxes for each revenue stream
- Live preview of total value (recalculated based on selections)
- Shows which pages will be included in PDF
- "Generate PDF" button

### Changes to `src/pages/ScenarioModeler.tsx`:
- Add state for `pdfExportConfig`
- Pass config through to PDF generator

### Changes to `src/utils/pdfGenerator.ts`:
- Accept `PdfExportConfig` parameter
- Conditionally include/exclude pages based on config
- Recalculate totals based on selected streams only
- Page 1 (Executive Summary) always included, but totals reflect only selected streams
- Page 2 (Structural Benefits) included if ID Infra or Media selected
- Page 3 (CAPI Opportunity) only if CAPI selected
- Page 4 (Alignment Models) only if CAPI selected
- Page 5 (Next Steps) always included

### Changes to `src/utils/commercialCalculations.ts`:
- Add helper: `getFilteredDealBreakdown(results, timeframe, config)` that returns breakdown with zeroed-out excluded streams

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/constants/industryBenchmarks.ts` | MODIFY | Add `CONTEXTUAL_CPM_RATIO` to ADDRESSABILITY_BENCHMARKS |
| `src/utils/unifiedCalculationEngine.ts` | MODIFY | Fix Safari uplift to use CPM delta, not full CPM |
| `src/types/scenarios.ts` | MODIFY | Add `PdfExportConfig` interface |
| `src/components/PdfExportConfig.tsx` | CREATE | Revenue stream selector modal with live preview |
| `src/components/SummaryTab.tsx` | MODIFY | Wire up export config flow instead of direct download |
| `src/pages/ScenarioModeler.tsx` | MODIFY | Add export config state, pass to PDF generator |
| `src/utils/pdfGenerator.ts` | MODIFY | Accept config, conditionally include pages/recalculate totals |
| `src/utils/commercialCalculations.ts` | MODIFY | Add `getFilteredDealBreakdown()` helper |

---

## Expected Impact

After the Safari math fix:
- ID Infrastructure numbers will drop significantly (roughly 50-60% on the addressability component)
- CDP savings ($3,500/mo) remain unchanged
- The total deal value becomes more defensible and harder for a CFO to poke holes in
- The "contextual vs addressable CPM delta" narrative is explicitly stated in the PDF

After the composable export:
- User can generate a "structural only" PDF showing positive ROI without CAPI
- User can include CAPI when the audience is ready for it
- Total deal value in PDF dynamically adjusts to reflect only selected streams
- No more worrying about CAPI being a distraction when it might not be in the POC

