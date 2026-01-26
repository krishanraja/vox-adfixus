// Negotiation Highlights Component
// Surfaces deal concessions prominently on both tabs

import { Gift, BadgePercent, Clock } from 'lucide-react';
import { DEAL_CONCESSIONS, DealConcession } from '@/types/commercialModel';

interface NegotiationHighlightsProps {
  context: 'capi' | 'addressability'; // Which tab we're on
  compact?: boolean;
}

const getCategoryIcon = (category: DealConcession['category']) => {
  switch (category) {
    case 'capi':
      return BadgePercent;
    case 'contract':
      return BadgePercent;
    case 'poc':
      return Gift;
    case 'onboarding':
      return Gift;
    default:
      return Gift;
  }
};

const getCategoryColor = (category: DealConcession['category']) => {
  switch (category) {
    case 'capi':
      return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400';
    case 'contract':
      return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400';
    case 'poc':
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400';
    case 'onboarding':
      return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400';
    default:
      return 'bg-muted border-border text-muted-foreground';
  }
};

export const NegotiationHighlights = ({ context, compact = false }: NegotiationHighlightsProps) => {
  // Filter concessions based on context
  const relevantConcessions = context === 'capi' 
    ? DEAL_CONCESSIONS.filter(c => c.category === 'capi')
    : DEAL_CONCESSIONS;
  
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {relevantConcessions.map((concession) => {
          const Icon = getCategoryIcon(concession.category);
          const colorClasses = getCategoryColor(concession.category);
          
          return (
            <div 
              key={concession.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClasses}`}
            >
              <Icon className="h-3 w-3" />
              <span>{concession.label}:</span>
              <span className="font-bold">{concession.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-4 w-4 text-emerald-600" />
        <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          Deal Highlights — Extended to Mid-February
        </h4>
        <Clock className="h-3 w-3 text-emerald-600 ml-auto" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {relevantConcessions.map((concession) => {
          const Icon = getCategoryIcon(concession.category);
          const colorClasses = getCategoryColor(concession.category);
          
          return (
            <div 
              key={concession.label}
              className={`p-3 rounded-lg border ${colorClasses}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{concession.label}</span>
              </div>
              <div className="text-xl font-bold">{concession.value}</div>
              <p className="text-xs opacity-80 mt-0.5 line-clamp-2">
                {concession.description}
              </p>
            </div>
          );
        })}
      </div>
      
      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-3 text-center">
        These concessions reflect our commitment to a long-term partnership.
      </p>
    </div>
  );
};
