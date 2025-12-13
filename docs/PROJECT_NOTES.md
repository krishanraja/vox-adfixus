# Project Notes

## Business Context

### AdFixus Background
AdFixus provides identity resolution technology for publishers, enabling:
- Durable user identity across Safari/ITP restrictions
- CAPI (Conversion API) implementation via AdFixus Stream
- Cross-domain identity graph for media networks

### Vox Media Opportunity
Vox Media operates 16 digital properties with 238M+ monthly pageviews:
- Diverse portfolio across news, entertainment, sports, lifestyle
- Significant iOS/Safari audience (35-45% across properties)
- Existing CDP infrastructure with optimization potential
- Active CAPI adoption for advertiser campaigns

### Sales Cycle Context
This tool supports the Vox Media sales process by:
1. Providing credible, data-backed ROI projections
2. Allowing stakeholder self-modeling with transparent assumptions
3. Generating professional proposals for budget approval
4. Capturing qualified leads for sales follow-up

---

## Technical Notes

### Calculation Philosophy

**Conservative by Design**:
- Default to "moderate" risk scenario
- Business readiness factors start below 100%
- CAPI service fees deducted from benefits (honest net calculation)
- Ramp-up curve reflects real deployment timelines

**Transparency Over Simplicity**:
- Every assumption is visible and adjustable
- Calculation breakdown available in expandable sections
- PDF documents all assumptions used

### Key Formulas

**ID Infrastructure Revenue**:
```
newly_addressable = total_impressions × safari_share × addressability_improvement
revenue_uplift = (newly_addressable / 1000) × cpm × (1 + cpm_uplift_factor)
```

**CAPI Net Benefit**:
```
capi_eligible_spend = campaigns × avg_spend × line_item_share
conversion_revenue = capi_eligible_spend × conversion_improvement
service_fees = capi_eligible_spend × (1 + conversion_improvement) × fee_rate
net_benefit = conversion_revenue + labor_savings - service_fees
```

**ROI Calculation**:
```
poc_roi = (monthly_benefit × 3 × ramp_up_factor) / poc_cost
full_roi = monthly_benefit / monthly_contract_cost
```

---

## Domain Profiles Explained

### Audience Profiles

**techSavvy** (0-1): 
- Higher = faster adoption of new tech
- Affects: deployment timeline assumptions
- The Verge: 0.85 (tech-focused audience)
- The Dodo: 0.55 (general audience)

**safariShare** (0-1):
- Percentage of traffic from Safari/iOS
- Affects: addressability benefit magnitude
- Entertainment sites: 0.40-0.48 (higher iOS)
- Tech sites: 0.32-0.38 (more Chrome/Android)

### Category Assignments

| Category | Domains | Common Profile |
|----------|---------|----------------|
| news-tech | The Verge, Vox, Intelligencer | High tech savvy, lower Safari |
| entertainment | Vulture, NYMag, The Cut, The Dodo, NYMag App | Moderate-high Safari |
| sports | SB Nation | Moderate tech savvy, lower Safari |
| lifestyle-food | Eater, Strategist, PopSugar, Thrillist, Punch, Grub Street | Moderate both |
| real-estate | Curbed | Higher income demo, moderate Safari |

---

## Risk Scenario Rationale

### Conservative (50-70% realization)
- First-time AdFixus implementation
- Limited sales team training
- Uncertain advertiser buy-in
- Technical integration challenges expected

### Moderate (75-85% realization)
- Some prior identity solution experience
- Sales team has basic training
- Some advertiser relationships in place
- Standard integration timeline

### Optimistic (85-95% realization)
- Mature identity strategy
- Well-trained sales team
- Strong advertiser demand
- Fast technical deployment

---

## Integration Points

### Supabase (Edge Functions)
- `send-pdf-email`: Sends generated PDF to lead email
- Requires email service API key in secrets

### PDF Generation (pdfmake)
- Client-side PDF generation
- AdFixus branding embedded
- All calculations included in report

### Future Integrations (Planned)
- AdFixus Analytics API: Post-deployment validation
- CRM webhook: Lead data to sales pipeline
- Slack notification: Alert on PDF downloads

---

## Stakeholder Notes

### For Product
- Benchmark refresh needed Q1 2025
- Consider multi-currency for international publishers
- Comparison mode requested by sales

### For Engineering
- Unit test coverage needed
- Consider moving calculations to edge function
- Error boundaries for production reliability

### For Sales
- Always use "Moderate" scenario for initial presentations
- Business readiness factors are your conversation starters
- PDF contains all assumptions for stakeholder review

---

## Glossary

| Term | Definition |
|------|------------|
| **ITP** | Intelligent Tracking Prevention (Safari) |
| **Durable ID** | AdFixus identity that persists beyond cookie limits |
| **CAPI** | Conversion API - server-to-server conversion tracking |
| **CPM** | Cost Per Mille (cost per 1,000 impressions) |
| **CDP** | Customer Data Platform |
| **Addressability** | Ability to identify/target a user |
| **POC** | Proof of Concept (trial period) |
| **Make-good** | Compensation for under-delivered campaigns |
| **Line Item** | Individual targeting/creative within a campaign |
