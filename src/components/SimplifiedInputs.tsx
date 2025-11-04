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
  const aggregated = aggregateDomainInputs(inputs.selectedDomains);
  const showCapiInputs = inputs.selectedDomains.length > 0;

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
      />

      {showCapiInputs && (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                CAPI Campaign Configuration
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure your Conversion API (CAPI) campaigns using AdFixus Stream
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="capi-campaigns" className="text-sm font-medium">
                  CAPI Campaigns per Month
                </Label>
                <span className="text-sm font-semibold text-primary">
                  {inputs.capiCampaignsPerMonth} campaigns
                </span>
              </div>
              <Slider
                id="capi-campaigns"
                min={1}
                max={50}
                step={1}
                value={[inputs.capiCampaignsPerMonth]}
                onValueChange={(value) =>
                  onInputChange('capiCampaignsPerMonth', value[0])
                }
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="campaign-spend" className="text-sm font-medium">
                  Average Campaign Spend
                </Label>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(inputs.avgCampaignSpend)}
                </span>
              </div>
              <Slider
                id="campaign-spend"
                min={10000}
                max={500000}
                step={10000}
                value={[inputs.avgCampaignSpend]}
                onValueChange={(value) =>
                  onInputChange('avgCampaignSpend', value[0])
                }
                className="w-full"
              />
            </div>
          </div>
        </Card>
      )}

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
