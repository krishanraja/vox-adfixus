// Value Waterfall
// Horizontal waterfall showing revenue flow per scenario

import { formatCommercialCurrency } from '@/utils/commercialCalculations';
import { WaterfallStep } from '@/types/commercialModel';

interface ValueWaterfallProps {
  steps: WaterfallStep[];
  modelLabel: string;
  isRecommended?: boolean;
}

export const ValueWaterfall = ({ steps, modelLabel, isRecommended }: ValueWaterfallProps) => {
  const maxValue = Math.max(...steps.map(s => s.value));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">{modelLabel}</h4>
        {isRecommended && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            Recommended
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => {
          const widthPercent = (step.value / maxValue) * 100;
          
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-28 text-xs text-right text-muted-foreground shrink-0">
                {step.type === 'total' ? '' : '→ '}{step.label}
              </div>
              <div className="flex-1 h-7 bg-muted/30 rounded overflow-hidden">
                <div 
                  className="h-full flex items-center justify-end px-2 transition-all duration-700 rounded"
                  style={{ 
                    width: `${Math.max(widthPercent, 5)}%`,
                    backgroundColor: step.color,
                  }}
                >
                  <span className="text-xs font-semibold text-white drop-shadow-sm">
                    {formatCommercialCurrency(step.value)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Compact version for side-by-side comparison
export const CompactWaterfall = ({ steps, modelLabel, isRecommended }: ValueWaterfallProps) => {
  const total = steps.find(s => s.type === 'total')?.value || 0;
  const publisherKeeps = steps.find(s => s.label === 'Publisher Keeps')?.value || 0;
  const adfixusShare = steps.find(s => s.label === 'Share of Upside')?.value || 0;
  const lost = steps.find(s => s.type === 'negative')?.value || 0;
  
  const keepPercent = total > 0 ? (publisherKeeps / total) * 100 : 0;
  const sharePercent = total > 0 ? (adfixusShare / total) * 100 : 0;
  const lostPercent = total > 0 ? (lost / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{modelLabel}</span>
        {isRecommended && (
          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
            ✓
          </span>
        )}
      </div>
      
      {/* Stacked horizontal bar */}
      <div className="h-6 rounded overflow-hidden flex">
        <div 
          className="h-full bg-emerald-500 flex items-center justify-center"
          style={{ width: `${keepPercent}%` }}
        >
          {keepPercent > 20 && (
            <span className="text-[10px] font-bold text-white">{keepPercent.toFixed(0)}%</span>
          )}
        </div>
        <div 
          className="h-full bg-slate-400 flex items-center justify-center"
          style={{ width: `${sharePercent}%` }}
        >
          {sharePercent > 10 && (
            <span className="text-[10px] font-bold text-white">{sharePercent.toFixed(0)}%</span>
          )}
        </div>
        {lostPercent > 0 && (
          <div 
            className="h-full bg-red-500 flex items-center justify-center"
            style={{ width: `${lostPercent}%` }}
          >
            {lostPercent > 10 && (
              <span className="text-[10px] font-bold text-white">{lostPercent.toFixed(0)}%</span>
            )}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500" />
          <span>Publisher</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-slate-400" />
          <span>AdFixus</span>
        </div>
        {lostPercent > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-red-500" />
            <span>Lost</span>
          </div>
        )}
      </div>
    </div>
  );
};
