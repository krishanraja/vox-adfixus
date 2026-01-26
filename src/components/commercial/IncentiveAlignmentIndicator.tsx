// Incentive Alignment Indicator
// Shows partnership level, not "value leakage"
// Replaces ValueLeakageIndicator.tsx

import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { IncentiveAlignment, CommercialModelType } from '@/types/commercialModel';

interface IncentiveAlignmentIndicatorProps {
  alignment: IncentiveAlignment;
  modelType: CommercialModelType;
  postCapBenefit?: number;
}

export const IncentiveAlignmentIndicator = ({ 
  alignment, 
  modelType,
  postCapBenefit = 0
}: IncentiveAlignmentIndicatorProps) => {
  const getColorScheme = () => {
    switch (alignment.partnershipLevel) {
      case 'Full Partnership':
        return {
          bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
          border: 'border-emerald-300 dark:border-emerald-700',
          text: 'text-emerald-700 dark:text-emerald-400',
          accent: 'text-emerald-600 dark:text-emerald-400',
          icon: CheckCircle2,
        };
      case 'Limited Partnership':
        return {
          bg: 'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
          border: 'border-amber-300 dark:border-amber-700',
          text: 'text-amber-700 dark:text-amber-400',
          accent: 'text-amber-600 dark:text-amber-400',
          icon: AlertTriangle,
        };
      case 'Vendor Relationship':
        return {
          bg: 'from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30',
          border: 'border-slate-300 dark:border-slate-700',
          text: 'text-slate-700 dark:text-slate-400',
          accent: 'text-slate-600 dark:text-slate-400',
          icon: Users,
        };
      default:
        return {
          bg: 'from-slate-50 to-gray-50',
          border: 'border-slate-300',
          text: 'text-slate-700',
          accent: 'text-slate-600',
          icon: Users,
        };
    }
  };
  
  const colors = getColorScheme();
  const Icon = colors.icon;
  
  return (
    <div className={`rounded-xl border-2 bg-gradient-to-br ${colors.bg} ${colors.border} p-5`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${colors.accent}`} />
          <span className={`text-sm font-semibold ${colors.text}`}>
            {alignment.partnershipLevel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Alignment:</span>
          <span className={`text-lg font-bold ${colors.accent}`}>
            {alignment.alignmentScore}%
          </span>
        </div>
      </div>
      
      {/* Alignment Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full transition-all duration-500 ${
            alignment.alignmentScore >= 80 ? 'bg-emerald-500' :
            alignment.alignmentScore >= 50 ? 'bg-amber-500' : 'bg-slate-400'
          }`}
          style={{ width: `${alignment.alignmentScore}%` }}
        />
      </div>
      
      {/* Description */}
      <p className={`text-sm ${colors.text} leading-relaxed`}>
        {alignment.description}
      </p>
      
      {/* Investment Level */}
      <div className="mt-4 pt-3 border-t border-current/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">AdFixus Investment Level:</span>
          <span className={`font-semibold ${colors.accent}`}>
            {alignment.investmentLevel}
          </span>
        </div>
      </div>
      
      {/* Post-Cap Benefit (for annual cap model) */}
      {modelType === 'annual-cap' && postCapBenefit > 0 && (
        <div className="mt-3 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              After cap: 100% of incremental goes to Vox
            </span>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
            Post-cap benefit: ${(postCapBenefit / 1000).toFixed(0)}K over 36 months
          </p>
        </div>
      )}
    </div>
  );
};
