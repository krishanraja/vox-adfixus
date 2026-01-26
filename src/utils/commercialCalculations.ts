// Commercial Model Calculations
// Calculates incentive alignment and 36-month projections for each model
// CORRECTED: Annual cap provides unlimited upside to Vox after cap, not "suppression"

import { 
  CommercialModel, 
  CommercialModelType,
  ScenarioComparison, 
  MonthlyCommercialData,
  WaterfallStep,
  IncentiveAlignment,
  COMMERCIAL_MODELS,
  INCENTIVE_ALIGNMENT 
} from '@/types/commercialModel';
import { UnifiedResults } from '@/types/scenarios';

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
 * Calculate AdFixus share for a given month's incremental revenue
 * CORRECTED: Proper cap math, no suppression
 */
export const calculateAdfixusShare = (
  modelType: CommercialModelType,
  monthlyIncremental: number,
  cumulativeYearFees: number,
  modelParams: CommercialModel['params']
): { fee: number; postCapBenefit: number } => {
  switch (modelType) {
    case 'revenue-share': {
      const shareRate = modelParams.sharePercentage || 0.125;
      // Simple 12.5% uncapped
      const fee = monthlyIncremental * shareRate;
      return { fee, postCapBenefit: 0 };
    }
    
    case 'flat-fee': {
      const annualFee = modelParams.annualFlatFee || 1000000;
      // Fixed monthly fee regardless of revenue
      return { fee: annualFee / 12, postCapBenefit: 0 };
    }
    
    case 'annual-cap': {
      const annualCap = modelParams.annualCap || 1200000;
      const shareRate = modelParams.baseSharePercentage || 0.125;
      
      // Calculate raw fee at 12.5%
      const rawFee = monthlyIncremental * shareRate;
      
      // Check if we've already hit the annual cap
      const remainingCap = Math.max(0, annualCap - cumulativeYearFees);
      
      if (remainingCap <= 0) {
        // Cap already hit - Vox keeps 100% of this month's increment
        return { fee: 0, postCapBenefit: monthlyIncremental };
      }
      
      // Fee is capped at remaining annual cap
      const actualFee = Math.min(rawFee, remainingCap);
      const postCapBenefit = actualFee < rawFee ? monthlyIncremental - (actualFee / shareRate) : 0;
      
      return { fee: actualFee, postCapBenefit };
    }
    
    default:
      return { fee: 0, postCapBenefit: 0 };
  }
};

/**
 * Generate 36-month projection for a commercial model
 * CORRECTED: No value suppression, proper cap handling
 */
export const generateMonthlyProjection = (
  model: CommercialModel,
  baseMonthlyIncremental: number,
  baseMonthlyRevenue: number
): MonthlyCommercialData[] => {
  const projection: MonthlyCommercialData[] = [];
  let cumulativeIncremental = 0;
  let cumulativePublisherGain = 0;
  let cumulativeAdfixusShare = 0;
  let cumulativePostCapBenefit = 0;
  
  // Track cumulative fees per year for annual cap calculation
  let yearFees = 0;
  let currentYear = 0;
  
  for (let month = 1; month <= 36; month++) {
    const rampUp = RAMP_UP_CURVE[month - 1] || 1.30;
    const thisYear = Math.floor((month - 1) / 12);
    
    // Reset year fees at start of new year
    if (thisYear !== currentYear) {
      yearFees = 0;
      currentYear = thisYear;
    }
    
    // Full incremental for this month (same for all models - no suppression)
    const monthlyIncremental = baseMonthlyIncremental * rampUp;
    cumulativeIncremental += monthlyIncremental;
    
    // Calculate AdFixus share based on model
    const { fee: adfixusShare, postCapBenefit } = calculateAdfixusShare(
      model.type,
      monthlyIncremental,
      yearFees,
      model.params
    );
    
    yearFees += adfixusShare;
    cumulativeAdfixusShare += adfixusShare;
    cumulativePostCapBenefit += postCapBenefit;
    
    // Publisher net gain = incremental - fees
    const publisherGain = monthlyIncremental - adfixusShare;
    cumulativePublisherGain += publisherGain;
    
    projection.push({
      month,
      monthLabel: `M${month}`,
      baseRevenue: baseMonthlyRevenue,
      incrementalRevenue: monthlyIncremental,
      cumulativeIncremental,
      publisherNetGain: publisherGain,
      cumulativePublisherGain,
      adfixusShare,
      cumulativeAdfixusShare,
      postCapBenefit,
      cumulativePostCapBenefit,
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
    incentiveAlignment: INCENTIVE_ALIGNMENT[model.type],
    postCapBenefit: final.cumulativePostCapBenefit,
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
 * CORRECTED: Shows post-cap benefit instead of suppression
 */
export const generateWaterfall = (scenario: ScenarioComparison): WaterfallStep[] => {
  const steps: WaterfallStep[] = [
    {
      label: 'Incremental Revenue',
      value: scenario.incrementalRevenue,
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
  
  // For annual cap model, show the post-cap benefit (goes 100% to Vox)
  if (scenario.postCapBenefit > 0) {
    steps.push({
      label: 'Post-Cap (100% to Vox)',
      value: scenario.postCapBenefit,
      type: 'highlight',
      color: 'hsl(142 76% 50%)', // Bright green
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
