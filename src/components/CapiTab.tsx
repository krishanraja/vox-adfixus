// CAPI Tab - Sales-Led Revenue Deep Dive
// READ-ONLY - Shows CAPI commercial model comparison only
// No controls here - all configuration happens on Summary tab

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';
import type { UnifiedResults, TimeframeType } from '@/types/scenarios';
import { 
  generateAllScenarios, 
  formatCommercialCurrency,
  getCapiMonthlyIncremental,
  getDealBreakdown
} from '@/utils/commercialCalculations';
import { CumulativeRevenueChart } from '@/components/commercial/CumulativeRevenueChart';
import { ProofPointCard } from '@/components/commercial/ProofPointCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CapiTabProps {
  results: UnifiedResults;
  timeframe: TimeframeType;
}

export const CapiTab = ({ results, timeframe }: CapiTabProps) => {
  const [showProjection, setShowProjection] = useState(false);
  
  // Generate all three scenarios using CAPI-only revenue
  const scenarios = useMemo(() => generateAllScenarios(results), [results]);
  const recommendedScenario = scenarios.find(s => s.model.isRecommended) || scenarios[0];
  
  // Get deal breakdown for context
  const dealBreakdown = useMemo(() => getDealBreakdown(results), [results]);
  const capiMonthly = getCapiMonthlyIncremental(results);
  
  // Timeframe multiplier
  const multiplier = timeframe === '3-year' ? 1 : 1 / 3;
  const timeframeLabel = timeframe === '3-year' ? '36 months' : '12 months';
  const periodMonths = timeframe === '3-year' ? 36 : 12;

  // CRITICAL: Correct calculations for each model
  const getModelMetrics = (scenario: typeof scenarios[0]) => {
    const capiIncremental = scenario.incrementalRevenue * multiplier;
    
    if (scenario.model.type === 'flat-fee') {
      // Flat Fee: Fixed cost regardless of CAPI revenue
      // Publisher keeps 100% of CAPI incremental BUT pays the annual fee
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
    
    // Revenue Share and Annual Cap: Fee is based on CAPI revenue
    return {
      incrementalRevenue: capiIncremental,
      feePaid: scenario.adfixusShare * multiplier,
      netPosition: scenario.publisherNetGain * multiplier,
      isNegative: false,
      feeLabel: 'Share of Upside',
      netLabel: 'Publisher Net Gain',
    };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Context Card */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>What this shows:</strong> The 12.5% revenue share applies <em>only</em> to CAPI campaign incremental revenue 
              (<strong>{formatCommercialCurrency(capiMonthly)}/mo</strong> at steady state).
            </p>
            <p>
              Your ID Infrastructure ({formatCommercialCurrency(dealBreakdown.monthly.idInfrastructure)}/mo) and 
              Media Performance ({formatCommercialCurrency(dealBreakdown.monthly.mediaPerformance)}/mo) benefits are 
              covered by the platform subscription — no additional share.
            </p>
          </div>
        </div>
      </Card>

      {/* Three Alignment Model Cards */}
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
              {/* Recommended Badge */}
              {isRecommended && (
                <Badge className="absolute -top-2 left-4 bg-emerald-500">
                  Recommended
                </Badge>
              )}
              
              {/* Model Header */}
              <div className="mb-4 pt-2">
                <h3 className="font-semibold text-lg">{scenario.model.label}</h3>
                <p className="text-xs text-muted-foreground">{scenario.model.tagline}</p>
              </div>
              
              {/* Metrics */}
              <div className="space-y-3">
                {/* CAPI Incremental */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">CAPI Incremental</span>
                  <span className="font-medium">{formatCommercialCurrency(metrics.incrementalRevenue)}</span>
                </div>
                
                {/* Fee */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{metrics.feeLabel}</span>
                  <span className={`font-medium ${isFlatFee ? 'text-red-600' : ''}`}>
                    {formatCommercialCurrency(metrics.feePaid)}
                  </span>
                </div>
                
                {/* Net Position */}
                <div className="flex justify-between items-center text-sm pt-2 border-t">
                  <span className="font-medium">{metrics.netLabel}</span>
                  <span className={`font-bold text-lg ${
                    metrics.isNegative ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {metrics.isNegative ? '-' : ''}{formatCommercialCurrency(Math.abs(metrics.netPosition))}
                  </span>
                </div>
              </div>
              
              {/* Alignment Indicator */}
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
                
                {/* Model-specific explanation */}
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

      {/* Proof Point */}
      <ProofPointCard />

      {/* 36-Month Projection (Collapsible) */}
      <Collapsible open={showProjection} onOpenChange={setShowProjection}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
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
          "Revenue share creates a partnership. The other models create a vendor relationship."
        </p>
      </div>
    </div>
  );
};
