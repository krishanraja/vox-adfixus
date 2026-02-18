// Summary Tab - Executive Dashboard
// Contains: All controls, hero number, component breakdown, negotiation highlights, PDF download
// This is the ONLY place with configuration controls and PDF download

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, Shield, Target, TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UnifiedResults, AssumptionOverrides, TimeframeType, PdfExportConfig } from '@/types/scenarios';
import type { RiskScenario } from '@/constants/riskScenarios';
import { getDealBreakdown, formatCommercialCurrency } from '@/utils/commercialCalculations';
import { NegotiationHighlights } from '@/components/commercial/NegotiationHighlights';
import { AdvancedSettingsSheet } from '@/components/results/AdvancedSettingsSheet';
import { PdfExportConfigSheet } from '@/components/PdfExportConfig';
import { useState } from 'react';

interface SummaryTabProps {
  results: UnifiedResults;
  timeframe: TimeframeType;
  onTimeframeChange: (timeframe: TimeframeType) => void;
  riskScenario: RiskScenario;
  onRiskScenarioChange: (scenario: RiskScenario) => void;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
  onDownloadPDF: (config: PdfExportConfig) => void;
}

export const SummaryTab = ({
  results,
  timeframe,
  onTimeframeChange,
  riskScenario,
  onRiskScenarioChange,
  assumptionOverrides,
  onAssumptionOverridesChange,
  onDownloadPDF,
}: SummaryTabProps) => {
  const [showExportConfig, setShowExportConfig] = useState(false);
  // Use timeframe-aware breakdown - SINGLE SOURCE OF TRUTH
  const breakdown = getDealBreakdown(results, timeframe);
  
  // Log validation status in development
  if (!breakdown.isValid) {
    console.warn('Deal breakdown validation failed:', breakdown.validationErrors);
  }
  
  // Use the display object directly - already calculated for correct timeframe
  const total = breakdown.display.total;
  const idInfra = breakdown.display.idInfrastructure;
  const capi = breakdown.display.capi;
  const media = breakdown.display.mediaPerformance;
  const timeframeLabel = breakdown.display.label;
  
  // Calculate percentages from monthly values (consistent regardless of timeframe)
  const monthlyTotal = breakdown.monthly.total;
  const idPct = monthlyTotal > 0 ? (breakdown.monthly.idInfrastructure / monthlyTotal) * 100 : 0;
  const capiPct = monthlyTotal > 0 ? (breakdown.monthly.capi / monthlyTotal) * 100 : 0;
  const mediaPct = monthlyTotal > 0 ? (breakdown.monthly.mediaPerformance / monthlyTotal) * 100 : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Timeframe Toggle */}
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Timeframe
            </Label>
            <RadioGroup
              value={timeframe}
              onValueChange={(v) => onTimeframeChange(v as TimeframeType)}
              className="flex gap-1"
            >
              {(['1-year', '3-year'] as const).map((tf) => (
                <div key={tf} className="flex-1">
                  <RadioGroupItem value={tf} id={`tf-${tf}`} className="peer sr-only" />
                  <Label
                    htmlFor={`tf-${tf}`}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md cursor-pointer transition-all
                      peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                      hover:bg-muted"
                  >
                    {tf === '1-year' ? '1 Year' : '3 Years'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Outlook Toggle */}
          <div className="flex items-center gap-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Outlook
            </Label>
            <RadioGroup
              value={riskScenario}
              onValueChange={(v) => onRiskScenarioChange(v as RiskScenario)}
              className="flex gap-1"
            >
              {(['conservative', 'moderate', 'optimistic'] as const).map((scenario) => (
                <div key={scenario}>
                  <RadioGroupItem value={scenario} id={`outlook-${scenario}`} className="peer sr-only" />
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

          {/* Advanced Settings */}
          <AdvancedSettingsSheet
            results={results}
            assumptionOverrides={assumptionOverrides}
            onAssumptionOverridesChange={onAssumptionOverridesChange}
          />
        </div>
      </Card>

      {/* Negotiation Highlights */}
      <NegotiationHighlights context="total-deal" />

      {/* Hero Number */}
      <div className="text-center space-y-3 py-8">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Total Deal Value ({timeframeLabel})
        </p>
        <div className="text-5xl md:text-7xl font-bold text-primary">
          {formatCommercialCurrency(total)}
        </div>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Incremental revenue from ID Infrastructure, CAPI, and Media Performance combined
        </p>
      </div>

      {/* Three Component Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* ID Infrastructure */}
        <Card className="p-5 border-2 border-primary/20 bg-primary/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">ID Infrastructure</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Structural</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">
              {formatCommercialCurrency(idInfra)}
            </p>
            <p className="text-xs text-muted-foreground">{timeframeLabel}</p>
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p>• Safari addressability recovery</p>
              <p>• CDP cost reduction</p>
              <p>• Fuller audience segments</p>
            </div>
            <div className="pt-2">
              <span className="text-xs text-primary">Covered by platform fee →</span>
            </div>
          </div>
        </Card>

        {/* CAPI Revenue */}
        <Card className="p-5 border-2 border-amber-500/40 bg-amber-500/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-sm">CAPI Revenue</h3>
            </div>
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Sales-Led</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-amber-600">
              {formatCommercialCurrency(capi)}
            </p>
            <p className="text-xs text-muted-foreground">{timeframeLabel}</p>
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p>• Conversion tracking revenue</p>
              <p>• Advertiser premium spend</p>
              <p>• Net-new campaign revenue</p>
            </div>
            <div className="pt-2">
              <span className="text-xs text-amber-600">12.5% revenue share applies →</span>
            </div>
          </div>
        </Card>

        {/* Media Performance */}
        <Card className="p-5 border-2 border-green-500/30 bg-green-500/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-sm">Media Performance</h3>
            </div>
            <Badge variant="secondary" className="text-xs">Operational</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-green-600">
              {formatCommercialCurrency(media)}
            </p>
            <p className="text-xs text-muted-foreground">{timeframeLabel}</p>
            <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
              <p>• Premium yield improvement</p>
              <p>• Reduced make-goods</p>
              <p>• Better advertiser ROAS</p>
            </div>
            <div className="pt-2">
              <span className="text-xs text-green-600">Covered by platform fee →</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Stacked Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-sm font-medium">Value Composition</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  ID Infrastructure and Media Performance are structural benefits covered by the platform fee. 
                  CAPI is the sales-led component with a revenue share model.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="h-8 flex rounded-lg overflow-hidden">
          <div 
            className="bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
            style={{ width: `${idPct}%` }}
          >
            {idPct > 15 && `${idPct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-amber-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${capiPct}%` }}
          >
            {capiPct > 15 && `${capiPct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${mediaPct}%` }}
          >
            {mediaPct > 15 && `${mediaPct.toFixed(0)}%`}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-primary" />
            <span>ID Infra ({idPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
            <span>CAPI ({capiPct.toFixed(0)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
            <span>Media ({mediaPct.toFixed(0)}%)</span>
          </div>
        </div>
      </Card>

      {/* Plain English Explanation */}
      <Card className="p-4 bg-muted/30 border-dashed">
        <h4 className="text-sm font-medium mb-2">How This Works</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The total deal value of <strong>{formatCommercialCurrency(total)}</strong> over {timeframeLabel} comes from three sources:
        </p>
        <ul className="mt-2 space-y-3 text-sm text-muted-foreground">
          <li>
            <strong>ID Infrastructure ({formatCommercialCurrency(idInfra)})</strong>: 
            Structural benefits from making Safari inventory addressable again — recovering CPM revenue from the 35% of Vox's visitors who are currently invisible to advertisers due to Apple's ITP restrictions.
          </li>
          <li>
            <strong>CAPI Revenue ({formatCommercialCurrency(capi)})</strong>: 
            Incremental revenue from advertisers who pay a premium for server-side conversion tracking. Subject to a 12.5% revenue share, capped at $30K per campaign/month.
          </li>
          <li>
            <strong>Media Performance ({formatCommercialCurrency(media)})</strong>: 
            Two distinct revenue mechanisms — each independently auditable:
            <ul className="mt-1.5 ml-3 space-y-1.5">
              <li>
                <strong>① Premium Yield Uplift</strong>: Better audience data enables 20% of impressions to qualify for premium/PMP deals at a 15% CPM uplift. Value: ~{formatCommercialCurrency(Math.round((results.mediaPerformance?.details?.premiumYieldMonthly ?? 0) * (timeframe === '3-year' ? 36 : 12)))}.
              </li>
              <li>
                <strong>② Make-Good Reduction</strong>: Make-goods apply only to direct-sold guaranteed inventory (~40% of revenue). Better conversion tracking reduces the compensatory impression rate from 5% to 2% — a 3pp improvement on that base. Value: ~{formatCommercialCurrency(Math.round((results.mediaPerformance?.details?.makeGoodSavings ?? 0) * (timeframe === '3-year' ? 36 : 12)))}.
              </li>
            </ul>
          </li>
        </ul>
      </Card>

      {/* PDF Download Button - ONLY place for PDF */}
      <div className="flex justify-center pt-4">
        <Button onClick={() => setShowExportConfig(true)} size="lg" className="gap-2">
          <Download className="h-4 w-4" />
          Download Executive PDF Report
        </Button>
      </div>

      {/* PDF Export Config Sheet */}
      <PdfExportConfigSheet
        open={showExportConfig}
        onOpenChange={setShowExportConfig}
        results={results}
        timeframe={timeframe}
        onExport={(config) => {
          setShowExportConfig(false);
          onDownloadPDF(config);
        }}
      />
    </div>
  );
};
