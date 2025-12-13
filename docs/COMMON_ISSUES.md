# Common Issues & Troubleshooting

## Calculation Issues

### Issue: ROI Appears Too High
**Symptoms**: ROI multiples exceeding 10x

**Causes**:
1. Using "Optimistic" risk scenario
2. Business readiness factors at 100%
3. Low CAPI service fee assumption

**Resolution**:
- Switch to "Conservative" risk scenario
- Adjust business readiness to realistic levels
- Verify CAPI service fee at 12.5%

---

### Issue: ROI Appears Too Low
**Symptoms**: ROI multiples below 2x

**Causes**:
1. Few domains selected
2. Low pageview volumes
3. Very conservative assumption overrides

**Resolution**:
- Add more domains to selection
- Verify pageview overrides are reasonable
- Reset assumptions to defaults

---

### Issue: CAPI Benefits = $0
**Symptoms**: No CAPI revenue showing

**Causes**:
1. Scope set to "ID Only"
2. CAPI campaigns per month = 0
3. CAPI line item share = 0%

**Resolution**:
- Set scope to "ID + CAPI" or "All Features"
- Increase CAPI campaigns
- Set line item share > 0%

---

### Issue: Negative Net Benefits
**Symptoms**: Monthly uplift is negative

**Cause**: CAPI service fees exceed conversion tracking revenue

**Resolution**:
- Reduce service fee percentage
- Increase campaign spend
- Increase CAPI campaigns per month

---

## UI Issues

### Issue: Chart Not Rendering
**Symptoms**: Blank chart area

**Causes**:
1. No results calculated yet
2. Browser zoom affecting viewport

**Resolution**:
- Click "Calculate ROI Projection" first
- Reset browser zoom to 100%

---

### Issue: PDF Download Fails
**Symptoms**: Nothing happens on download click

**Causes**:
1. Lead capture not completed
2. Browser blocking popup
3. pdfmake initialization error

**Resolution**:
- Complete lead capture form
- Allow popups for site
- Refresh page and retry

---

### Issue: Dark Mode Text Invisible
**Symptoms**: White text on white background

**Cause**: Component not using semantic tokens

**Resolution**: Ensure all text uses `text-foreground`, `text-muted-foreground`, etc.

---

## Data Issues

### Issue: Domain Not Appearing
**Symptoms**: Expected domain missing from selector

**Cause**: Domain not in `voxMediaDomains.ts`

**Resolution**: Add domain to `VOX_MEDIA_DOMAINS` array with required fields:
```typescript
{
  id: 'domain-id',
  name: 'Display Name',
  monthlyPageviews: 1000000,
  displayVideoSplit: 80,
  category: 'entertainment',
  audienceProfile: {
    techSavvy: 0.70,
    safariShare: 0.40,
  }
}
```

---

### Issue: Outdated Pageview Data
**Symptoms**: Traffic numbers don't match customer expectations

**Resolution**:
1. Use pageview override feature per-domain
2. Or update `voxMediaDomains.ts` with current data

---

## Authentication Issues

### Issue: Can't Login
**Symptoms**: Password rejected

**Causes**:
1. Wrong password
2. Environment variable not set

**Resolution**:
- Verify password with admin
- Check `VITE_APP_PASSWORD` in `.env`

---

### Issue: Session Not Persisting
**Symptoms**: Logged out on page refresh

**Cause**: localStorage blocked or cleared

**Resolution**:
- Ensure localStorage is enabled
- Check for browser extensions blocking storage

---

## Performance Issues

### Issue: Slow Calculation
**Symptoms**: Delay on input changes

**Cause**: Large number of domains with complex overrides

**Resolution**:
- Calculations are memoized; should be instant
- If slow, check for infinite re-render loops

---

## Environment Issues

### Issue: Supabase Connection Failed
**Symptoms**: Email sending fails

**Causes**:
1. Supabase not connected
2. Edge function not deployed
3. Missing secrets

**Resolution**:
- Verify Supabase integration enabled
- Deploy `send-pdf-email` function
- Add required secrets (email API key)

---

## Debug Checklist

When encountering issues:

1. **Check Console**: Look for JavaScript errors
2. **Check Network**: Verify API calls succeeding
3. **Check State**: Log current `inputs`, `results` objects
4. **Check Assumptions**: Verify overrides aren't extreme
5. **Check Data**: Ensure domain data is valid
6. **Reset**: Try clearing localStorage and refreshing
