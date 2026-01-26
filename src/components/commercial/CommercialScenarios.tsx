// CAPI Alignment Models View
// Shows three commercial models for CAPI revenue share only
// CRITICAL: Revenue share applies ONLY to CAPI incremental, not the full deal

import { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw, Settings, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UnifiedResults, AssumptionOverrides } from '@/types/scenarios';
import { 
  generateAllScenarios, 
  generateWaterfall,
  formatCommercialCurrency,
  getCapiMonthlyIncremental,
  getDealBreakdown
} from '@/utils/commercialCalculations';

import { RevenueIsolation } from './RevenueIsolation';
import { ScenarioCard } from './ScenarioCard';
import { CumulativeRevenueChart } from './CumulativeRevenueChart';
import { ValueWaterfall } from './ValueWaterfall';
import { IncentiveAlignmentIndicator } from './IncentiveAlignmentIndicator';
import { NegotiationHighlights } from './NegotiationHighlights';
import { ProofPointCard } from './ProofPointCard';
import { AdvancedSettingsSheet } from '@/components/results/AdvancedSettingsSheet';

interface CommercialScenariosProps {
  results: UnifiedResults;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
  onReset: () => void;
  onDownloadPDF: () => void;
}

export const CommercialScenarios = ({
  results,
  assumptionOverrides,
  onAssumptionOverridesChange,
  onReset,
  onDownloadPDF,
}: CommercialScenariosProps) => {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [showValueStory, setShowValueStory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Generate all three scenarios (now correctly using CAPI-only revenue)
  const scenarios = useMemo(() => generateAllScenarios(results), [results]);
  const selectedScenario = scenarios[selectedScenarioIdx];
  const recommendedScenario = scenarios.find(s => s.model.isRecommended) || scenarios[0];
  
  // Get deal breakdown for context
  const dealBreakdown = useMemo(() => getDealBreakdown(results), [results]);
  const capiMonthly = getCapiMonthlyIncremental(results);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Get the CAPI net gain for hero display
  const heroNumber = recommendedScenario.publisherNetGain;
  const heroSubtitle = `CAPI net gain over 36 months with ${recommendedScenario.model.label}`;
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Settings Button (top right) */}
      <div className="flex justify-end">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowSettings(true)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          <span className="text-xs">Advanced Settings</span>
        </Button>
      </div>
      
      {/* Negotiation Highlights */}
      <NegotiationHighlights context="capi" />
      
      {/* Plain English Context Card */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>What this view shows:</strong> The 12.5% revenue share applies <em>only</em> to CAPI campaign incremental revenue 
              (<strong>{formatCommercialCurrency(capiMonthly)}/mo</strong> at steady state).
            </p>
            <p>
              Your ID Infrastructure ({formatCommercialCurrency(dealBreakdown.monthly.idInfrastructure)}/mo) and 
              Media Performance ({formatCommercialCurrency(dealBreakdown.monthly.mediaPerformance)}/mo) benefits are 
              covered by the platform subscription — no additional share is taken.
            </p>
          </div>
        </div>
      </Card>
      
      {/* TIER 1: Hero Section */}
      <section className="text-center space-y-6">
        {/* Giant Number */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            CAPI Publisher Net Gain (36 months)
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCommercialCurrency(heroNumber)}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {heroSubtitle}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <Button onClick={onDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download CAPI Analysis
          </Button>
          <Button onClick={onReset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Adjust Inputs
          </Button>
        </div>
      </section>
      
      {/* Revenue Isolation */}
      <RevenueIsolation 
        baseRevenue={recommendedScenario.baseRevenue}
        incrementalRevenue={recommendedScenario.incrementalRevenue}
      />
      
      {/* Three Scenario Cards */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 text-center">
          CAPI Alignment Models
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((scenario, idx) => (
            <ScenarioCard 
              key={scenario.model.type}
              scenario={scenario}
              isSelected={selectedScenarioIdx === idx}
              onSelect={() => setSelectedScenarioIdx(idx)}
            />
          ))}
        </div>
      </section>
      
      {/* Incentive Alignment for selected model */}
      {!selectedScenario.model.isRecommended && (
        <IncentiveAlignmentIndicator
          alignment={selectedScenario.incentiveAlignment}
          modelType={selectedScenario.model.type}
          postCapBenefit={selectedScenario.postCapBenefit}
        />
      )}
      
      {/* Proof Point (always visible) */}
      <ProofPointCard />
      
      {/* TIER 2: Value Story (Collapsible) */}
      <Collapsible open={showValueStory} onOpenChange={setShowValueStory}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full gap-2">
            {showValueStory ? 'Hide' : 'Show'} 36-Month Projection
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-6">
          {/* Chart for selected scenario */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {selectedScenario.model.label}: 36-Month Cumulative Revenue
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${
                selectedScenario.model.isRecommended 
                  ? 'bg-emerald-500/10 text-emerald-600' 
                  : selectedScenario.model.type === 'flat-fee'
                    ? 'bg-slate-500/10 text-slate-600'
                    : 'bg-amber-500/10 text-amber-600'
              }`}>
                {selectedScenario.model.tagline}
              </span>
            </div>
            <CumulativeRevenueChart 
              data={selectedScenario.monthlyProjection}
              modelType={selectedScenario.model.type}
              showPostCapBenefit={true}
            />
          </Card>
          
          {/* Waterfall comparison */}
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold">Value Flow Comparison</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {scenarios.map(scenario => (
                <ValueWaterfall
                  key={scenario.model.type}
                  steps={generateWaterfall(scenario)}
                  modelLabel={scenario.model.label}
                  isRecommended={scenario.model.isRecommended}
                />
              ))}
            </div>
          </Card>
          
          {/* Closing statement */}
          <div className="text-center py-6 border-t border-b">
            <p className="text-sm font-medium text-muted-foreground italic max-w-2xl mx-auto">
              "Revenue share creates a partnership. The other models create a vendor relationship."
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      {/* Advanced Settings Sheet */}
      <AdvancedSettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        hideTrigger={true}
        results={results}
        assumptionOverrides={assumptionOverrides}
        onAssumptionOverridesChange={onAssumptionOverridesChange}
      />
    </div>
  );
};
