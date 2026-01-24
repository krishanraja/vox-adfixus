// Value Leakage Indicator
// Big, impossible-to-miss number showing suppressed revenue

import { AlertTriangle } from 'lucide-react';
import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface ValueLeakageIndicatorProps {
  valueSuppressed: number;
  reason: string;
  modelType: 'flat-fee' | 'annual-cap';
}

export const ValueLeakageIndicator = ({ 
  valueSuppressed, 
  reason, 
  modelType 
}: ValueLeakageIndicatorProps) => {
  if (valueSuppressed <= 0) return null;
  
  const bgColor = modelType === 'flat-fee' 
    ? 'from-red-500/10 to-orange-500/10 border-red-500/30' 
    : 'from-orange-500/10 to-amber-500/10 border-orange-500/30';
  
  const textColor = modelType === 'flat-fee' 
    ? 'text-red-600 dark:text-red-400' 
    : 'text-orange-600 dark:text-orange-400';
  
  const iconColor = modelType === 'flat-fee'
    ? 'text-red-500'
    : 'text-orange-500';
  
  return (
    <div className={`rounded-xl border-2 bg-gradient-to-br ${bgColor} p-6 text-center`}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <AlertTriangle className={`h-5 w-5 ${iconColor}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Uncaptured Incremental Revenue
        </span>
      </div>
      
      <div className={`text-4xl md:text-5xl font-bold ${textColor} mb-3`}>
        {formatCommercialCurrency(valueSuppressed)}
      </div>
      
      <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
        Revenue that could have existed but didn't due to:
      </p>
      
      <ul className="text-xs text-muted-foreground mt-2 space-y-1">
        <li>• Underinvestment (no incentive to grow)</li>
        <li>• Sales friction (hard to justify internal advocacy)</li>
        {modelType === 'annual-cap' && (
          <li>• Artificial throttling (growth stops once cap is hit)</li>
        )}
      </ul>
    </div>
  );
};
