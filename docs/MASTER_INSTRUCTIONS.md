# Master Instructions

## Project Overview

**Name**: AdFixus ROI Calculator  
**Purpose**: Sales enablement tool for Vox Media customer engagement  
**Stack**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, pdfmake  
**Backend**: Supabase (Lovable Cloud) for edge functions  

---

## Development Guidelines

### Code Organization

```
src/
├── components/           # UI components
│   ├── ui/              # shadcn/ui base components
│   ├── calculator/      # Calculator-specific components
│   └── shared/          # Reusable components
├── constants/           # Static data and configuration
├── contexts/            # React contexts (Auth)
├── hooks/               # Custom hooks
├── pages/               # Route components
├── types/               # TypeScript type definitions
└── utils/               # Pure utility functions
```

### Key Files

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `voxMediaDomains.ts` | Domain data | Quarterly |
| `industryBenchmarks.ts` | Calculation constants | Semi-annual |
| `riskScenarios.ts` | Risk multipliers | Rarely |
| `UnifiedCalculationEngine.ts` | All calculations | With caution |
| `SimplifiedInputs.tsx` | Input UI | As needed |
| `SimplifiedResults.tsx` | Results UI | As needed |

### Coding Standards

1. **TypeScript**: All files must be typed
2. **Components**: Prefer function components with hooks
3. **Styling**: Use Tailwind semantic tokens only (no `text-white`, `bg-black`)
4. **State**: Centralize in hooks, not components
5. **Calculations**: Keep pure, side-effect-free in utils

### Modifying Calculations

⚠️ **CAUTION**: Any change to `UnifiedCalculationEngine.ts` affects all projections

Before modifying:
1. Document the change rationale
2. Update `DECISIONS_LOG.md`
3. Test with multiple domain combinations
4. Verify PDF output reflects changes
5. Update `AUDIT_STATUS.md`

### Adding New Domains

1. Add to `VOX_MEDIA_DOMAINS` array in `voxMediaDomains.ts`:
```typescript
{
  id: 'domain-slug',           // URL-safe lowercase
  name: 'Display Name',        // Human-readable
  monthlyPageviews: 1000000,   // Actual traffic
  displayVideoSplit: 80,       // % display (100-video%)
  category: 'entertainment',   // news-tech|lifestyle-food|entertainment|sports|real-estate
  audienceProfile: {
    techSavvy: 0.70,           // 0-1 adoption speed
    safariShare: 0.40,         // iOS/Safari %
  }
}
```

2. Update `AUDIT_STATUS.md` with source

### Updating Benchmarks

1. Modify `industryBenchmarks.ts`
2. Document source in file comments
3. Update `AUDIT_STATUS.md`
4. Test calculation outputs

---

## Deployment

### Environment Variables

```bash
VITE_APP_PASSWORD=xxx              # Login password
VITE_MEETING_BOOKING_URL=xxx       # Calendar booking link
VITE_SUPABASE_URL=xxx              # Auto-set by Lovable Cloud
VITE_SUPABASE_ANON_KEY=xxx         # Auto-set by Lovable Cloud
```

### Build

```bash
npm run build    # Production build
npm run preview  # Preview production build locally
```

### Deploy

Automatic via Lovable publish button:
- Frontend: Requires click "Update" in publish dialog
- Backend (edge functions): Deploy immediately

---

## Testing Checklist

Before any release:

- [ ] Calculate with single domain
- [ ] Calculate with multiple domains
- [ ] Calculate with full portfolio
- [ ] Test all three risk scenarios
- [ ] Adjust assumptions and verify recalculation
- [ ] Download PDF and verify content
- [ ] Test on mobile viewport
- [ ] Verify dark mode styling
- [ ] Check login/logout flow

---

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Domain traffic update | Quarterly | Product |
| Benchmark review | Quarterly | Product |
| Security scan | Monthly | Dev |
| Dependency updates | Monthly | Dev |
| Code audit | Quarterly | Dev |

---

## Emergency Procedures

### Calculation Bug Found

1. Switch users to "Conservative" scenario (safest)
2. Identify affected formula in engine
3. Fix with minimal change
4. Document in `DECISIONS_LOG.md`
5. Update `AUDIT_STATUS.md`

### Data Breach Concern

1. Lead capture data is transient (not stored)
2. PDF generation is client-side
3. Email sending via edge function (check Supabase logs)
4. Rotate Supabase keys if needed

### Site Down

1. Check Lovable status page
2. Check Supabase status
3. Verify edge functions in Supabase dashboard
4. Check browser console for errors

---

## Contacts

| Role | Responsibility |
|------|----------------|
| Product | Benchmark updates, domain data, feature requests |
| Engineering | Bug fixes, new features, code maintenance |
| Sales | User feedback, accuracy validation |
| AdFixus | Commercial terms, service fee updates |
