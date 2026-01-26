// Scenario Card
// Individual card for each commercial model scenario
// UPDATED: Uses incentive alignment instead of value suppression

import { Check, AlertTriangle, Users, TrendingUp } from 'lucide-react';
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
  const { model, incentiveAlignment } = scenario;
  const waterfall = generateWaterfall(scenario);
  
  const getBorderClass = () => {
    if (model.isRecommended) return 'border-emerald-500/50 bg-emerald-500/5';
    if (model.type === 'flat-fee') return 'border-slate-400/30 bg-slate-500/5';
    return 'border-amber-500/30 bg-amber-500/5';
  };
  
  const getIcon = () => {
    if (model.isRecommended) return <Check className="h-4 w-4 text-emerald-500" />;
    if (model.type === 'flat-fee') return <Users className="h-4 w-4 text-slate-500" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  };
  
  return (
    <Card 
      className={`p-5 space-y-4 transition-all cursor-pointer hover:shadow-md ${getBorderClass()} ${isSelected ? 'ring-2 ring-primary' : ''}`}
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
        model.type === 'flat-fee' ? 'text-slate-600' : 'text-amber-600'
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
      
      {/* Incentive Alignment Score */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Partner Alignment
          </span>
          <span className={`text-xs font-semibold ${
            incentiveAlignment.alignmentScore >= 80 ? 'text-emerald-600' :
            incentiveAlignment.alignmentScore >= 50 ? 'text-amber-600' : 'text-slate-600'
          }`}>
            {incentiveAlignment.alignmentScore}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              incentiveAlignment.alignmentScore >= 80 ? 'bg-emerald-500' :
              incentiveAlignment.alignmentScore >= 50 ? 'bg-amber-500' : 'bg-slate-400'
            }`}
            style={{ width: `${incentiveAlignment.alignmentScore}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {incentiveAlignment.partnershipLevel}
        </p>
      </div>
      
      {/* Post-Cap Benefit (for annual cap model) */}
      {model.type === 'annual-cap' && scenario.postCapBenefit > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wide font-medium">
              Post-Cap Benefit
            </span>
          </div>
          <div className="text-sm font-bold text-emerald-600 mt-1">
            {formatCommercialCurrency(scenario.postCapBenefit)}
          </div>
          <div className="text-[10px] text-muted-foreground">
            100% to Vox after cap
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
