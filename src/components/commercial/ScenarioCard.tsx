// Scenario Card
// Individual card for each commercial model scenario

import { Check, AlertTriangle, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScenarioComparison } from '@/types/commercialModel';
import { formatCommercialCurrency } from '@/utils/commercialCalculations';
import { CompactWaterfall } from './ValueWaterfall';
import { generateWaterfall } from '@/utils/commercialCalculations';

interface ScenarioCardProps {
  scenario: ScenarioComparison;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ScenarioCard = ({ scenario, isSelected, onSelect }: ScenarioCardProps) => {
  const { model } = scenario;
  const waterfall = generateWaterfall(scenario);
  
  const getBorderClass = () => {
    if (model.isRecommended) return 'border-emerald-500/50 bg-emerald-500/5';
    if (model.type === 'flat-fee') return 'border-red-500/30 bg-red-500/5';
    return 'border-orange-500/30 bg-orange-500/5';
  };
  
  const getIcon = () => {
    if (model.isRecommended) return <Check className="h-4 w-4 text-emerald-500" />;
    if (model.type === 'flat-fee') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-orange-500" />;
  };
  
  return (
    <Card 
      className={`p-5 space-y-4 transition-all ${getBorderClass()} ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {getIcon()}
            <h3 className="font-semibold">{model.label}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
        </div>
        {model.isRecommended && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500 text-white shrink-0">
            Recommended
          </span>
        )}
      </div>
      
      {/* Tagline */}
      <div className={`text-xs font-medium ${
        model.isRecommended ? 'text-emerald-600' : 
        model.type === 'flat-fee' ? 'text-red-600' : 'text-orange-600'
      }`}>
        {model.tagline}
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Publisher Keeps</div>
          <div className="text-lg font-bold text-foreground">
            {formatCommercialCurrency(scenario.publisherNetGain)}
          </div>
          <div className={`text-xs ${model.isRecommended ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            {scenario.netPublisherGainPercentage.toFixed(0)}% of incremental
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">ROI Multiple</div>
          <div className="text-lg font-bold text-foreground">
            {scenario.roiMultiple.toFixed(1)}x
          </div>
          <div className="text-xs text-muted-foreground">
            over 36 months
          </div>
        </div>
      </div>
      
      {/* Value suppressed (for non-recommended) */}
      {scenario.valueSuppressed > 0 && (
        <div className="pt-2 border-t">
          <div className="text-[10px] uppercase tracking-wide text-red-600 mb-1">
            Value Suppressed
          </div>
          <div className="text-lg font-bold text-red-600">
            {formatCommercialCurrency(scenario.valueSuppressed)}
          </div>
          <div className="text-xs text-muted-foreground">
            Revenue that won't exist
          </div>
        </div>
      )}
      
      {/* Mini waterfall */}
      <div className="pt-2 border-t">
        <CompactWaterfall 
          steps={waterfall} 
          modelLabel="Value Flow" 
          isRecommended={model.isRecommended} 
        />
      </div>
    </Card>
  );
};
