import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { SimplifiedInputs } from '@/types/scenarios';
import { DomainSelector } from '@/components/DomainSelector';
import { TrendingUp } from 'lucide-react';
import { aggregateDomainInputs } from '@/utils/domainAggregation';

interface SimplifiedInputsFormProps {
  inputs: SimplifiedInputs;
  onInputChange: (field: keyof SimplifiedInputs, value: any) => void;
  onCalculate: () => void;
}

export const SimplifiedInputsForm = ({
  inputs,
  onInputChange,
  onCalculate,
}: SimplifiedInputsFormProps) => {
  const aggregated = aggregateDomainInputs(
    inputs.selectedDomains, 
    inputs.displayCPM, 
    inputs.videoCPM,
    inputs.domainPageviewOverrides,
    inputs.safariShareOverrides
  );
  const showCapiInputs = inputs.selectedDomains.length > 0;
  
  const handlePageviewOverride = (domainId: string, pageviews: number | undefined) => {
    const newOverrides = { ...inputs.domainPageviewOverrides };
    if (pageviews === undefined) {
      delete newOverrides[domainId];
      onInputChange('domainPageviewOverrides', Object.keys(newOverrides).length > 0 ? newOverrides : undefined);
    } else {
      newOverrides[domainId] = pageviews;
      onInputChange('domainPageviewOverrides', newOverrides);
    }
  };
  
  const handleSafariShareOverride = (domainId: string, safariShare: number | undefined) => {
    const newOverrides = { ...inputs.safariShareOverrides };
    if (safariShare === undefined) {
      delete newOverrides[domainId];
      onInputChange('safariShareOverrides', Object.keys(newOverrides).length > 0 ? newOverrides : undefined);
    } else {
      newOverrides[domainId] = safariShare;
      onInputChange('safariShareOverrides', newOverrides);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <DomainSelector
        selectedDomains={inputs.selectedDomains}
        onChange={(domains) => onInputChange('selectedDomains', domains)}
        pageviewOverrides={inputs.domainPageviewOverrides}
        onPageviewOverrideChange={handlePageviewOverride}
        safariShareOverrides={inputs.safariShareOverrides}
        onSafariShareOverrideChange={handleSafariShareOverride}
      />

      {/* CPM Configuration */}
      {showCapiInputs && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">CPM Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your average CPM rates for modeling purposes
          </p>
          
          <div className="space-y-6">
            {/* Display CPM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="displayCPM" className="text-sm font-medium">
                  Display CPM
                </Label>
                <div className="px-3 py-1 bg-primary/10 rounded-md">
                  <span className="text-lg font-bold text-primary">
                    ${(inputs.displayCPM || 4.50).toFixed(2)}
                  </span>
                </div>
              </div>
              <Slider
                id="displayCPM"
                min={1}
                max={15}
                step={0.25}
                value={[inputs.displayCPM || 4.50]}
                onValueChange={(value) => onInputChange('displayCPM', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$1.00</span>
                <span className="text-xs text-muted-foreground">Low</span>
                <span className="text-xs text-muted-foreground">Average</span>
                <span className="text-xs text-muted-foreground">High</span>
                <span>$15.00</span>
              </div>
            </div>

            {/* Video CPM */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="videoCPM" className="text-sm font-medium">
                  Video CPM
                </Label>
                <div className="px-3 py-1 bg-primary/10 rounded-md">
                  <span className="text-lg font-bold text-primary">
                    ${(inputs.videoCPM || 15.00).toFixed(2)}
                  </span>
                </div>
              </div>
              <Slider
                id="videoCPM"
                min={5}
                max={30}
                step={0.50}
                value={[inputs.videoCPM || 15.00]}
                onValueChange={(value) => onInputChange('videoCPM', value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$5.00</span>
                <span className="text-xs text-muted-foreground">Low</span>
                <span className="text-xs text-muted-foreground">Average</span>
                <span className="text-xs text-muted-foreground">High</span>
                <span>$30.00</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* CAPI Configuration REMOVED - now calculated from Business Readiness factors */}
      {/* CAPI campaigns will be shown as OUTPUT in the results, based on:
          - Sales Readiness
          - Training Gaps  
          - Advertiser Buy-In
          - Market Conditions (Budget Environment)
      */}

      {aggregated.totalMonthlyPageviews > 0 && (
        <button
          onClick={onCalculate}
          className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
        >
          Calculate ROI Projection
        </button>
      )}
    </div>
  );
};
