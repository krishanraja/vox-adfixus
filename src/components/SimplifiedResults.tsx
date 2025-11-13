import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCw, DollarSign, TrendingUp, Calendar, Info, Calculator, AlertCircle, Sliders, PiggyBank, LineChart as LineChartIcon, Target, Briefcase, Code, Users, Building, TrendingUp as TrendingUpIcon, Settings } from 'lucide-react';
import type { UnifiedResults, AssumptionOverrides } from '@/types/scenarios';
import { formatCurrency, formatPercentage, formatNumberWithCommas } from '@/utils/formatting';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { RISK_SCENARIO_DESCRIPTIONS, type RiskScenario } from '@/constants/riskScenarios';
import { READINESS_PRESETS, READINESS_DESCRIPTIONS } from '@/constants/readinessFactors';
import { aggregateDomainInputs } from '@/utils/domainAggregation';
import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AssumptionSlider } from './calculator/AssumptionSlider';
import { Badge } from './ui/badge';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';

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

  // Generate monthly projections with ROI data
  const monthlyProjections = useMemo(() => 
    UnifiedCalculationEngine.generateMonthlyProjection(results),
    [results]
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
  
  // Get current readiness factors or defaults
  const readinessFactors = assumptionOverrides?.readinessFactors || {};
  
  const handleReadinessChange = (field: string, value: number) => {
    onAssumptionOverridesChange({
      ...assumptionOverrides,
      readinessFactors: {
        ...readinessFactors,
        [field]: value,
      },
    });
  };
  
  const applyReadinessPreset = (preset: 'conservative' | 'normal' | 'optimistic') => {
    onAssumptionOverridesChange({
      ...assumptionOverrides,
      readinessFactors: READINESS_PRESETS[preset],
    });
  };

  return (
    <div className="space-y-6">
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

      {/* Simplified ROI Card */}
      <Card className="p-6 border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            Return on Investment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue benefit multiple vs AdFixus investment
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* POC Phase ROI */}
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                POC Phase (Months 1-3)
              </div>
              <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                {results.roiAnalysis.roiMultiple.pocPhase.toFixed(1)}x
              </div>
              <div className="text-xs text-muted-foreground">
                ROI Multiple
              </div>
            </div>

            {/* Full Contract ROI */}
            <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Full Contract (Month 4+)
              </div>
              <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {results.roiAnalysis.roiMultiple.fullContract.toFixed(1)}x
              </div>
              <div className="text-xs text-muted-foreground">
                ROI Multiple
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Full functionality during POC at discounted rate, transitioning to standard contract pricing
          </div>
        </CardContent>
      </Card>

      {/* Monthly Projection Chart */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-6 w-6" />
            12-Month Revenue & ROI Projection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revenue uplift and ROI multiple over time with implementation ramp-up
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyProjections}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                />
                
                {/* Left Y-Axis: Revenue in dollars */}
                <YAxis 
                  yAxisId="revenue"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  label={{ value: 'Monthly Revenue Uplift', angle: -90, position: 'insideLeft' }}
                />
                
                {/* Right Y-Axis: ROI multiple */}
                <YAxis 
                  yAxisId="roi"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="currentColor"
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value.toFixed(1)}x`}
                  label={{ value: 'ROI Multiple', angle: 90, position: 'insideRight' }}
                />
                
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border">
                          <p className="font-semibold mb-2">{data.monthLabel}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Revenue Uplift:</span>
                              <span className="font-semibold text-blue-600">
                                {formatCurrency(data.uplift)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">ROI Multiple:</span>
                              <span className="font-semibold text-emerald-600">
                                {data.roiMultiple.toFixed(1)}x
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              Ramp-up: {(data.rampUpFactor * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />
                
                {/* Revenue Uplift Line */}
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="uplift"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Revenue Uplift"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* ROI Multiple Line */}
                <Line
                  yAxisId="roi"
                  type="monotone"
                  dataKey="roiMultiple"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="ROI Multiple"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray="5 5"
                />
                
                {/* Vertical line at month 3 (POC end) */}
                <ReferenceLine 
                  x="Month 3"
                  yAxisId="revenue"
                  stroke="#f59e0b" 
                  strokeDasharray="3 3"
                  label={{ value: 'POC → Full Contract', position: 'top', fill: '#f59e0b', fontSize: 11 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          {/* Chart Legend/Key */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-blue-500"></div>
              <span className="text-muted-foreground">Revenue Uplift (Left Axis)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-500 border-t-2 border-dashed border-green-500"></div>
              <span className="text-muted-foreground">ROI Multiple (Right Axis)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-orange-500 border-t-2 border-dashed border-orange-500"></div>
              <span className="text-muted-foreground">POC Phase Transition</span>
            </div>
          </div>
        </CardContent>
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
                              <p>• Without AdFixus: 55% addressable (IDs expire after ~7 days)</p>
                              <p>• With AdFixus: 85% addressable (durable ID recognizes returning users)</p>
                              <p>• Newly addressable: {formatPercentage(results.idInfrastructure.addressabilityRecovery, 1)} of Safari traffic (~30% improvement)</p>
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
                              <p>• Cost reduction: 10-18% of platform fees (mid-range: 14%)</p>
                              <p>• Monthly savings: {formatCurrency(results.idInfrastructure.cdpSavings)}</p>
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
                    <li>• Safari addressability: 55% without durable ID → 85% with AdFixus (~30% improvement)</li>
                    <li>• Durable ID enables user recognition beyond 7-day cookie limit</li>
                    <li>• CPM uplift: 25% on newly addressable inventory</li>
                    <li>• CDP cost reduction: 10-18% of platform fees (from reduced ID bloat)</li>
                    <li>• CAPI service fee: 12.5% of campaign spend (AdFixus revenue)</li>
                    <li>• Premium inventory: 30% of total (receives 25% yield uplift)</li>
                    <li>• Ramp-up schedule: varies by risk scenario</li>
                  </ul>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Business Readiness Assessment */}
        <Collapsible open={expandedSections.includes('readiness')}>
          <Card className="overflow-hidden border-primary/20">
            <CollapsibleTrigger 
              onClick={() => toggleSection('readiness')}
              className="w-full p-6 flex items-center justify-between hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Business Readiness Assessment</h3>
                    {readinessFactors && Object.keys(readinessFactors).length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {Object.keys(readinessFactors).length} factors set
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Adjust ROI based on organizational readiness</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('readiness') ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-6 pt-0 space-y-6 border-t border-border">
                <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                    These factors reflect real-world implementation challenges based on publisher case studies.
                    Adjust based on your organization's specific readiness and constraints.
                  </AlertDescription>
                </Alert>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Quick Assessment</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyReadinessPreset('conservative')}
                      className="text-xs"
                    >
                      Conservative
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyReadinessPreset('normal')}
                      className="text-xs"
                    >
                      Normal
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyReadinessPreset('optimistic')}
                      className="text-xs"
                    >
                      Optimistic
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Sales & Commercial */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Sales & Commercial Execution
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.salesReadiness.title}
                    description={READINESS_DESCRIPTIONS.salesReadiness.description}
                    value={(readinessFactors?.salesReadiness ?? 0.75) * 100}
                    defaultValue={75}
                    min={50}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.salesReadiness.high : v >= 70 ? READINESS_DESCRIPTIONS.salesReadiness.medium : READINESS_DESCRIPTIONS.salesReadiness.low}
                    onChange={(v) => handleReadinessChange('salesReadiness', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.salesReadiness.tooltip}
                  />
                </div>

                {/* Technical Deployment */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" /> Technical Deployment
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.technicalDeploymentMonths.title}
                    description={READINESS_DESCRIPTIONS.technicalDeploymentMonths.description}
                    value={readinessFactors?.technicalDeploymentMonths ?? 12}
                    defaultValue={12}
                    min={3}
                    max={18}
                    step={3}
                    formatValue={(v) => `${v} months`}
                    onChange={(v) => handleReadinessChange('technicalDeploymentMonths', v)}
                    tooltipContent={READINESS_DESCRIPTIONS.technicalDeploymentMonths.tooltip}
                  />
                </div>

                {/* Advertiser Adoption */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> Advertiser & Agency Buy-In
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.advertiserBuyIn.title}
                    description={READINESS_DESCRIPTIONS.advertiserBuyIn.description}
                    value={(readinessFactors?.advertiserBuyIn ?? 0.8) * 100}
                    defaultValue={80}
                    min={60}
                    max={100}
                    step={10}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.advertiserBuyIn.high : v >= 75 ? READINESS_DESCRIPTIONS.advertiserBuyIn.medium : READINESS_DESCRIPTIONS.advertiserBuyIn.low}
                    onChange={(v) => handleReadinessChange('advertiserBuyIn', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.advertiserBuyIn.tooltip}
                  />
                </div>

                {/* Organizational Ownership */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Building className="h-4 w-4" /> Organizational Ownership
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.organizationalOwnership.title}
                    description={READINESS_DESCRIPTIONS.organizationalOwnership.description}
                    value={(readinessFactors?.organizationalOwnership ?? 0.8) * 100}
                    defaultValue={80}
                    min={60}
                    max={100}
                    step={10}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.organizationalOwnership.high : v >= 75 ? READINESS_DESCRIPTIONS.organizationalOwnership.medium : READINESS_DESCRIPTIONS.organizationalOwnership.low}
                    onChange={(v) => handleReadinessChange('organizationalOwnership', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.organizationalOwnership.tooltip}
                  />
                </div>

                {/* Market Conditions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <TrendingUpIcon className="h-4 w-4" /> Market Conditions
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.marketConditions.title}
                    description={READINESS_DESCRIPTIONS.marketConditions.description}
                    value={(readinessFactors?.marketConditions ?? 0.85) * 100}
                    defaultValue={85}
                    min={70}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.marketConditions.high : v >= 80 ? READINESS_DESCRIPTIONS.marketConditions.medium : READINESS_DESCRIPTIONS.marketConditions.low}
                    onChange={(v) => handleReadinessChange('marketConditions', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.marketConditions.tooltip}
                  />
                </div>

                {/* Training & Enablement */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" /> Training & Enablement
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.trainingGaps.title}
                    description={READINESS_DESCRIPTIONS.trainingGaps.description}
                    value={(readinessFactors?.trainingGaps ?? 0.75) * 100}
                    defaultValue={75}
                    min={50}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.trainingGaps.high : v >= 70 ? READINESS_DESCRIPTIONS.trainingGaps.medium : READINESS_DESCRIPTIONS.trainingGaps.low}
                    onChange={(v) => handleReadinessChange('trainingGaps', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.trainingGaps.tooltip}
                  />
                </div>

                {/* Integration Complexity */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Code className="h-4 w-4" /> Integration Complexity
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.integrationComplexity.title}
                    description={READINESS_DESCRIPTIONS.integrationComplexity.description}
                    value={(readinessFactors?.integrationComplexity ?? 0.8) * 100}
                    defaultValue={80}
                    min={60}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.integrationComplexity.high : v >= 75 ? READINESS_DESCRIPTIONS.integrationComplexity.medium : READINESS_DESCRIPTIONS.integrationComplexity.low}
                    onChange={(v) => handleReadinessChange('integrationComplexity', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.integrationComplexity.tooltip}
                  />
                </div>

                {/* Data Quality */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" /> First-Party Data Quality
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.dataQuality.title}
                    description={READINESS_DESCRIPTIONS.dataQuality.description}
                    value={(readinessFactors?.dataQuality ?? 0.8) * 100}
                    defaultValue={80}
                    min={60}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.dataQuality.high : v >= 75 ? READINESS_DESCRIPTIONS.dataQuality.medium : READINESS_DESCRIPTIONS.dataQuality.low}
                    onChange={(v) => handleReadinessChange('dataQuality', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.dataQuality.tooltip}
                  />
                </div>

                {/* Resource Availability */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Resource Availability
                  </h4>
                  
                  <AssumptionSlider
                    label={READINESS_DESCRIPTIONS.resourceAvailability.title}
                    description={READINESS_DESCRIPTIONS.resourceAvailability.description}
                    value={(readinessFactors?.resourceAvailability ?? 0.75) * 100}
                    defaultValue={75}
                    min={60}
                    max={100}
                    step={5}
                    formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.resourceAvailability.high : v >= 75 ? READINESS_DESCRIPTIONS.resourceAvailability.medium : READINESS_DESCRIPTIONS.resourceAvailability.low}
                    onChange={(v) => handleReadinessChange('resourceAvailability', v / 100)}
                    tooltipContent={READINESS_DESCRIPTIONS.resourceAvailability.tooltip}
                  />
                </div>

                <Separator />

                {/* Advanced Technical Settings (Nested Collapsible) */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    Advanced Technical Settings
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4 pt-4 border-t">
                    {/* ID Infrastructure Section */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">ID Infrastructure</h4>
                      
                      <AssumptionSlider
                        label="Safari Baseline Addressability"
                        description="What % of Safari users can you reach today?"
                        value={(assumptionOverrides?.safariBaselineAddressability ?? 0.55) * 100}
                        defaultValue={55}
                        min={40}
                        max={70}
                        step={1}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('safariBaselineAddressability', v / 100)}
                        tooltipContent="With Safari's 7-day ITP limit, tracking typically works for ~7 days. Industry average is 55%, with some publishers achieving 60-65% through first-party relationships."
                      />

                      <AssumptionSlider
                        label="Safari with Durable ID"
                        description="Expected addressability with persistent IDs"
                        value={(assumptionOverrides?.safariWithDurableId ?? 0.85) * 100}
                        defaultValue={85}
                        min={75}
                        max={95}
                        step={5}
                        formatValue={(v) => `${v}%`}
                        onChange={(v) => handleAssumptionChange('safariWithDurableId', v / 100)}
                        tooltipContent="Durable IDs recognize returning users beyond Safari's 7-day limit. Conservative estimate is 85%, with some publishers achieving 90%+ with strong authentication."
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
                        value={(assumptionOverrides?.cdpCostReduction ?? 0.14) * 100}
                        defaultValue={14}
                        min={10}
                        max={18}
                        step={1}
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
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};
