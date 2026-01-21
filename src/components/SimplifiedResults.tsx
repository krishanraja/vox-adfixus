import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCw, TrendingUp, ChevronDown, Info } from 'lucide-react';
import type { UnifiedResults, AssumptionOverrides } from '@/types/scenarios';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { type RiskScenario } from '@/constants/riskScenarios';
import { CAPI_PRICING_MODEL } from '@/constants/industryBenchmarks';
import { useState, useEffect, useMemo } from 'react';
import { UnifiedCalculationEngine } from '@/utils/unifiedCalculationEngine';
import { CostRevenueChart } from './results/CostRevenueChart';
import { AdvancedSettingsSheet } from './results/AdvancedSettingsSheet';
import { PricingModelCharts } from './PricingModelCharts';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface SimplifiedResultsProps {
  results: UnifiedResults;
  riskScenario: RiskScenario;
  onRiskScenarioChange: (scenario: RiskScenario) => void;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
  onInputChange: (field: string, value: number) => void;
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
  const [showValueStory, setShowValueStory] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const monthlyProjections = useMemo(() => 
    UnifiedCalculationEngine.generateMonthlyProjection(results),
    [results]
  );

  // Calculate net revenue (after AdFixus fees)
  const netAnnualRevenue = results.totals.totalAnnualUplift;
  const netMonthlyRevenue = results.totals.totalMonthlyUplift;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ═══════════════════════════════════════════════════════════════════════
          TIER 1: THE HERO - Always Visible
          ═══════════════════════════════════════════════════════════════════════ */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
        <div className="space-y-6">
          {/* Settings icon in top right */}
          <div className="flex justify-end">
            <AdvancedSettingsSheet 
              results={results}
              assumptionOverrides={assumptionOverrides}
              onAssumptionOverridesChange={onAssumptionOverridesChange}
            />
          </div>

          {/* THE NUMBER */}
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Net Revenue to Vox
            </p>
            <div className="text-6xl md:text-7xl font-bold text-primary">
              {formatCurrency(netAnnualRevenue)}
              <span className="text-2xl md:text-3xl text-muted-foreground font-normal">/year</span>
            </div>
            <p className="text-lg text-muted-foreground">
              {formatCurrency(netMonthlyRevenue)}/month after all fees
            </p>
          </div>

          {/* THE CHART */}
          <div className="mt-8">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-muted-foreground">
                CAPI Pricing: How the Cap Works
              </p>
            </div>
            <CostRevenueChart compact />
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-center">
              <p className="font-semibold text-green-800 dark:text-green-300">
                "Costs are capped. Revenue is not."
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Every dollar above $240K campaign spend = 100% to Vox
              </p>
            </div>
          </div>

          {/* THE THREE TOGGLES */}
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Toggle 1: Outlook */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Outlook
                </Label>
                <RadioGroup 
                  value={riskScenario} 
                  onValueChange={(v) => onRiskScenarioChange(v as RiskScenario)}
                  className="flex gap-1"
                >
                  {(['conservative', 'moderate', 'optimistic'] as const).map((scenario) => (
                    <div key={scenario} className="flex-1">
                      <RadioGroupItem
                        value={scenario}
                        id={`outlook-${scenario}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`outlook-${scenario}`}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium border rounded-md cursor-pointer transition-all
                          peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                          hover:bg-muted"
                      >
                        {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Toggle 2: ROI Phase Focus */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  POC ROI
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Return on investment during the 3-month proof of concept at $5K/mo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex items-center justify-center h-10 bg-green-100 dark:bg-green-900/30 rounded-md border border-green-300 dark:border-green-700">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.roiAnalysis.roiMultiple.pocPhase.toFixed(1)}x
                  </span>
                </div>
              </div>

              {/* Toggle 3: Full Contract ROI */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  Full Contract ROI
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">Return on investment at full contract pricing of $19.9K/mo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="flex items-center justify-center h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-md border border-emerald-300 dark:border-emerald-700">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {results.roiAnalysis.roiMultiple.fullContract.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 justify-center mt-8 pt-6 border-t border-border">
            <Button onClick={onDownloadPDF} size="lg" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF Report
            </Button>
            <Button onClick={onReset} variant="outline" size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Adjust Inputs
            </Button>
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════════
          TIER 2: VALUE STORY - One Click to Expand
          ═══════════════════════════════════════════════════════════════════════ */}
      <Collapsible open={showValueStory} onOpenChange={setShowValueStory}>
        <Card className="overflow-hidden border-2 border-green-500/20">
          <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Why This Deal?</h3>
                <p className="text-sm text-muted-foreground">Value highlights, pricing model, and 12-month projection</p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 transition-transform ${showValueStory ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="p-6 pt-0 space-y-8 border-t border-border">
              {/* Value Highlights Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700 text-center">
                  <div className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-1">
                    Contract Discount
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {CAPI_PRICING_MODEL.VALUE_HIGHLIGHTS.CONTRACT_DISCOUNT_PERCENT}%
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                    vs rate card
                  </div>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700 text-center">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">
                    POC Discount
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {CAPI_PRICING_MODEL.VALUE_HIGHLIGHTS.POC_DISCOUNT_PERCENT}%
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    full service, half price
                  </div>
                </div>
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-300 dark:border-purple-700 text-center">
                  <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">
                    Waived Fee
                  </div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${(CAPI_PRICING_MODEL.VALUE_HIGHLIGHTS.WAIVED_ONBOARDING_FEE / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    onboarding waived
                  </div>
                </div>
                <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-300 dark:border-orange-700 text-center">
                  <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-1">
                    Campaign Cap
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${(CAPI_PRICING_MODEL.CAMPAIGN_CAP_MONTHLY / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                    max fee per campaign
                  </div>
                </div>
              </div>

              {/* Revenue Sources Breakdown */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Revenue Sources</h4>
                {(() => {
                  const totalMonthly = results.totals.totalMonthlyUplift;
                  const sources = [
                    { name: 'ID Infrastructure', value: results.idInfrastructure.monthlyUplift, color: 'bg-primary' },
                    results.capiCapabilities && { name: 'CAPI', value: results.capiCapabilities.monthlyUplift, color: 'bg-accent' },
                    results.mediaPerformance && { name: 'Media Performance', value: results.mediaPerformance.monthlyUplift, color: 'bg-green-500' },
                  ].filter(Boolean) as { name: string; value: number; color: string }[];

                  return sources.map((source) => {
                    const percent = totalMonthly > 0 ? (source.value / totalMonthly) * 100 : 0;
                    return (
                      <div key={source.name} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-muted-foreground">{source.name}</div>
                        <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                          <div className={`${source.color} h-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                        </div>
                        <div className="w-20 text-sm font-medium text-right">
                          {formatCurrency(source.value)}/mo
                        </div>
                        <div className="w-12 text-xs text-muted-foreground text-right">
                          {formatPercentage(percent, 0)}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* 12-Month Projection Chart */}
              <div>
                <h4 className="font-semibold text-sm mb-4">12-Month Projection</h4>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyProjections}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} stroke="currentColor" />
                      <YAxis 
                        yAxisId="revenue"
                        tick={{ fontSize: 10 }}
                        stroke="currentColor"
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                      />
                      <YAxis 
                        yAxisId="roi"
                        orientation="right"
                        tick={{ fontSize: 10 }}
                        stroke="currentColor"
                        domain={[0, 'auto']}
                        tickFormatter={(value) => `${value.toFixed(1)}x`}
                      />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background p-3 rounded-lg shadow-lg border text-sm">
                                <p className="font-semibold mb-2">{data.monthLabel}</p>
                                <div className="space-y-1">
                                  <div className="flex justify-between gap-4">
                                    <span className="text-blue-600">Revenue Uplift:</span>
                                    <span className="font-semibold">{formatCurrency(data.uplift)}</span>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <span className="text-emerald-600">ROI Multiple:</span>
                                    <span className="font-semibold">{data.roiMultiple.toFixed(1)}x</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend iconType="line" />
                      <Line yAxisId="revenue" type="monotone" dataKey="uplift" stroke="#3b82f6" strokeWidth={2} name="Revenue Uplift" dot={{ fill: '#3b82f6', r: 3 }} />
                      <Line yAxisId="roi" type="monotone" dataKey="roiMultiple" stroke="#10b981" strokeWidth={2} name="ROI Multiple" dot={{ fill: '#10b981', r: 3 }} strokeDasharray="5 5" />
                      <ReferenceLine x="Month 3" yAxisId="revenue" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'POC → Full', position: 'top', fill: '#f59e0b', fontSize: 10 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pricing Model Deep Dive */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-sm mb-4">CAPI Pricing Model: Why 12.5% + Cap Works</h4>
                <PricingModelCharts />
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
