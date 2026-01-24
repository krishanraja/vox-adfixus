// 36-Month Cumulative Revenue Chart
// One chart type, three versions (one per scenario)

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { MonthlyCommercialData } from '@/types/commercialModel';
import { formatCommercialCurrency } from '@/utils/commercialCalculations';

interface CumulativeRevenueChartProps {
  data: MonthlyCommercialData[];
  modelType: 'revenue-share' | 'flat-fee' | 'annual-cap';
  showSuppressed?: boolean;
  compact?: boolean;
}

export const CumulativeRevenueChart = ({ 
  data, 
  modelType, 
  showSuppressed = true,
  compact = false 
}: CumulativeRevenueChartProps) => {
  // Prepare chart data
  const chartData = data
    .filter((_, i) => compact ? i % 3 === 0 : true) // Show every 3rd month in compact mode
    .map(d => ({
      ...d,
      // Rename for cleaner legend
      'Incremental Revenue': d.cumulativeIncremental,
      'Publisher Net Gain': d.cumulativePublisherGain,
      'Share of Upside': d.cumulativeAdfixusShare,
      'Value Suppressed': d.cumulativeValueSuppressed,
    }));
  
  const height = compact ? 200 : 300;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    return (
      <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium mb-2">Month {label?.replace('M', '')}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <span className="font-medium">{formatCommercialCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncremental" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPublisher" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(215 16% 47%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(215 16% 47%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSuppressed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
          
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fontSize: 10 }} 
            stroke="currentColor"
            tickLine={false}
            interval={compact ? 2 : 5}
          />
          
          <YAxis 
            tick={{ fontSize: 10 }} 
            stroke="currentColor"
            tickLine={false}
            tickFormatter={(value) => formatCommercialCurrency(value)}
            width={60}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {!compact && <Legend wrapperStyle={{ fontSize: '11px' }} />}
          
          {/* Year markers */}
          <ReferenceLine x="M12" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Y1', fontSize: 10, fill: 'currentColor' }} />
          <ReferenceLine x="M24" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ value: 'Y2', fontSize: 10, fill: 'currentColor' }} />
          
          {/* Value Suppressed (only for non-revenue-share) */}
          {showSuppressed && modelType !== 'revenue-share' && (
            <Area
              type="monotone"
              dataKey="Value Suppressed"
              stroke="hsl(0 84% 60%)"
              fill="url(#colorSuppressed)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
          
          {/* Incremental Revenue */}
          <Area
            type="monotone"
            dataKey="Incremental Revenue"
            stroke="hsl(142 76% 36%)"
            fill="url(#colorIncremental)"
            strokeWidth={2}
          />
          
          {/* Publisher Net Gain */}
          <Area
            type="monotone"
            dataKey="Publisher Net Gain"
            stroke="hsl(217 91% 60%)"
            fill="url(#colorPublisher)"
            strokeWidth={2}
          />
          
          {/* AdFixus Share */}
          <Area
            type="monotone"
            dataKey="Share of Upside"
            stroke="hsl(215 16% 47%)"
            fill="url(#colorFees)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
