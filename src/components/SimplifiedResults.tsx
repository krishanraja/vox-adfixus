import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCw, DollarSign, TrendingUp, Calendar, Info, Calculator, AlertCircle, Sliders } from 'lucide-react';
import type { UnifiedResults, AssumptionOverrides } from '@/types/scenarios';
import { formatCurrency, formatPercentage, formatNumberWithCommas } from '@/utils/formatting';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { RISK_SCENARIO_DESCRIPTIONS, type RiskScenario } from '@/constants/riskScenarios';
import { aggregateDomainInputs } from '@/utils/domainAggregation';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AssumptionSlider } from './calculator/AssumptionSlider';
import { Badge } from './ui/badge';

interface SimplifiedResultsProps {
  results: UnifiedResults;
  riskScenario: RiskScenario;
  onRiskScenarioChange: (scenario: RiskScenario) => void;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
  onReset: () => void;
  onDownloadPDF: () => void;
}

export const SimplifiedResults = ({ 
  results, 
  riskScenario, 
  onRiskScenarioChange, 
  assumptionOverrides,
  onAssumptionOverridesChange,
  onReset, 
  onDownloadPDF 
}: SimplifiedResultsProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  // Auto-scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const aggregated = aggregateDomainInputs(
    results.inputs.selectedDomains, 
    results.inputs.displayCPM, 
    results.inputs.videoCPM
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const getScenarioLabel = () => {
    const deployment = results.scenario.deployment === 'single' ? 'Single Domain' :
                       results.scenario.deployment === 'multi' ? 'Multi-Domain' : 'Full Network';
    const scope = results.scenario.scope === 'id-only' ? 'ID Only' :
                  results.scenario.scope === 'id-capi' ? 'ID + CAPI' : 'All Features';
    
    return `${deployment} | ${scope}`;
  };

  // Track modified assumptions
  const getModifiedCount = () => {
    if (!assumptionOverrides) return 0;
    return Object.keys(assumptionOverrides).length;
  };

  const handleAssumptionChange = (field: keyof AssumptionOverrides, value: number) => {
    onAssumptionOverridesChange({
      ...assumptionOverrides,
      [field]: value,
    });
  };

  const resetAllAssumptions = () => {
    onAssumptionOverridesChange(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Risk Scenario Toggle */}
      <Card className="p-6 border-2 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Projection Scenario</h3>
              <p className="text-sm text-muted-foreground">
                Adjust for implementation risk and organizational readiness
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-5 w-5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <div className="space-y-2 text-xs">
                    <p><strong>Risk scenarios reflect real-world challenges:</strong></p>
                    <p>• Sales training & enablement gaps</p>
                    <p>• Technical integration delays</p>
                    <p>• Organizational change management</p>
                    <p>• Advertiser adoption timelines</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <RadioGroup value={riskScenario} onValueChange={(value) => onRiskScenarioChange(value as RiskScenario)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Conservative */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  riskScenario === 'conservative' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onRiskScenarioChange('conservative')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="conservative" id="conservative" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="conservative" className="font-semibold cursor-pointer">
                      Conservative
                    </Label>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {RISK_SCENARIO_DESCRIPTIONS.conservative}
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-medium">18-month ramp</div>
                      <div className="text-muted-foreground">60% adoption</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Moderate */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  riskScenario === 'moderate' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onRiskScenarioChange('moderate')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="moderate" className="font-semibold cursor-pointer">
                      Moderate
                    </Label>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {RISK_SCENARIO_DESCRIPTIONS.moderate}
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-medium">12-month ramp</div>
                      <div className="text-muted-foreground">80% adoption</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimistic */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  riskScenario === 'optimistic' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onRiskScenarioChange('optimistic')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="optimistic" id="optimistic" />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor="optimistic" className="font-semibold cursor-pointer">
                      Optimistic
                    </Label>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {RISK_SCENARIO_DESCRIPTIONS.optimistic}
                    </p>
                    <div className="mt-2 text-xs space-y-1">
                      <div className="font-medium">6-month ramp</div>
                      <div className="text-muted-foreground">100% adoption</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RadioGroup>
          
          {/* Risk adjustment summary */}
          {results.riskAdjustmentSummary && results.riskAdjustmentSummary.adjustmentPercentage > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Risk adjustment reduced projections by {results.riskAdjustmentSummary.adjustmentPercentage.toFixed(0)}% from {formatCurrency(results.riskAdjustmentSummary.unadjustedMonthlyUplift)}/mo to {formatCurrency(results.riskAdjustmentSummary.adjustedMonthlyUplift)}/mo
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Top-Level Summary */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Incremental Revenue to Vox</h2>
          <p className="text-sm text-muted-foreground">{getScenarioLabel()}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">MONTHLY</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(results.totals.totalMonthlyUplift)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">ANNUAL</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(results.totals.totalAnnualUplift)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">3-YEAR</span>
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(results.totals.threeYearProjection)}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm font-medium text-muted-foreground mb-3">Revenue Sources:</div>
            <div className="space-y-2">
              {(() => {
                // Calculate percentages based on actual displayed monthly uplift values
                const totalMonthly = results.totals.totalMonthlyUplift;
                const idPercent = totalMonthly > 0 ? (results.idInfrastructure.monthlyUplift / totalMonthly) * 100 : 0;
                const capiPercent = results.capiCapabilities && totalMonthly > 0 ? (results.capiCapabilities.monthlyUplift / totalMonthly) * 100 : 0;
                const performancePercent = results.mediaPerformance && totalMonthly > 0 ? (results.mediaPerformance.monthlyUplift / totalMonthly) * 100 : 0;
                
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-500"
                          style={{ width: `${idPercent}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap">
                        {formatPercentage(idPercent, 0)} ID Infrastructure
                      </div>
                    </div>
                    
                    {results.capiCapabilities && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-accent h-full transition-all duration-500"
                            style={{ width: `${capiPercent}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium whitespace-nowrap">
                          {formatPercentage(capiPercent, 0)} CAPI
                        </div>
                      </div>
                    )}
                    
                    {results.mediaPerformance && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-success h-full transition-all duration-500"
                            style={{ width: `${performancePercent}%` }}
                          />
                        </div>
                        <div className="text-sm font-medium whitespace-nowrap">
                          {formatPercentage(performancePercent, 0)} Media Performance
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <Button onClick={onDownloadPDF} size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
            <Button onClick={onReset} variant="outline" size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Adjust Scenarios
            </Button>
          </div>
        </div>
      </Card>

      {/* Expandable Details */}
      <div className="space-y-4">
        {/* ID Infrastructure Details */}
        <Collapsible open={expandedSections.includes('id')}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger 
              onClick={() => toggleSection('id')}
              className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">ID Infrastructure</h3>
                  <p className="text-sm text-muted-foreground">{formatCurrency(results.idInfrastructure.monthlyUplift)}/month</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('id') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-6 pt-0 space-y-4 border-t border-border">
                {/* Sub-section 1: Safari/iOS Addressability Recovery */}
                <div className="border-l-4 border-primary/50 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Safari/iOS Addressability Recovery</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-2 text-xs">
                              <p><strong>Durable ID Benefit:</strong></p>
                              <p>• Safari traffic: 35% of {formatNumberWithCommas(aggregated.totalMonthlyPageviews)} pageviews</p>
                              <p>• Without AdFixus: 20% addressable (IDs expire after 7 days)</p>
                              <p>• With AdFixus: 85% addressable (durable ID recognizes returning users)</p>
                              <p>• Newly addressable: {formatPercentage(results.idInfrastructure.addressabilityRecovery, 1)} of Safari traffic</p>
                              <p>• CPM uplift: ${aggregated.displayCPM.toFixed(2)} → ${(aggregated.displayCPM * 1.25).toFixed(2)} (25%)</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-semibold">{formatCurrency(results.idInfrastructure.details.addressabilityRevenue)}/mo</span>
                  </div>
                </div>

                {/* Sub-section 2: CDP/Martech Cost Reduction */}
                <div className="border-l-4 border-primary/30 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">CDP/Martech Cost Reduction</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-2 text-xs">
                              <p><strong>Benefit #5: Platform Cost Savings</strong></p>
                              <p>• Estimated current CDP costs: $50K/month</p>
                              <p>• AdFixus reduces ID bloat by {formatPercentage(results.idInfrastructure.details.idReductionPercentage, 0)}</p>
                              <p>• Cost reduction: 35% of platform fees (30-40% range)</p>
                              <p>• Monthly savings: $50K × 35% = {formatCurrency(results.idInfrastructure.cdpSavings)}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-semibold">{formatCurrency(results.idInfrastructure.details.cdpSavingsRevenue)}/mo</span>
                  </div>
                </div>

                <Separator />
                
                <div className="flex items-center justify-between font-semibold pt-2">
                  <span>Total ID Infrastructure</span>
                  <span className="text-primary">{formatCurrency(results.idInfrastructure.monthlyUplift)}/mo</span>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* CAPI Details */}
        {results.capiCapabilities && (
          <Collapsible open={expandedSections.includes('capi')}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger 
                onClick={() => toggleSection('capi')}
                className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">CAPI Capabilities</h3>
                    <p className="text-sm text-muted-foreground">{formatCurrency(results.capiCapabilities.monthlyUplift)}/month from {results.inputs.capiCampaignsPerMonth} campaigns</p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('capi') ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-6 pt-0 space-y-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on {results.inputs.capiCampaignsPerMonth} campaigns per month at {formatCurrency(results.inputs.avgCampaignSpend)} average spend using AdFixus Stream (CAPI). Each campaign requires individual deployment.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Match Rate</div>
                      <div className="text-lg font-semibold">{formatPercentage(results.capiCapabilities.details.improvedMatchRate, 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversion Improvement</div>
                      <div className="text-lg font-semibold">+{formatPercentage(results.capiCapabilities.details.conversionImprovement, 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Campaign Service Fees</div>
                      <div className="text-lg font-semibold">{formatCurrency(results.capiCapabilities.campaignServiceFees)}/mo</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">CTR Improvement</div>
                      <div className="text-lg font-semibold">+{formatPercentage(results.capiCapabilities.details.ctrImprovement, 0)}</div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Media Performance Details */}
        {results.mediaPerformance && (
          <Collapsible open={expandedSections.includes('performance')}>
            <Card className="overflow-hidden">
              <CollapsibleTrigger 
                onClick={() => toggleSection('performance')}
                className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Media Performance</h3>
                    <p className="text-sm text-muted-foreground">{formatCurrency(results.mediaPerformance.monthlyUplift)}/month from premium inventory</p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('performance') ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-6 pt-0 space-y-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    25% yield uplift applied to 30% of inventory sold as premium/performance campaigns.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">ROAS Improvement</div>
                      <div className="text-lg font-semibold">+{formatPercentage(results.mediaPerformance.advertiserROASImprovement, 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Make-Good Reduction</div>
                      <div className="text-lg font-semibold">{formatPercentage(results.mediaPerformance.makeGoodReduction, 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Premium Pricing Uplift</div>
                      <div className="text-lg font-semibold">{formatCurrency(results.mediaPerformance.premiumPricingPower)}/mo</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Make-Good Savings</div>
                      <div className="text-lg font-semibold">{formatCurrency(results.mediaPerformance.details.makeGoodSavings)}/mo</div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Calculation Methodology */}
        <Collapsible
          open={expandedSections.includes('methodology')}
          onOpenChange={() => toggleSection('methodology')}
        >
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    How We Calculated This
                  </CardTitle>
                  {expandedSections.includes('methodology') ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Data Sources</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Industry benchmarks from public research (IAB, eMarketer)</li>
                    <li>• AdFixus case studies (Carsales, Seven West Media)</li>
                    <li>• Browser market share: Chrome 50%, Safari/iOS 35%, Other 15%</li>
                    <li>• CDP vendor pricing models (estimated)</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Your Inputs</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Selected Domains: {results.inputs.selectedDomains.length} ({aggregated.selectedDomains.map(d => d.name).join(', ')})</li>
                    <li>• Total Monthly Pageviews: {formatNumberWithCommas(aggregated.totalMonthlyPageviews)}</li>
                    <li>• Display CPM: ${aggregated.displayCPM.toFixed(2)}</li>
                    <li>• Video CPM: ${aggregated.videoCPM.toFixed(2)}</li>
                    <li>• Display/Video Split: {aggregated.weightedDisplayVideoSplit.toFixed(0)}% / {(100 - aggregated.weightedDisplayVideoSplit).toFixed(0)}%</li>
                    <li>• CAPI Campaigns: {results.inputs.capiCampaignsPerMonth} per month</li>
                    <li>• Avg Campaign Spend: {formatCurrency(results.inputs.avgCampaignSpend)}</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Assumptions</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Safari addressability: 20% without durable ID → 85% with AdFixus</li>
                    <li>• Durable ID enables user recognition beyond 7-day cookie limit</li>
                    <li>• CPM uplift: 25% on newly addressable inventory</li>
                    <li>• CDP cost reduction: 35% of platform fees (from reduced ID bloat)</li>
                    <li>• CAPI service fee: 12.5% of campaign spend</li>
                    <li>• Premium inventory: 30% of total (receives 25% yield uplift)</li>
                    <li>• Ramp-up schedule: 15% (M1-3), 35% (M4-6), 100% (M7+)</li>
                  </ul>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Advanced Assumptions */}
        <Collapsible open={expandedSections.includes('assumptions')}>
          <Card className="overflow-hidden border-accent/20">
            <CollapsibleTrigger 
              onClick={() => toggleSection('assumptions')}
              className="w-full p-6 flex items-center justify-between hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Sliders className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Advanced Assumptions</h3>
                    {getModifiedCount() > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {getModifiedCount()} modified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Customize projections based on your business intelligence</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('assumptions') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-6 pt-0 space-y-6 border-t border-border">
                {getModifiedCount() > 0 && (
                  <Alert className="bg-accent/5 border-accent/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You're using custom assumptions. Projections reflect your adjusted values.
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-2 text-accent"
                        onClick={resetAllAssumptions}
                      >
                        Reset all to defaults
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* ID Infrastructure Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">ID Infrastructure</h4>
                  
                  <AssumptionSlider
                    label="Safari Baseline Addressability"
                    description="What % of Safari users can you reach today?"
                    value={(assumptionOverrides?.safariBaselineAddressability ?? 0.20) * 100}
                    defaultValue={20}
                    min={10}
                    max={40}
                    step={1}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => handleAssumptionChange('safariBaselineAddressability', v / 100)}
                    tooltipContent="Without durable IDs, Safari's 7-day ITP limit significantly reduces addressability. Industry average is 20%, but some publishers achieve 25-30% through first-party relationships."
                  />

                  <AssumptionSlider
                    label="Safari with Durable ID"
                    description="Expected addressability with persistent IDs"
                    value={(assumptionOverrides?.safariWithDurableId ?? 0.85) * 100}
                    defaultValue={85}
                    min={60}
                    max={95}
                    step={5}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => handleAssumptionChange('safariWithDurableId', v / 100)}
                    tooltipContent="Durable IDs recognize returning users beyond Safari's 7-day limit. Conservative estimate is 85%, though some publishers achieve 90%+ with strong authentication."
                  />

                  <AssumptionSlider
                    label="CPM Improvement on Addressable Inventory"
                    description="How much more do addressable impressions earn?"
                    value={(assumptionOverrides?.cpmUpliftFactor ?? 0.25) * 100}
                    defaultValue={25}
                    min={10}
                    max={40}
                    step={5}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => handleAssumptionChange('cpmUpliftFactor', v / 100)}
                    tooltipContent="Addressable inventory commands premium CPMs due to better targeting and measurement. Industry benchmarks show 20-30% uplift, with performance campaigns seeing up to 40%."
                  />

                  <AssumptionSlider
                    label="CDP Platform Cost Savings"
                    description="ID bloat reduction impact on fees"
                    value={(assumptionOverrides?.cdpCostReduction ?? 0.125) * 100}
                    defaultValue={12.5}
                    min={5}
                    max={25}
                    step={2.5}
                    formatValue={(v) => `${v}%`}
                    onChange={(v) => handleAssumptionChange('cdpCostReduction', v / 100)}
                    tooltipContent="Based on ~18% ID overlap observed in production. Reducing ID bloat from 3.0x to 1.1x per user lowers CDP/martech platform costs that charge per profile or API call."
                  />
                </div>

                {/* CAPI Section (if applicable) */}
                {results.capiCapabilities && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">CAPI Capabilities</h4>
                      
                      <AssumptionSlider
                        label="CAPI Service Fee"
                        description="% of campaign spend charged as service fee"
                        value={(assumptionOverrides?.capiServiceFee ?? 0.125) * 100}
                        defaultValue={12.5}
                        min={10}
                        max={20}
                        step={2.5}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('capiServiceFee', v / 100)}
                        tooltipContent="Service fee for managed CAPI campaigns. Industry standard is 10-15% for self-serve, 15-20% for managed services with optimization."
                      />

                      <AssumptionSlider
                        label="CAPI Match Rate with AdFixus"
                        description="Expected match rate after implementation"
                        value={(assumptionOverrides?.capiMatchRate ?? 0.75) * 100}
                        defaultValue={75}
                        min={50}
                        max={90}
                        step={5}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('capiMatchRate', v / 100)}
                        tooltipContent="Match rate improvement from baseline 30% to 75%+ with AdFixus. Conservative estimate is 75%, though premium publishers with strong authentication can achieve 80-85%."
                      />
                    </div>
                  </>
                )}

                {/* Media Performance Section (if applicable) */}
                {results.mediaPerformance && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Media Performance</h4>
                      
                      <AssumptionSlider
                        label="Premium Inventory %"
                        description="% of inventory sold at premium rates"
                        value={(assumptionOverrides?.premiumInventoryShare ?? 0.30) * 100}
                        defaultValue={30}
                        min={20}
                        max={50}
                        step={5}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('premiumInventoryShare', v / 100)}
                        tooltipContent="Percentage of total inventory sold as premium or performance-based campaigns. Premium publishers typically range from 25-40%, with top-tier reaching 50%."
                      />

                      <AssumptionSlider
                        label="Premium Pricing Uplift"
                        description="% increase on premium inventory"
                        value={(assumptionOverrides?.premiumYieldUplift ?? 0.25) * 100}
                        defaultValue={25}
                        min={15}
                        max={40}
                        step={5}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('premiumYieldUplift', v / 100)}
                        tooltipContent="Additional yield on premium inventory due to better performance and measurement. Industry benchmarks show 20-30% uplift, with guaranteed campaigns seeing up to 40%."
                      />
                    </div>
                  </>
                )}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};
