import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, RefreshCw, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { UnifiedResults } from '@/types/scenarios';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SimplifiedResultsProps {
  results: UnifiedResults;
  onReset: () => void;
  onDownloadPDF: () => void;
}

export const SimplifiedResults = ({ results, onReset, onDownloadPDF }: SimplifiedResultsProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const getScenarioLabel = () => {
    const deployment = results.scenario.deployment === 'single' ? 'Single Domain' :
                       results.scenario.deployment === 'multi' ? 'Multi-Domain' : 'Full Network';
    const addressability = results.scenario.addressability === 'limited' ? 'Limited Safari' :
                           results.scenario.addressability === 'partial' ? 'Partial Safari' : 'Full Safari';
    const scope = results.scenario.scope === 'id-only' ? 'ID Only' :
                  results.scenario.scope === 'id-capi' ? 'ID + CAPI' : 'All Features';
    
    return `${deployment} | ${addressability} | ${scope}`;
  };

  return (
    <div className="space-y-6">
      {/* Top-Level Summary */}
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Your ROI Projection</h2>
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
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500"
                    style={{ width: `${results.breakdown.idInfrastructurePercent}%` }}
                  />
                </div>
                <div className="text-sm font-medium whitespace-nowrap">
                  {formatPercentage(results.breakdown.idInfrastructurePercent, 0)} ID Infrastructure ({formatCurrency(results.idInfrastructure.monthlyUplift)}/mo)
                </div>
              </div>
              
              {results.capiCapabilities && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-accent h-full transition-all duration-500"
                      style={{ width: `${results.breakdown.capiPercent}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {formatPercentage(results.breakdown.capiPercent, 0)} CAPI ({formatCurrency(results.capiCapabilities.monthlyUplift)}/mo)
                  </div>
                </div>
              )}
              
              {results.mediaPerformance && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-success h-full transition-all duration-500"
                      style={{ width: `${results.breakdown.performancePercent}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium whitespace-nowrap">
                    {formatPercentage(results.breakdown.performancePercent, 0)} Media Performance ({formatCurrency(results.mediaPerformance.monthlyUplift)}/mo)
                  </div>
                </div>
              )}
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
              <div className="p-6 pt-0 space-y-3 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Addressability Recovery</div>
                    <div className="text-lg font-semibold">{formatPercentage(results.idInfrastructure.addressabilityRecovery, 1)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">CPM Improvement</div>
                    <div className="text-lg font-semibold">{formatCurrency(results.idInfrastructure.cpmImprovement)}/mo</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">CDP Cost Savings</div>
                    <div className="text-lg font-semibold">{formatCurrency(results.idInfrastructure.cdpSavings)}/mo</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">ID Reduction</div>
                    <div className="text-lg font-semibold">{formatPercentage(results.idInfrastructure.details.idReductionPercentage, 0)}</div>
                  </div>
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
                    <p className="text-sm text-muted-foreground">{formatCurrency(results.capiCapabilities.monthlyUplift)}/month</p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('capi') ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-6 pt-0 space-y-3 border-t border-border">
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
                      <div className="text-sm text-muted-foreground">Campaign Revenue</div>
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
                    <p className="text-sm text-muted-foreground">{formatCurrency(results.mediaPerformance.monthlyUplift)}/month</p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.includes('performance') ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="p-6 pt-0 space-y-3 border-t border-border">
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
                      <div className="text-sm text-muted-foreground">Premium Pricing</div>
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
      </div>
    </div>
  );
};
