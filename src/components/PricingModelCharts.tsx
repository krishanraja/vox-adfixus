import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, ReferenceLine, Cell } from 'recharts';
import { CAPI_PRICING_MODEL } from '@/constants/industryBenchmarks';
import { formatCurrency } from '@/utils/formatting';
import { AlertCircle, TrendingUp, Shield } from 'lucide-react';

// Generate data for Chart 1: Cost vs Incremental Revenue
const generateCostRevenueData = () => {
  const { REVENUE_SHARE_PERCENTAGE, CAMPAIGN_CAP_MONTHLY, ASSUMED_CONVERSION_MULTIPLIER } = CAPI_PRICING_MODEL;
  
  return CAPI_PRICING_MODEL.ILLUSTRATIVE_CAMPAIGN_SIZES.map(campaignSpend => {
    // Calculate incremental revenue (40% conversion improvement on campaign spend)
    const incrementalRevenue = campaignSpend * (ASSUMED_CONVERSION_MULTIPLIER - 1);
    
    // Calculate AdFixus fee (12.5% capped at $30K)
    const uncappedFee = campaignSpend * REVENUE_SHARE_PERCENTAGE;
    const adfixusFee = Math.min(uncappedFee, CAMPAIGN_CAP_MONTHLY);
    const isCapped = uncappedFee >= CAMPAIGN_CAP_MONTHLY;
    
    // Net revenue to Vox
    const netRevenue = incrementalRevenue - adfixusFee;
    
    return {
      campaignSpend,
      campaignSpendLabel: `$${(campaignSpend / 1000).toFixed(0)}K`,
      incrementalRevenue,
      adfixusFee,
      netRevenue,
      isCapped,
      uncappedFee,
    };
  });
};

// Generate data for Chart 2: ROI Multiple vs Campaign Scale
const generateROIData = () => {
  const { REVENUE_SHARE_PERCENTAGE, CAMPAIGN_CAP_MONTHLY, ASSUMED_CONVERSION_MULTIPLIER } = CAPI_PRICING_MODEL;
  
  return CAPI_PRICING_MODEL.ILLUSTRATIVE_CAMPAIGN_SIZES.map(campaignSpend => {
    const incrementalRevenue = campaignSpend * (ASSUMED_CONVERSION_MULTIPLIER - 1);
    const uncappedFee = campaignSpend * REVENUE_SHARE_PERCENTAGE;
    const adfixusFee = Math.min(uncappedFee, CAMPAIGN_CAP_MONTHLY);
    
    // ROI Multiple = Incremental Revenue / AdFixus Fee
    const roiMultiple = adfixusFee > 0 ? incrementalRevenue / adfixusFee : 0;
    
    return {
      campaignSpend,
      campaignSpendLabel: `$${(campaignSpend / 1000).toFixed(0)}K`,
      roiMultiple: Number(roiMultiple.toFixed(1)),
      incrementalRevenue,
      adfixusFee,
    };
  });
};

// Data for Chart 3: Risk Profile by Pricing Model
const riskProfileData = [
  {
    model: 'Flat Fee',
    modelShort: 'Flat Fee',
    upfrontRisk: 90,
    downsideExposure: 85,
    upsideAlignment: 20,
    sellerFriction: 80,
    description: 'High risk, pays even when nothing runs',
    color: '#ef4444',
  },
  {
    model: 'Low Rev Share (5%)',
    modelShort: '5% Rev Share',
    upfrontRisk: 30,
    downsideExposure: 40,
    upsideAlignment: 30,
    sellerFriction: 60,
    description: 'Punishes success, forces hidden fees',
    color: '#f59e0b',
  },
  {
    model: 'Rev Share + Cap',
    modelShort: '12.5% + Cap',
    upfrontRisk: 10,
    downsideExposure: 15,
    upsideAlignment: 95,
    sellerFriction: 20,
    description: 'Lowest risk, highest alignment',
    color: '#22c55e',
  },
];

export const PricingModelCharts = () => {
  const costRevenueData = generateCostRevenueData();
  const roiData = generateROIData();

  return (
    <div className="space-y-8">
      {/* Chart 1: Cost vs Incremental Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Cost vs Incremental Revenue
          </CardTitle>
          <CardDescription>
            The $30K cap ensures costs flatten while revenue keeps growing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={costRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="campaignSpendLabel" 
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  label={{ value: 'Campaign CAPI Spend', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  label={{ value: 'Dollars', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border">
                          <p className="font-semibold mb-2">Campaign: {formatCurrency(data.campaignSpend)}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-green-600">Incremental Revenue:</span>
                              <span className="font-semibold">{formatCurrency(data.incrementalRevenue)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-orange-500">AdFixus Fee:</span>
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
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  iconType="line"
                />
                
                {/* Incremental Revenue Line (Green) */}
                <Line
                  type="monotone"
                  dataKey="incrementalRevenue"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Incremental Revenue to Vox"
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* AdFixus Fee Line (Orange) - flattens at cap */}
                <Line
                  type="monotone"
                  dataKey="adfixusFee"
                  stroke="#f97316"
                  strokeWidth={3}
                  name="AdFixus Fee (12.5% capped at $30K)"
                  dot={{ fill: '#f97316', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* Net Revenue Line (Blue) */}
                <Line
                  type="monotone"
                  dataKey="netRevenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Net Revenue to Vox"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                
                {/* Reference line at cap threshold */}
                <ReferenceLine 
                  x="$240K"
                  stroke="#f97316" 
                  strokeDasharray="5 5"
                  label={{ value: 'Cap kicks in', position: 'top', fill: '#f97316', fontSize: 10 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-center">
            <p className="font-semibold text-green-800 dark:text-green-300">
              "Costs are capped. Revenue is not."
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
              Every dollar above $240K campaign spend = 100% to Vox
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: ROI Multiple vs Campaign Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            ROI Multiple vs Campaign Scale
          </CardTitle>
          <CardDescription>
            ROI accelerates as campaigns get larger due to the fee cap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="campaignSpendLabel" 
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  label={{ value: 'Campaign Size', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  domain={[0, 'auto']}
                  tickFormatter={(value) => `${value}x`}
                  label={{ value: 'ROI Multiple', angle: -90, position: 'insideLeft' }}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border">
                          <p className="font-semibold mb-2">Campaign: {formatCurrency(data.campaignSpend)}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">Revenue Generated:</span>
                              <span className="font-semibold">{formatCurrency(data.incrementalRevenue)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-muted-foreground">AdFixus Fee:</span>
                              <span className="font-semibold">{formatCurrency(data.adfixusFee)}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t pt-1">
                              <span className="text-emerald-600 font-medium">ROI Multiple:</span>
                              <span className="font-bold text-emerald-600">{data.roiMultiple}x</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* ROI Multiple Line */}
                <Line
                  type="monotone"
                  dataKey="roiMultiple"
                  stroke="#10b981"
                  strokeWidth={4}
                  name="ROI Multiple"
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 8 }}
                />
                
                {/* Reference line at cap threshold */}
                <ReferenceLine 
                  x="$240K"
                  stroke="#f59e0b" 
                  strokeDasharray="5 5"
                  label={{ value: 'Cap threshold', position: 'top', fill: '#f59e0b', fontSize: 10 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              "The model rewards scale instead of penalising it."
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
              Bigger campaigns deliver better economics, not worse
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Risk Profile by Pricing Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Risk Profile by Pricing Model
          </CardTitle>
          <CardDescription>
            Comparing pricing models across key risk dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskProfileData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  domain={[0, 100]}
                  tickFormatter={(value) => value === 0 ? 'Low' : value === 100 ? 'High' : ''}
                  label={{ value: 'Risk Level (Lower is Better)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="category"
                  dataKey="modelShort"
                  tick={{ fontSize: 11 }}
                  stroke="currentColor"
                  width={90}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border max-w-xs">
                          <p className="font-semibold mb-2">{data.model}</p>
                          <p className="text-sm text-muted-foreground mb-3">{data.description}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <span>Upfront Cost Risk:</span>
                              <span className="font-semibold">{data.upfrontRisk}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Downside Exposure:</span>
                              <span className="font-semibold">{data.downsideExposure}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Upside Alignment:</span>
                              <span className="font-semibold text-green-600">{data.upsideAlignment}%</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span>Seller Friction:</span>
                              <span className="font-semibold">{data.sellerFriction}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                
                <Bar dataKey="upfrontRisk" name="Upfront Cost Risk" fill="#ef4444" barSize={12}>
                  {riskProfileData.map((entry, index) => (
                    <Cell key={`cell-upfront-${index}`} fillOpacity={entry.modelShort === '12.5% + Cap' ? 1 : 0.6} />
                  ))}
                </Bar>
                <Bar dataKey="downsideExposure" name="Downside Exposure" fill="#f97316" barSize={12}>
                  {riskProfileData.map((entry, index) => (
                    <Cell key={`cell-downside-${index}`} fillOpacity={entry.modelShort === '12.5% + Cap' ? 1 : 0.6} />
                  ))}
                </Bar>
                <Bar dataKey="sellerFriction" name="Seller Adoption Friction" fill="#eab308" barSize={12}>
                  {riskProfileData.map((entry, index) => (
                    <Cell key={`cell-friction-${index}`} fillOpacity={entry.modelShort === '12.5% + Cap' ? 1 : 0.6} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Model comparison cards */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {riskProfileData.map((model) => (
              <div 
                key={model.modelShort}
                className={`p-3 rounded-lg border-2 ${
                  model.modelShort === '12.5% + Cap' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                }`}
              >
                <div className="font-semibold text-sm mb-1" style={{ color: model.color }}>
                  {model.modelShort}
                </div>
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
                {model.modelShort === '12.5% + Cap' && (
                  <div className="mt-2 text-xs font-semibold text-green-700 dark:text-green-400">
                    ✓ Recommended
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
            <p className="font-semibold text-blue-800 dark:text-blue-300">
              "This is the only model where Vox only pays when it wins."
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Zero downside risk • Aligned incentives • Proven with enterprise publishers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingModelCharts;
