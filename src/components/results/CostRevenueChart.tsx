import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CAPI_PRICING_MODEL } from '@/constants/industryBenchmarks';
import { formatCurrency } from '@/utils/formatting';

// Generate data for Cost vs Incremental Revenue chart
const generateCostRevenueData = () => {
  const { REVENUE_SHARE_PERCENTAGE, CAMPAIGN_CAP_MONTHLY, ASSUMED_CONVERSION_MULTIPLIER } = CAPI_PRICING_MODEL;
  
  return CAPI_PRICING_MODEL.ILLUSTRATIVE_CAMPAIGN_SIZES.map(campaignSpend => {
    const incrementalRevenue = campaignSpend * (ASSUMED_CONVERSION_MULTIPLIER - 1);
    const uncappedFee = campaignSpend * REVENUE_SHARE_PERCENTAGE;
    const adfixusFee = Math.min(uncappedFee, CAMPAIGN_CAP_MONTHLY);
    const isCapped = uncappedFee >= CAMPAIGN_CAP_MONTHLY;
    const netRevenue = incrementalRevenue - adfixusFee;
    
    return {
      campaignSpend,
      campaignSpendLabel: `$${(campaignSpend / 1000).toFixed(0)}K`,
      incrementalRevenue,
      adfixusFee,
      netRevenue,
      isCapped,
    };
  });
};

interface CostRevenueChartProps {
  compact?: boolean;
}

export const CostRevenueChart = ({ compact = false }: CostRevenueChartProps) => {
  const data = generateCostRevenueData();

  return (
    <div className={compact ? "h-[280px]" : "h-[350px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="campaignSpendLabel" 
            tick={{ fontSize: 10 }}
            stroke="currentColor"
          />
          <YAxis 
            tick={{ fontSize: 10 }}
            stroke="currentColor"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
          />
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background p-3 rounded-lg shadow-lg border text-sm">
                    <p className="font-semibold mb-2">Campaign: {formatCurrency(data.campaignSpend)}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-green-600">Revenue:</span>
                        <span className="font-semibold">{formatCurrency(data.incrementalRevenue)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-orange-500">Fee:</span>
                        <span className="font-semibold">
                          {formatCurrency(data.adfixusFee)}
                          {data.isCapped && <span className="text-xs ml-1 text-green-600">(CAPPED)</span>}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 border-t pt-1">
                        <span className="text-blue-600">Net to Vox:</span>
                        <span className="font-bold">{formatCurrency(data.netRevenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Incremental Revenue Line (Green) */}
          <Line
            type="monotone"
            dataKey="incrementalRevenue"
            stroke="#22c55e"
            strokeWidth={2}
            name="Revenue"
            dot={{ fill: '#22c55e', r: 3 }}
          />
          
          {/* AdFixus Fee Line (Orange) - flattens at cap */}
          <Line
            type="monotone"
            dataKey="adfixusFee"
            stroke="#f97316"
            strokeWidth={2}
            name="Fee (12.5%, $30K cap)"
            dot={{ fill: '#f97316', r: 3 }}
          />
          
          {/* Net Revenue Line (Blue) */}
          <Line
            type="monotone"
            dataKey="netRevenue"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Net to Vox"
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          
          {/* Reference line at cap threshold */}
          <ReferenceLine 
            x="$240K"
            stroke="#f97316" 
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
