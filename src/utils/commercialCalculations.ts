// Commercial Model Calculations
// Calculates value leakage, suppression, and 36-month projections for each model

import { 
  CommercialModel, 
  CommercialModelType,
  ScenarioComparison, 
  MonthlyCommercialData,
  WaterfallStep,
  COMMERCIAL_MODELS 
} from '@/types/commercialModel';
import { UnifiedResults } from '@/types/scenarios';

// Value suppression factors for misaligned models
const SUPPRESSION_FACTORS = {
  'flat-fee': {
    // 30% lower investment due to lack of skin-in-the-game
    suppressionRate: 0.30,
    reason: 'Underinvestment due to misaligned incentives. No vendor stake in growth.',
  },
  'annual-cap': {
    // Revenue above cap threshold doesn't get generated
    // Once cap is hit, vendor has no incentive to help grow further
    suppressionRate: 0.22, // 22% of potential suppressed
    reason: 'Artificial throttling after cap is reached. Vendor incentive disappears.',
  },
  'revenue-share': {
    suppressionRate: 0,
    reason: '',
  },
};

// 36-month ramp-up curve (realistic adoption)
const RAMP_UP_CURVE = [
  // Year 1: POC → Scale
  0.15, 0.25, 0.35, // Q1: POC phase
  0.50, 0.65, 0.75, // Q2: Early scale
  0.82, 0.88, 0.92, // Q3: Full scale
  0.95, 0.97, 1.00, // Q4: Maturity
  // Year 2: Steady state + optimization
  1.00, 1.02, 1.04, 1.06, 1.08, 1.10,
  1.10, 1.12, 1.14, 1.15, 1.15, 1.15,
  // Year 3: Mature + compound effects
  1.15, 1.18, 1.20, 1.22, 1.24, 1.25,
  1.25, 1.26, 1.27, 1.28, 1.29, 1.30,
];

/**
 * Calculate the base monthly incremental revenue from UnifiedResults
 */
export const getBaseMonthlyIncremental = (results: UnifiedResults): number => {
  return results.totals.totalMonthlyUplift;
};

/**
 * Calculate value leakage/suppression for a commercial model
 */
export const calculateValueSuppression = (
  modelType: CommercialModelType,
  baseIncrementalRevenue36Month: number,
  modelParams: CommercialModel['params']
): { suppressed: number; reason: string } => {
  const factor = SUPPRESSION_FACTORS[modelType];
  
  if (modelType === 'revenue-share') {
    return { suppressed: 0, reason: '' };
  }
  
  if (modelType === 'flat-fee') {
    // Flat fee creates 30% underinvestment
    return {
      suppressed: baseIncrementalRevenue36Month * factor.suppressionRate,
      reason: factor.reason,
    };
  }
  
  if (modelType === 'annual-cap') {
    // Calculate revenue that would exceed cap threshold
    const annualCap = modelParams.annualCap || 150000;
    const shareRate = modelParams.baseSharePercentage || 0.125;
    
    // Once fees hit cap, vendor has no incentive to help grow
    // Estimate 22% of potential revenue gets throttled
    return {
      suppressed: baseIncrementalRevenue36Month * factor.suppressionRate,
      reason: factor.reason,
    };
  }
  
  return { suppressed: 0, reason: '' };
};

/**
 * Calculate AdFixus share for a given month's incremental revenue
 */
export const calculateAdfixusShare = (
  modelType: CommercialModelType,
  monthlyIncremental: number,
  cumulativeIncremental: number,
  modelParams: CommercialModel['params'],
  month: number
): number => {
  switch (modelType) {
    case 'revenue-share': {
      const shareRate = modelParams.sharePercentage || 0.125;
      const campaignCap = modelParams.campaignCap || 30000;
      
      // Calculate fee with campaign cap
      const rawFee = monthlyIncremental * shareRate;
      // Cap applies per campaign - assume ~10 campaigns/month, so cap is $30K * 10 = $300K theoretical max
      // But realistically, cap kicks in per large campaign
      return Math.min(rawFee, campaignCap * 3); // Assume 3 large campaigns hitting cap
    }
    
    case 'flat-fee': {
      const annualFee = modelParams.annualFlatFee || 500000;
      return annualFee / 12; // Spread evenly
    }
    
    case 'annual-cap': {
      const annualCap = modelParams.annualCap || 150000;
      const shareRate = modelParams.baseSharePercentage || 0.125;
      
      // Calculate cumulative fees so far this year
      const yearStart = Math.floor((month - 1) / 12) * 12;
      const monthInYear = ((month - 1) % 12) + 1;
      
      // Pro-rate annual cap
      const cappedMonthlyMax = annualCap / 12;
      const rawFee = monthlyIncremental * shareRate;
      
      return Math.min(rawFee, cappedMonthlyMax);
    }
    
    default:
      return 0;
  }
};

/**
 * Generate 36-month projection for a commercial model
 */
export const generateMonthlyProjection = (
  model: CommercialModel,
  baseMonthlyIncremental: number,
  baseMonthlyRevenue: number
): MonthlyCommercialData[] => {
  const suppression = SUPPRESSION_FACTORS[model.type];
  const effectiveMultiplier = 1 - suppression.suppressionRate;
  
  const projection: MonthlyCommercialData[] = [];
  let cumulativeIncremental = 0;
  let cumulativePublisherGain = 0;
  let cumulativeAdfixusShare = 0;
  let cumulativeValueSuppressed = 0;
  
  for (let month = 1; month <= 36; month++) {
    const rampUp = RAMP_UP_CURVE[month - 1] || 1.30;
    
    // Full potential incremental (what revenue-share model would generate)
    const fullPotentialIncremental = baseMonthlyIncremental * rampUp;
    
    // Actual incremental (reduced by suppression for misaligned models)
    const actualIncremental = fullPotentialIncremental * effectiveMultiplier;
    
    // Value suppressed this month
    const monthSuppressed = fullPotentialIncremental - actualIncremental;
    
    cumulativeIncremental += actualIncremental;
    cumulativeValueSuppressed += monthSuppressed;
    
    // Calculate AdFixus share
    const adfixusShare = calculateAdfixusShare(
      model.type,
      actualIncremental,
      cumulativeIncremental,
      model.params,
      month
    );
    cumulativeAdfixusShare += adfixusShare;
    
    // Publisher net gain
    const publisherGain = actualIncremental - adfixusShare;
    cumulativePublisherGain += publisherGain;
    
    projection.push({
      month,
      monthLabel: `M${month}`,
      baseRevenue: baseMonthlyRevenue,
      incrementalRevenue: actualIncremental,
      cumulativeIncremental,
      publisherNetGain: publisherGain,
      cumulativePublisherGain,
      adfixusShare,
      cumulativeAdfixusShare,
      valueSuppressed: monthSuppressed,
      cumulativeValueSuppressed,
    });
  }
  
  return projection;
};

/**
 * Generate full scenario comparison for a commercial model
 */
export const generateScenarioComparison = (
  model: CommercialModel,
  results: UnifiedResults
): ScenarioComparison => {
  const baseMonthlyIncremental = getBaseMonthlyIncremental(results);
  const baseMonthlyRevenue = results.totals.currentMonthlyRevenue;
  
  const projection = generateMonthlyProjection(model, baseMonthlyIncremental, baseMonthlyRevenue);
  const final = projection[projection.length - 1];
  
  const suppression = calculateValueSuppression(
    model.type,
    final.cumulativeIncremental + final.cumulativeValueSuppressed, // Full potential
    model.params
  );
  
  const netPublisherGainPercentage = final.cumulativeIncremental > 0
    ? (final.cumulativePublisherGain / final.cumulativeIncremental) * 100
    : 0;
  
  // ROI = Publisher Net Gain / Total Fees Paid
  const roiMultiple = final.cumulativeAdfixusShare > 0
    ? final.cumulativePublisherGain / final.cumulativeAdfixusShare
    : 0;
  
  return {
    model,
    baseRevenue: baseMonthlyRevenue * 36,
    incrementalRevenue: final.cumulativeIncremental,
    publisherNetGain: final.cumulativePublisherGain,
    adfixusShare: final.cumulativeAdfixusShare,
    valueSuppressed: final.cumulativeValueSuppressed,
    suppressionReason: suppression.reason,
    monthlyProjection: projection,
    netPublisherGainPercentage,
    roiMultiple,
  };
};

/**
 * Generate all three scenario comparisons
 */
export const generateAllScenarios = (
  results: UnifiedResults
): ScenarioComparison[] => {
  return COMMERCIAL_MODELS.map(model => 
    generateScenarioComparison(model, results)
  );
};

/**
 * Generate waterfall steps for a scenario
 */
export const generateWaterfall = (scenario: ScenarioComparison): WaterfallStep[] => {
  const steps: WaterfallStep[] = [
    {
      label: 'Incremental Revenue',
      value: scenario.incrementalRevenue + scenario.valueSuppressed, // Full potential
      type: 'total',
      color: 'hsl(var(--primary))',
    },
    {
      label: 'Publisher Keeps',
      value: scenario.publisherNetGain,
      type: 'positive',
      color: 'hsl(142 76% 36%)', // Success green
    },
    {
      label: 'Share of Upside',
      value: scenario.adfixusShare,
      type: 'neutral',
      color: 'hsl(var(--muted-foreground))',
    },
  ];
  
  // Add suppressed value for non-revenue-share models
  if (scenario.valueSuppressed > 0) {
    steps.push({
      label: 'Lost / Suppressed',
      value: scenario.valueSuppressed,
      type: 'negative',
      color: 'hsl(0 84% 60%)', // Destructive red
    });
  }
  
  return steps;
};

/**
 * Get the proof point data
 */
export const getProofPoint = () => ({
  quote: "Having the AdFixus ID allowed us to build products that won back ~$1.8M in NEW revenue we were not seeing before. Our largest partner increased spend from $300K to $1M in a single booking.",
  author: "Stephen Kyefulumya",
  title: "GM Media Product & Technology",
  company: "Carsales",
});

/**
 * Format currency for display
 */
export const formatCommercialCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};
