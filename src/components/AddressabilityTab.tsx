// Addressability Tab - Structural Benefits Deep Dive
// Controls: Overall Addressability Target slider (drives live revenue updates)
// Read-only for everything else — controls on Summary tab

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Shield, TrendingUp, CheckCircle2, Info, Eye, DollarSign, Users, Target } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UnifiedResults, TimeframeType, AssumptionOverrides } from '@/types/scenarios';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { getDealBreakdown, formatCommercialCurrency } from '@/utils/commercialCalculations';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';
import { ADDRESSABILITY_BENCHMARKS } from '@/constants/industryBenchmarks';

interface AddressabilityTabProps {
  results: UnifiedResults;
  timeframe: TimeframeType;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
}

// Safari share is fixed at 35% (Vox Dec 2024 data)
const SAFARI_SHARE = ADDRESSABILITY_BENCHMARKS.SAFARI_SHARE; // 0.35
const BASELINE_ADDRESSABILITY = ADDRESSABILITY_BENCHMARKS.BASELINE_TOTAL_ADDRESSABILITY; // 0.65

// Slider range expressed as OVERALL addressability (65% → 95%)
const SLIDER_MIN = 65; // baseline (0% Safari unlocked)
const SLIDER_MAX = 95; // max (86% of Safari unlocked → +30pp → 95% total)

// Convert overall addressability target (%) → fraction of Safari users unlocked
function overallToSafariTarget(overallPct: number): number {
  // overallPct is e.g. 72 meaning 72%
  const overall = overallPct / 100;
  // overall = BASELINE + SAFARI_SHARE * safariTarget
  // safariTarget = (overall - BASELINE) / SAFARI_SHARE
  return Math.max(0, Math.min(1, (overall - BASELINE_ADDRESSABILITY) / SAFARI_SHARE));
}

// Convert fraction of Safari users unlocked → overall addressability (%)
function safariTargetToOverall(safariTarget: number): number {
  return (BASELINE_ADDRESSABILITY + SAFARI_SHARE * safariTarget) * 100;
}

export const AddressabilityTab = ({ results, timeframe, assumptionOverrides, onAssumptionOverridesChange }: AddressabilityTabProps) => {
  // Initialise slider from current overrides, or default TARGET_SAFARI_ADDRESSABILITY
  const defaultSafariTarget = assumptionOverrides?.targetSafariAddressability 
    ?? ADDRESSABILITY_BENCHMARKS.TARGET_SAFARI_ADDRESSABILITY; // 0.35
  const defaultOverallPct = Math.round(safariTargetToOverall(defaultSafariTarget));

  const [sliderValue, setSliderValue] = useState<number>(defaultOverallPct);

  // Re-run the engine live whenever slider changes
  const liveResults = useMemo(() => {
    const safariTarget = overallToSafariTarget(sliderValue);
    const overrides: AssumptionOverrides = {
      ...(assumptionOverrides ?? {}),
      targetSafariAddressability: safariTarget,
    };
    return UnifiedCalculationEngine.calculate(
      results.inputs,
      results.scenario,
      results.riskScenario ?? 'moderate',
      overrides
    );
  }, [sliderValue, results, assumptionOverrides]);

  const handleSliderCommit = (val: number[]) => {
    const overallPct = val[0];
    const safariTarget = overallToSafariTarget(overallPct);
    onAssumptionOverridesChange({
      ...(assumptionOverrides ?? {}),
      targetSafariAddressability: safariTarget,
    });
  };

  const handleSliderChange = (val: number[]) => {
    setSliderValue(val[0]);
  };

  // Derived display values from live results
  const breakdown = getDealBreakdown(liveResults, timeframe);
  const timeframeLabel = breakdown.display.label;
  const idInfraTotal = breakdown.display.idInfrastructure;
  const mediaTotal = breakdown.display.mediaPerformance;
  const combinedTotal = idInfraTotal + mediaTotal;

  const idDetails = liveResults.idInfrastructure?.details;
  const mediaDetails = liveResults.mediaPerformance?.details;

  // Slider-derived stats
  const safariUnlockedPct = Math.round(overallToSafariTarget(sliderValue) * 100);
  const addressabilityGainPp = sliderValue - SLIDER_MIN; // percentage points gained

  // ROI breakeven: find overall addressability % where ID infra monthly covers the platform fee
  // Use binary-search-style: iterate from 65 to 95 in 1% steps
  const platformFeeMonthly = liveResults.pricing?.fullContractMonthly ?? 26000;
  const breakevenPct = useMemo(() => {
    for (let t = SLIDER_MIN; t <= SLIDER_MAX; t++) {
      const safariTarget = overallToSafariTarget(t);
      const testResults = UnifiedCalculationEngine.calculate(
        results.inputs,
        results.scenario,
        results.riskScenario ?? 'moderate',
        { ...(assumptionOverrides ?? {}), targetSafariAddressability: safariTarget }
      );
      // ID infra monthly + media monthly ≥ platform fee
      const structuralMonthly = testResults.idInfrastructure.monthlyUplift + (testResults.mediaPerformance?.monthlyUplift ?? 0);
      if (structuralMonthly >= platformFeeMonthly) return t;
    }
    return null; // never breaks even on structural alone in this range
  }, [results, assumptionOverrides, platformFeeMonthly]);

  const isAboveBreakeven = breakevenPct !== null && sliderValue >= breakevenPct;
  const breakevenProgress = breakevenPct !== null
    ? Math.min(100, ((breakevenPct - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100)
    : null;
  const currentProgress = Math.min(100, ((sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Addressability Target Slider */}
      <Card className="p-6 border-2 border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm uppercase tracking-wider">Overall Addressability Target</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Safari makes up 35% of Vox's total visitors. Currently, 0% of Safari users are addressable due to Apple's ITP restrictions. Chrome and other browsers (65% of traffic) are already 100% addressable. This slider models how much of that Safari traffic AdFixus can unlock.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Baseline: 65% of inventory is addressable (Chrome + Others). Drag right to model AdFixus unlocking Safari traffic.
        </p>

        {/* Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>65% — Baseline (no AdFixus)</span>
            <span className="font-bold text-primary text-base">{sliderValue}% overall addressability</span>
            <span>95% — Full deployment</span>
          </div>
          <Slider
            min={SLIDER_MIN}
            max={SLIDER_MAX}
            step={1}
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            className="w-full"
          />
          {/* Tick marks */}
          <div className="relative h-4">
            {/* POC Target marker ~77% */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${((77 - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-px h-2 bg-primary/40" />
              <span className="text-[10px] text-primary/70 whitespace-nowrap">POC target</span>
            </div>
            {/* Optimistic marker ~86% */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: `${((86 - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-px h-2 bg-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">Optimistic</span>
            </div>
          </div>
        </div>

        {/* Live stats below slider */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-primary/10">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Safari visitors unlocked</div>
            <div className="text-xl font-bold text-primary">{safariUnlockedPct}%</div>
            <div className="text-[10px] text-muted-foreground">of Safari users resolved</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Total addressable inventory</div>
            <div className="text-xl font-bold text-foreground">{sliderValue}%</div>
            <div className="text-[10px] text-muted-foreground">+{addressabilityGainPp}pp from baseline</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">ID Infra monthly impact</div>
            <div className="text-xl font-bold text-primary">
              +{formatCurrency(liveResults.idInfrastructure.monthlyUplift)}
            </div>
            <div className="text-[10px] text-muted-foreground">vs contextual CPM baseline</div>
          </div>
        </div>
      </Card>

      {/* ROI Breakeven Card */}
      <Card className={`p-4 border ${isAboveBreakeven ? 'border-green-500/40 bg-green-500/5' : 'border-amber-500/40 bg-amber-500/5'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className={`h-4 w-4 ${isAboveBreakeven ? 'text-green-600' : 'text-amber-600'}`} />
              <span className="text-sm font-semibold">ROI Breakeven — Structural Benefits Only</span>
            </div>
            {breakevenPct !== null ? (
              <>
                <p className={`text-xs mb-3 ${isAboveBreakeven ? 'text-green-700' : 'text-amber-700'}`}>
                  {isAboveBreakeven
                    ? `Structural benefits cover the platform fee at ${breakevenPct}% addressability. You are currently at ${sliderValue}% — above breakeven. ✓`
                    : `Structural benefits alone cover the platform fee once you reach ${breakevenPct}% overall addressability. Set the slider to ${breakevenPct}% or above.`}
                </p>
                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    {/* Breakeven line */}
                    {breakevenProgress !== null && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
                        style={{ left: `${breakevenProgress}%` }}
                      />
                    )}
                    {/* Current progress fill */}
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${isAboveBreakeven ? 'bg-green-500' : 'bg-amber-400'}`}
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>65% baseline</span>
                    <span className="font-medium">Breakeven: {breakevenPct}%</span>
                    <span>95% full</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Structural benefits alone may not cover the platform fee at any addressability level in this range. Consider including CAPI revenue.
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">Platform fee</div>
            <div className="text-lg font-bold">{formatCurrency(platformFeeMonthly)}/mo</div>
          </div>
        </div>
      </Card>

      {/* Context Card */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>What this shows:</strong> Structural and operational benefits covered by the platform subscription. No revenue share applies — these are yours to keep 100%. Revenue numbers update live as you move the addressability slider above.
            </p>
          </div>
        </div>
      </Card>

      {/* Combined Hero */}
      <div className="text-center space-y-2 py-6">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Addressability Benefits ({timeframeLabel})
        </p>
        <div className="text-4xl md:text-5xl font-bold text-primary">
          {formatCommercialCurrency(combinedTotal)}
        </div>
        <p className="text-sm text-muted-foreground">
          100% retained — no revenue share on structural benefits
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ID Infrastructure Card */}
        <Card className="p-6 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">ID Infrastructure</h3>
            </div>
            <Badge variant="secondary">Structural</Badge>
          </div>
          
          <div className="text-3xl font-bold text-primary mb-4">
            {formatCommercialCurrency(idInfraTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formatCommercialCurrency(breakdown.monthly.idInfrastructure)}/mo)
            </span>
          </div>

          <div className="space-y-4">
            {/* Safari Recovery */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Safari Addressability Recovery</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Safari share of visitors</span>
                  <span className="font-medium text-foreground">
                    {formatPercentage(idDetails?.safariShare ?? 35, 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Safari visitors unlocked</span>
                  <span className="font-medium text-primary">
                    +{formatPercentage(idDetails?.safariAddressabilityImprovement ?? 35, 0)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                <div>
                  <span className="block text-muted-foreground/70">Overall addressability: before</span>
                  <span className="font-medium text-foreground">
                    {formatPercentage(idDetails?.currentAddressability ?? 65, 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Overall addressability: after</span>
                  <span className="font-medium text-primary">
                    {formatPercentage(idDetails?.improvedAddressability ?? 72, 0)}
                    <span className="text-[10px] text-muted-foreground ml-1">
                      (+{formatPercentage(idDetails?.totalAddressabilityImprovement ?? 7, 0)} pts)
                    </span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                CPM delta revenue: {formatCurrency(idDetails?.addressabilityRevenue || 0)}/mo
              </p>
            </div>

            {/* CDP Savings */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">CDP Cost Reduction</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="block text-muted-foreground/70">ID Deduplication Savings</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(idDetails?.monthlyCdpSavings || 0)}/mo
                </span>
              </div>
            </div>

            {/* Audience Segments */}
            <div className="p-3 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Fuller Audience Segments</span>
              </div>
              <p className="text-xs text-muted-foreground">
                More complete user profiles enable better targeting and higher CPMs across all inventory.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-primary">
            <CheckCircle2 className="h-4 w-4" />
            <span>Covered by platform fee — no additional share</span>
          </div>
        </Card>

        {/* Media Performance Card */}
        <Card className="p-6 border-2 border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Media Performance</h3>
            </div>
            <Badge variant="secondary">Operational</Badge>
          </div>
          
          <div className="text-3xl font-bold text-green-600 mb-4">
            {formatCommercialCurrency(mediaTotal)}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({formatCommercialCurrency(breakdown.monthly.mediaPerformance)}/mo)
            </span>
          </div>

          <div className="space-y-4">
            {/* Premium Yield */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Premium Yield Improvement</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Premium Inventory</span>
                  <span className="font-medium text-foreground">20%</span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Yield Uplift</span>
                  <span className="font-medium text-green-600">+15%</span>
                </div>
              </div>
            </div>

            {/* Make-Good Reduction */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Reduced Make-Goods</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground/70">Current Rate</span>
                  <span className="font-medium text-foreground">
                    {formatPercentage(mediaDetails?.baselineMakeGoodRate ?? 5, 0)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground/70">Improved Rate</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(mediaDetails?.improvedMakeGoodRate ?? 2, 0)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Savings: {formatCurrency(mediaDetails?.makeGoodSavings || 0)}/mo
              </p>
            </div>

            {/* Advertiser ROAS */}
            <div className="p-3 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Better Advertiser ROAS</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Advertisers see better returns, leading to increased spend and longer commitments.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Covered by platform fee — no additional share</span>
          </div>
        </Card>
      </div>

      {/* Summary Explanation */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="text-sm font-medium mb-2">Why These Benefits Are Structural</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Unlike CAPI revenue (which requires active sales effort and carries execution risk), 
          ID Infrastructure and Media Performance benefits are <strong>automatic outcomes</strong> of 
          deploying AdFixus. Once the technical integration is complete, these benefits materialize 
          naturally from better identity resolution — regardless of how many CAPI campaigns you sell.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is why they're covered by the platform subscription rather than a revenue share: 
          the value is predictable and doesn't require ongoing partnership investment to realize.
        </p>
      </Card>
    </div>
  );
};
