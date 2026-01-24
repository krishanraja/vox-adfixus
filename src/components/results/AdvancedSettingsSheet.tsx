import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Briefcase, Code, Users, Building, TrendingUp, Target } from 'lucide-react';
import { AssumptionSlider } from '@/components/calculator/AssumptionSlider';
import { READINESS_PRESETS, READINESS_DESCRIPTIONS } from '@/constants/readinessFactors';
import type { UnifiedResults, AssumptionOverrides } from '@/types/scenarios';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdvancedSettingsSheetProps {
  results: UnifiedResults;
  assumptionOverrides?: AssumptionOverrides;
  onAssumptionOverridesChange: (overrides: AssumptionOverrides | undefined) => void;
  // Controlled mode props (optional)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Hide trigger when used in controlled mode
  hideTrigger?: boolean;
}

export const AdvancedSettingsSheet = ({ 
  results, 
  assumptionOverrides, 
  onAssumptionOverridesChange,
  open,
  onOpenChange,
  hideTrigger = false,
}: AdvancedSettingsSheetProps) => {
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

  const handleAssumptionChange = (field: keyof AssumptionOverrides, value: number) => {
    onAssumptionOverridesChange({
      ...assumptionOverrides,
      [field]: value,
    });
  };

  const applyReadinessPreset = (preset: 'conservative' | 'normal' | 'optimistic') => {
    onAssumptionOverridesChange({
      ...assumptionOverrides,
      readinessFactors: READINESS_PRESETS[preset],
    });
  };

  const resetAll = () => {
    onAssumptionOverridesChange(undefined);
  };

  const modifiedCount = assumptionOverrides ? Object.keys(assumptionOverrides).length : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            {modifiedCount > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                {modifiedCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Advanced Settings</span>
            {modifiedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetAll} className="text-xs">
                Reset All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Presets */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Quick Presets</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={() => applyReadinessPreset('conservative')} className="text-xs">
                Conservative
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyReadinessPreset('normal')} className="text-xs">
                Normal
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyReadinessPreset('optimistic')} className="text-xs">
                Optimistic
              </Button>
            </div>
          </div>

          <Separator />

          {/* Business Readiness */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Business Readiness
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

            <AssumptionSlider
              label={READINESS_DESCRIPTIONS.integrationDelays.title}
              description={READINESS_DESCRIPTIONS.integrationDelays.description}
              value={(readinessFactors?.integrationDelays ?? 0.8) * 100}
              defaultValue={80}
              min={60}
              max={100}
              step={5}
              formatValue={(v) => v >= 90 ? READINESS_DESCRIPTIONS.integrationDelays.high : v >= 75 ? READINESS_DESCRIPTIONS.integrationDelays.medium : READINESS_DESCRIPTIONS.integrationDelays.low}
              onChange={(v) => handleReadinessChange('integrationDelays', v / 100)}
              tooltipContent={READINESS_DESCRIPTIONS.integrationDelays.tooltip}
            />

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

          {/* Technical Assumptions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Code className="h-4 w-4" /> Technical Assumptions
            </h4>

            <AssumptionSlider
              label="Safari Baseline Addressability"
              description="What % of Safari users can you reach today?"
              value={(assumptionOverrides?.safariBaselineAddressability ?? 0.55) * 100}
              defaultValue={55}
              min={40}
              max={70}
              step={1}
              formatValue={(v) => `${Math.round(v)}%`}
              onChange={(v) => handleAssumptionChange('safariBaselineAddressability', v / 100)}
              tooltipContent="With Safari's 7-day ITP limit, tracking typically works for ~7 days. Industry average is 55%."
            />

            <AssumptionSlider
              label="Safari with Durable ID"
              description="Expected addressability with persistent IDs"
              value={(assumptionOverrides?.safariWithDurableId ?? 0.85) * 100}
              defaultValue={85}
              min={75}
              max={95}
              step={5}
              formatValue={(v) => `${Math.round(v)}%`}
              onChange={(v) => handleAssumptionChange('safariWithDurableId', v / 100)}
              tooltipContent="Durable IDs recognize returning users beyond Safari's 7-day limit. Conservative estimate is 85%."
            />

            <AssumptionSlider
              label="CPM Improvement"
              description="Uplift on addressable inventory"
              value={(assumptionOverrides?.cpmUpliftFactor ?? 0.25) * 100}
              defaultValue={25}
              min={10}
              max={40}
              step={5}
              formatValue={(v) => `${Math.round(v)}%`}
              onChange={(v) => handleAssumptionChange('cpmUpliftFactor', v / 100)}
              tooltipContent="Addressable inventory commands premium CPMs. Industry benchmarks show 20-30% uplift."
            />

            <AssumptionSlider
              label="CDP Cost Savings"
              description="ID bloat reduction impact"
              value={(assumptionOverrides?.cdpCostReduction ?? 0.14) * 100}
              defaultValue={14}
              min={10}
              max={18}
              step={1}
              formatValue={(v) => `${Math.round(v)}%`}
              onChange={(v) => handleAssumptionChange('cdpCostReduction', v / 100)}
              tooltipContent="Reducing ID bloat from 3.0x to 1.1x per user lowers CDP/martech platform costs."
            />
          </div>

          {/* CAPI Settings */}
          {results.capiCapabilities && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" /> CAPI Configuration
                </h4>

                <AssumptionSlider
                  label="CAPI Service Fee"
                  description="% of campaign spend"
                  value={(assumptionOverrides?.capiServiceFee ?? 0.125) * 100}
                  defaultValue={12.5}
                  min={10}
                  max={20}
                  step={2.5}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                  onChange={(v) => handleAssumptionChange('capiServiceFee', v / 100)}
                  tooltipContent="Service fee for managed CAPI campaigns."
                />

                <AssumptionSlider
                  label="CAPI Match Rate"
                  description="Expected match rate"
                  value={(assumptionOverrides?.capiMatchRate ?? 0.75) * 100}
                  defaultValue={75}
                  min={50}
                  max={90}
                  step={5}
                  formatValue={(v) => `${Math.round(v)}%`}
                  onChange={(v) => handleAssumptionChange('capiMatchRate', v / 100)}
                  tooltipContent="Match rate improvement from baseline 30% to 75%+ with AdFixus."
                />

                <AssumptionSlider
                  label="Campaigns per Year"
                  description="Total CAPI campaigns"
                  value={assumptionOverrides?.capiYearlyCampaigns ?? results.capiCapabilities.capiConfiguration.yearlyCampaigns}
                  defaultValue={results.capiCapabilities.capiConfiguration.yearlyCampaigns}
                  min={2}
                  max={50}
                  step={1}
                  formatValue={(v) => `${Math.round(v)} campaigns`}
                  onChange={(v) => handleAssumptionChange('capiYearlyCampaigns', v)}
                  tooltipContent="Number of advertiser campaigns that will use CAPI tracking."
                />

                <AssumptionSlider
                  label="Avg Campaign Spend"
                  description="Budget per campaign"
                  value={assumptionOverrides?.capiAvgCampaignSpend ?? results.capiCapabilities.capiConfiguration.avgCampaignSpend}
                  defaultValue={results.capiCapabilities.capiConfiguration.avgCampaignSpend}
                  min={25000}
                  max={250000}
                  step={5000}
                  formatValue={(v) => formatCurrency(v)}
                  onChange={(v) => handleAssumptionChange('capiAvgCampaignSpend', v)}
                  tooltipContent="Average total campaign budget."
                />

                <AssumptionSlider
                  label="CAPI Line Item Share"
                  description="% using CAPI measurement"
                  value={(assumptionOverrides?.capiLineItemShare ?? results.inputs.capiLineItemShare) * 100}
                  defaultValue={60}
                  min={10}
                  max={100}
                  step={5}
                  formatValue={(v) => `${Math.round(v)}%`}
                  onChange={(v) => handleAssumptionChange('capiLineItemShare', v / 100)}
                  tooltipContent="Service fees only apply to CAPI-enabled portion."
                />
              </div>
            </>
          )}

          {/* Media Performance */}
          {results.mediaPerformance && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Media Performance
                </h4>

                <AssumptionSlider
                  label="Premium Inventory %"
                  description="Sold at premium rates"
                  value={(assumptionOverrides?.premiumInventoryShare ?? 0.30) * 100}
                  defaultValue={30}
                  min={20}
                  max={50}
                  step={5}
                  formatValue={(v) => `${Math.round(v)}%`}
                  onChange={(v) => handleAssumptionChange('premiumInventoryShare', v / 100)}
                  tooltipContent="Percentage of total inventory sold as premium."
                />

                <AssumptionSlider
                  label="Premium Pricing Uplift"
                  description="% increase on premium"
                  value={(assumptionOverrides?.premiumYieldUplift ?? 0.25) * 100}
                  defaultValue={25}
                  min={15}
                  max={40}
                  step={5}
                  formatValue={(v) => `${Math.round(v)}%`}
                  onChange={(v) => handleAssumptionChange('premiumYieldUplift', v / 100)}
                  tooltipContent="Additional yield on premium inventory."
                />
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
