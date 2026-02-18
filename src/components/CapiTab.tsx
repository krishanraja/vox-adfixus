// CAPI Tab - Sales-Led Revenue Deep Dive
// Shows CAPI commercial model comparison with live campaign sliders

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Info, CheckCircle2, AlertTriangle, MinusCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { UnifiedResults, TimeframeType, AssumptionOverrides } from '@/types/scenarios';
import { 
  generateAllScenarios, 
  formatCommercialCurrency,
  getCapiMonthlyIncremental,
  getDealBreakdown
} from '@/utils/commercialCalculations';
import { calculateCampaignPortfolio } from '@/utils/campaignEconomicsCalculator';
import { CumulativeRevenueChart } from '@/components/commercial/CumulativeRevenueChart';
import { CampaignEconomicsTable } from '@/components/commercial/CampaignEconomicsTable';
import { CarSalesCaseStudy } from '@/components/commercial/CarSalesCaseStudy';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface CapiTabProps {
  results: UnifiedResults;
  timeframe: TimeframeType;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange?: (overrides: AssumptionOverrides) => void;
}

export const CapiTab = ({ results, timeframe, assumptionOverrides, onAssumptionOverridesChange }: CapiTabProps) => {
  const [showProjection, setShowProjection] = useState(false);
  const [showAlignmentModels, setShowAlignmentModels] = useState(false);
  
  // Engine-calculated defaults
  const capiConfig = results.capiCapabilities?.capiConfiguration;
  const engineCampaigns = capiConfig?.yearlyCampaigns || 16;
  const engineAvgSpend = capiConfig?.avgCampaignSpend || 79000;

  // Slider state — initialise from overrides if already set, else engine defaults
  const [localCampaigns, setLocalCampaigns] = useState<number>(
    assumptionOverrides?.capiYearlyCampaigns ?? engineCampaigns
  );
  const [localAvgSpend, setLocalAvgSpend] = useState<number>(
    assumptionOverrides?.capiAvgCampaignSpend ?? engineAvgSpend
  );

  const campaignsModified = Math.abs(localCampaigns - engineCampaigns) > 0.001;
  const spendModified = Math.abs(localAvgSpend - engineAvgSpend) > 1;
  const isModified = campaignsModified || spendModified;

  const handleCampaignsChange = (value: number) => {
    setLocalCampaigns(value);
    onAssumptionOverridesChange?.({
      ...(assumptionOverrides || {}),
      capiYearlyCampaigns: value,
    });
  };

  const handleAvgSpendChange = (value: number) => {
    setLocalAvgSpend(value);
    onAssumptionOverridesChange?.({
      ...(assumptionOverrides || {}),
      capiAvgCampaignSpend: value,
    });
  };

  const handleReset = () => {
    setLocalCampaigns(engineCampaigns);
    setLocalAvgSpend(engineAvgSpend);
    onAssumptionOverridesChange?.({
      ...(assumptionOverrides || {}),
      capiYearlyCampaigns: undefined,
      capiAvgCampaignSpend: undefined,
    });
  };

  // Live portfolio calculation from slider values
  const portfolio = useMemo(() => 
    calculateCampaignPortfolio(localCampaigns, localAvgSpend),
    [localCampaigns, localAvgSpend]
  );
  
  // Scenarios use results from engine (updated via assumptionOverrides prop change)
  const scenarios = useMemo(() => generateAllScenarios(results), [results]);
  const recommendedScenario = scenarios.find(s => s.model.isRecommended) || scenarios[0];
  
  const dealBreakdown = useMemo(() => getDealBreakdown(results, timeframe), [results, timeframe]);
  const capiMonthly = getCapiMonthlyIncremental(results);
  
  const periodMonths = timeframe === '3-year' ? 36 : 12;

  // Cap threshold annotations
  const CAP_THRESHOLD = 240000; // spend at which cap kicks in fully ($30K / 12.5%)
  const spendPctOfCap = Math.min(localAvgSpend / CAP_THRESHOLD, 1);
  const isBeyondCap = localAvgSpend >= CAP_THRESHOLD;

  const getModelMetrics = (scenario: typeof scenarios[0]) => {
    const capiIncremental = timeframe === '3-year' 
      ? scenario.incrementalRevenue 
      : dealBreakdown.year1.capi;
    
    if (scenario.model.type === 'flat-fee') {
      const annualFee = scenario.model.params.annualFlatFee || 1000000;
      const totalFee = timeframe === '3-year' ? annualFee * 3 : annualFee;
      const netPosition = capiIncremental - totalFee;
      return {
        incrementalRevenue: capiIncremental,
        feePaid: totalFee,
        netPosition,
        isNegative: netPosition < 0,
        feeLabel: 'Fixed Annual Fee',
        netLabel: 'Net Position After Fee',
      };
    }
    
    const multiplier = timeframe === '3-year' ? 1 : 1/3;
    return {
      incrementalRevenue: capiIncremental,
      feePaid: scenario.adfixusShare * multiplier,
      netPosition: scenario.publisherNetGain * multiplier,
      isNegative: false,
      feeLabel: 'Share of Upside',
      netLabel: 'Publisher Net Gain',
    };
  };

  const formatSpend = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    return `$${Math.round(v / 1000)}K`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero: Your CAPI Configuration — with live sliders */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg">Your CAPI Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Based on your Business Readiness Assessment — adjust to model scenarios
            </p>
          </div>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to defaults
            </Button>
          )}
        </div>

        {/* Slider 1 — Campaigns per year */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CAPI Campaigns / Year</span>
            <span className={`text-sm font-semibold tabular-nums ${campaignsModified ? 'text-accent' : 'text-foreground'}`}>
              {localCampaigns}
            </span>
          </div>
          <Slider
            value={[localCampaigns]}
            onValueChange={([v]) => handleCampaignsChange(v)}
            min={2}
            max={50}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2 campaigns (~0.2/mo)</span>
            <span className="text-center">~{(localCampaigns / 12).toFixed(1)}/month</span>
            <span>50 campaigns (~4.2/mo)</span>
          </div>
        </div>

        {/* Slider 2 — Avg campaign spend */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Avg Campaign Spend</span>
            <div className="flex items-center gap-2">
              {isBeyondCap && (
                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                  Cap exceeded — full ROI
                </Badge>
              )}
              <span className={`text-sm font-semibold tabular-nums ${spendModified ? 'text-accent' : 'text-foreground'}`}>
                {formatSpend(localAvgSpend)}
              </span>
            </div>
          </div>
          <Slider
            value={[localAvgSpend]}
            onValueChange={([v]) => handleAvgSpendChange(v)}
            min={25000}
            max={500000}
            step={5000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$25K</span>
            <span className="text-center">
              {localAvgSpend < CAP_THRESHOLD 
                ? `${Math.round(spendPctOfCap * 100)}% toward cap ($240K = full ROI)` 
                : 'Every dollar of uplift goes to Vox'}
            </span>
            <span>$500K</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-primary/10">
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className={`text-2xl font-bold ${campaignsModified ? 'text-accent' : 'text-primary'}`}>
              {localCampaigns}
            </p>
            <p className="text-xs text-muted-foreground">Campaigns / Year</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className={`text-2xl font-bold ${spendModified ? 'text-accent' : 'text-primary'}`}>
              {formatSpend(localAvgSpend)}
            </p>
            <p className="text-xs text-muted-foreground">Avg Campaign Spend</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold text-emerald-600">
              {formatCommercialCurrency(portfolio.annualNet)}
            </p>
            <p className="text-xs text-muted-foreground">Annual Net to Vox</p>
          </div>
        </div>

        {/* Divergence note */}
        {isModified && (
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-accent/5 border border-accent/20 rounded-md px-3 py-2">
            <Info className="h-3.5 w-3.5 flex-shrink-0 text-accent" />
            <span>
              Modelling <strong>{localCampaigns} campaigns</strong> at <strong>{formatSpend(localAvgSpend)}</strong> avg spend.
              Engine default: {engineCampaigns} campaigns at {formatSpend(engineAvgSpend)}.
            </span>
          </div>
        )}
      </Card>

      {/* Campaign Economics Table - THE KEY INSIGHT */}
      <CampaignEconomicsTable avgCampaignSpend={localAvgSpend} />

      {/* CarSales Case Study */}
      <CarSalesCaseStudy />

      {/* Context Card */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>How the alignment model works:</strong> The 12.5% revenue share applies <em>only</em> to CAPI campaign incremental revenue 
              (<strong>{formatCommercialCurrency(capiMonthly)}/mo</strong> at steady state), with a <strong>$30K cap per campaign</strong>.
            </p>
            <p>
              Your ID Infrastructure ({formatCommercialCurrency(dealBreakdown.monthly.idInfrastructure)}/mo) and 
              Media Performance ({formatCommercialCurrency(dealBreakdown.monthly.mediaPerformance)}/mo) benefits are 
              covered by the platform subscription — no additional share.
            </p>
          </div>
        </div>
      </Card>

      {/* Alignment Models Comparison (Collapsible) */}
      <Collapsible open={showAlignmentModels} onOpenChange={setShowAlignmentModels}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            {showAlignmentModels ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAlignmentModels ? 'Hide' : 'Compare'} Alignment Models
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const metrics = getModelMetrics(scenario);
              const isRecommended = scenario.model.isRecommended;
              const isFlatFee = scenario.model.type === 'flat-fee';
              const isAnnualCap = scenario.model.type === 'annual-cap';
              
              return (
                <Card 
                  key={scenario.model.type}
                  className={`p-5 relative ${
                    isRecommended 
                      ? 'border-2 border-emerald-500 bg-emerald-500/5' 
                      : isFlatFee
                        ? 'border-2 border-red-500/50 bg-red-500/5'
                        : 'border-2 border-amber-500/50 bg-amber-500/5'
                  }`}
                >
                  {isRecommended && (
                    <Badge className="absolute -top-2 left-4 bg-emerald-500">
                      Recommended
                    </Badge>
                  )}
                  
                  <div className="mb-4 pt-2">
                    <h3 className="font-semibold text-lg">{scenario.model.label}</h3>
                    <p className="text-xs text-muted-foreground">{scenario.model.tagline}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">CAPI Incremental</span>
                      <span className="font-medium">{formatCommercialCurrency(metrics.incrementalRevenue)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{metrics.feeLabel}</span>
                      <span className={`font-medium ${isFlatFee ? 'text-red-600' : ''}`}>
                        {formatCommercialCurrency(metrics.feePaid)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="font-medium">{metrics.netLabel}</span>
                      <span className={`font-bold text-lg ${
                        metrics.isNegative ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {metrics.isNegative ? '-' : ''}{formatCommercialCurrency(Math.abs(metrics.netPosition))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs">
                      {isRecommended ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-600 font-medium">Full incentive alignment</span>
                        </>
                      ) : isFlatFee ? (
                        <>
                          <MinusCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600 font-medium">No growth incentive</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600 font-medium">Capped incentive</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {isRecommended && "We only win when you win. Every dollar of CAPI uplift is a shared success."}
                      {isFlatFee && "Fixed cost regardless of CAPI performance. Risk is entirely on you."}
                      {isAnnualCap && "After cap is hit, we have no incentive to help you grow further."}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 36-Month Projection (Collapsible) */}
      <Collapsible open={showProjection} onOpenChange={setShowProjection}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            {showProjection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showProjection ? 'Hide' : 'Show'} {periodMonths}-Month Projection
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">
              Revenue Share Model: Cumulative CAPI Revenue
            </h3>
            <CumulativeRevenueChart 
              data={recommendedScenario.monthlyProjection}
              modelType="revenue-share"
              showPostCapBenefit={false}
            />
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Closing Statement */}
      <div className="text-center py-6 border-t border-b">
        <p className="text-sm font-medium text-muted-foreground italic max-w-2xl mx-auto">
          "The more aggressively you deploy CAPI on your largest advertisers, the better the economics get."
        </p>
      </div>
    </div>
  );
};
