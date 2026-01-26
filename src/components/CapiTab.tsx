// CAPI Tab - Sales-Led Revenue Deep Dive
// READ-ONLY - Shows CAPI commercial model comparison only
// No controls here - all configuration happens on Summary tab

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle2, AlertTriangle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { UnifiedResults, TimeframeType } from '@/types/scenarios';
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
}

export const CapiTab = ({ results, timeframe }: CapiTabProps) => {
  const [showProjection, setShowProjection] = useState(false);
  const [showAlignmentModels, setShowAlignmentModels] = useState(false);
  
  // Get CAPI configuration from results
  const capiConfig = results.capiCapabilities?.capiConfiguration;
  const yearlyCampaigns = capiConfig?.yearlyCampaigns || 0;
  const avgCampaignSpend = capiConfig?.avgCampaignSpend || 79000;
  
  // Calculate campaign portfolio economics
  const portfolio = useMemo(() => 
    calculateCampaignPortfolio(yearlyCampaigns, avgCampaignSpend),
    [yearlyCampaigns, avgCampaignSpend]
  );
  
  // Generate all three scenarios using CAPI-only revenue
  const scenarios = useMemo(() => generateAllScenarios(results), [results]);
  const recommendedScenario = scenarios.find(s => s.model.isRecommended) || scenarios[0];
  
  // Get deal breakdown for context
  const dealBreakdown = useMemo(() => getDealBreakdown(results, timeframe), [results, timeframe]);
  const capiMonthly = getCapiMonthlyIncremental(results);
  
  // Timeframe multiplier
  const periodMonths = timeframe === '3-year' ? 36 : 12;

  // CRITICAL: Correct calculations for each model
  const getModelMetrics = (scenario: typeof scenarios[0]) => {
    // For timeframe-aware calculations, use the dealBreakdown
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
    
    // Revenue Share and Annual Cap: Fee is based on CAPI revenue
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero: Your CAPI Configuration */}
      <Card className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg">Your CAPI Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Based on your Business Readiness Assessment
            </p>
          </div>
          <Badge variant="outline" className="bg-background">
            {yearlyCampaigns} campaigns/year
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold text-primary">{yearlyCampaigns}</p>
            <p className="text-xs text-muted-foreground">Yearly Campaigns</p>
          </div>
          <div className="text-center p-3 bg-background/60 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {formatCommercialCurrency(avgCampaignSpend)}
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
      </Card>

      {/* Campaign Economics Table - THE KEY INSIGHT */}
      <CampaignEconomicsTable avgCampaignSpend={avgCampaignSpend} />

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
