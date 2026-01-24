// Revenue Isolation Visual
// Makes it crystal clear: AdFixus ONLY touches incremental revenue

import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface RevenueIsolationProps {
  baseRevenue: number;
  incrementalRevenue: number;
}

export const RevenueIsolation = ({ baseRevenue, incrementalRevenue }: RevenueIsolationProps) => {
  const total = baseRevenue + incrementalRevenue;
  const basePercent = (baseRevenue / total) * 100;
  const incrementalPercent = (incrementalRevenue / total) * 100;
  
  return (
    <div className="bg-card border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Revenue Isolation
        </h3>
        <span className="text-xs text-muted-foreground">
          36-month projection
        </span>
      </div>
      
      {/* Stacked bar visualization */}
      <div className="relative h-16 rounded-lg overflow-hidden flex">
        {/* Base Revenue - Greyed out */}
        <div 
          className="h-full bg-muted flex items-center justify-center transition-all duration-500"
          style={{ width: `${basePercent}%` }}
        >
          {basePercent > 25 && (
            <span className="text-xs font-medium text-muted-foreground">
              {formatCommercialCurrency(baseRevenue)}
            </span>
          )}
        </div>
        
        {/* Incremental Revenue - Bright green */}
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 flex items-center justify-center transition-all duration-500"
          style={{ width: `${incrementalPercent}%` }}
        >
          {incrementalPercent > 15 && (
            <span className="text-xs font-bold text-white">
              {formatCommercialCurrency(incrementalRevenue)}
            </span>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-muted-foreground">
            Base Revenue <span className="font-medium">(Untouched)</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-emerald-500 to-green-400" />
          <span className="text-foreground font-medium">
            Incremental Revenue <span className="text-emerald-600">(Net-new)</span>
          </span>
        </div>
      </div>
      
      {/* Key message */}
      <p className="text-xs text-center text-muted-foreground border-t pt-3 mt-2">
        Alignment model applies <span className="font-semibold text-foreground">ONLY</span> to incremental revenue.
        Base revenue remains untouched.
      </p>
    </div>
  );
};
