# Decisions Log

## Architectural Decisions

### DEC-001: Single Unified Calculation Engine
**Date**: 2024  
**Status**: Implemented  
**Context**: Multiple calculation approaches existed (quiz-based, domain-based, scenario-based)  
**Decision**: Consolidate all calculations into `UnifiedCalculationEngine` class  
**Rationale**: Single source of truth, easier to audit, consistent results  
**Impact**: Simplified testing, clearer data flow

---

### DEC-002: Risk Scenario Approach
**Date**: 2024  
**Status**: Implemented  
**Context**: Users skeptical of "best case" projections  
**Decision**: Implement three risk scenarios (conservative/moderate/optimistic) with transparent multipliers  
**Rationale**: Builds trust, allows user to model their own confidence level  
**Impact**: Added 30% more UI complexity but significantly improved credibility

---

### DEC-003: Domain-Specific Modeling for Vox
**Date**: 2024  
**Status**: Implemented  
**Context**: Generic calculator lacked impact for enterprise sales  
**Decision**: Pre-populate with actual Vox Media domain data (16 properties, 238M pageviews)  
**Rationale**: Demonstrates deep understanding of customer, reduces data entry friction  
**Impact**: Calculator now tailored exclusively to Vox Media use case

---

### DEC-004: CAPI Line Item Granularity
**Date**: 2024  
**Status**: Implemented  
**Context**: Original model assumed 100% of campaign spend used CAPI  
**Decision**: Add `capiLineItemShare` input (default 60%) for CAPI-enabled portion of spend  
**Rationale**: More accurate modeling - not all line items in a campaign use CAPI  
**Impact**: More conservative (realistic) CAPI benefit projections

---

### DEC-005: Pageview Override Capability
**Date**: 2024  
**Status**: Implemented  
**Context**: Default pageview data may be outdated or differ from customer's actuals  
**Decision**: Allow per-domain pageview overrides while maintaining sensible defaults  
**Rationale**: Balances convenience with accuracy  
**Impact**: Users can model with their own traffic data

---

### DEC-006: Safari Share Override
**Date**: 2024  
**Status**: Implemented  
**Context**: Safari/iOS share varies significantly by domain audience  
**Decision**: Allow per-domain Safari share overrides  
**Rationale**: Entertainment sites skew higher iOS; tech sites skew Chrome  
**Impact**: More accurate addressability benefit calculations

---

### DEC-007: Business Readiness Factors
**Date**: 2024  
**Status**: Implemented  
**Context**: Technical benefits mean nothing if organization can't capture them  
**Decision**: Add business readiness factors (sales readiness, training, buy-in, etc.)  
**Rationale**: Projects realistic scenarios accounting for organizational friction  
**Impact**: More conservative projections, higher credibility

---

### DEC-008: POC + Full Contract Pricing Model
**Date**: 2024  
**Status**: Implemented  
**Context**: Sales process involves POC phase before full commitment  
**Decision**: Model ROI separately for POC (3 months) and full contract phases  
**Rationale**: Reflects actual commercial structure  
**Impact**: Users see clear value at each stage

---

## Data Source Decisions

### DEC-101: Industry Benchmarks Source
**Date**: 2024  
**Status**: Implemented  
**Context**: Needed defensible industry benchmarks  
**Decision**: Use publicly available industry data with conservative interpretation  
**Sources**:
- Safari addressability: IAB industry reports
- CAPI match rates: Meta/Google published case studies
- CPM improvement factors: Programmatic advertising research
- CDP cost reduction: AdFixus internal data

---

### DEC-102: Vox Domain Traffic Data
**Date**: 2024-12  
**Status**: Updated  
**Context**: Need current traffic data for accurate modeling  
**Decision**: Use provided Vox Media traffic spreadsheet (December 2024)  
**Data Points**: 16 domains, 238M total monthly pageviews  
**Note**: Should be refreshed quarterly

---

## UI/UX Decisions

### DEC-201: Collapsible Detail Sections
**Date**: 2024  
**Status**: Implemented  
**Context**: Detailed breakdowns valuable but overwhelming  
**Decision**: Hide details behind expandable sections  
**Rationale**: Clean overview first, drill-down available  
**Impact**: Better first impression, power users can explore

---

### DEC-202: 12-Month Projection Chart
**Date**: 2024  
**Status**: Implemented  
**Context**: Annual number felt abstract  
**Decision**: Show monthly revenue ramp-up with ROI overlay  
**Rationale**: Visualizes value acceleration over time  
**Impact**: Stronger emotional connection to numbers

---

### DEC-203: Lead Capture Before PDF Download
**Date**: 2024  
**Status**: Implemented  
**Context**: Need lead information for sales follow-up  
**Decision**: Require name/email/company before PDF generation  
**Rationale**: Captures high-intent leads at moment of value  
**Impact**: 100% lead capture rate on PDF downloads

---

## Future Considerations

### Pending Decisions

| ID | Topic | Options | Notes |
|----|-------|---------|-------|
| DEC-301 | Multi-publisher support | Generic domains vs. publisher profiles | Depends on sales strategy |
| DEC-302 | Saved scenarios | LocalStorage vs. Supabase persistence | Privacy considerations |
| DEC-303 | API integration | Read actuals from AdFixus platform | Post-deployment validation |
