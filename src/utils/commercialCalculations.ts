// Commercial Model Calculations
// Calculates incentive alignment and 36-month projections for CAPI revenue only
// CRITICAL: Revenue share applies ONLY to CAPI incremental revenue, not the full deal

import { 
  CommercialModel, 
  CommercialModelType,
  ScenarioComparison, 
  MonthlyCommercialData,
  WaterfallStep,
  COMMERCIAL_MODELS,
  INCENTIVE_ALIGNMENT 
} from '@/types/commercialModel';
import { UnifiedResults } from '@/types/scenarios';

// 36-month ramp-up curve (realistic adoption for CAPI campaigns)
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
 * Get CAPI-only monthly incremental revenue
 * CRITICAL: Revenue share applies ONLY to CAPI, not ID Infrastructure or Media Performance
 */
export const getCapiMonthlyIncremental = (results: UnifiedResults): number => {
  // Only CAPI revenue is subject to revenue share
  return results.capiCapabilities?.conversionTrackingRevenue || 0;
};

/**
 * Get the complete deal breakdown for 36 months
 * This ensures all numbers reconcile across views
 */
export const getDealBreakdown = (results: UnifiedResults): {
  idInfrastructure36mo: number;
  capi36mo: number;
  mediaPerformance36mo: number;
  total36mo: number;
  monthly: {
    idInfrastructure: number;
    capi: number;
    mediaPerformance: number;
    total: number;
  };
} => {
  const idInfraMonthly = results.idInfrastructure.monthlyUplift;
  const capiMonthly = results.capiCapabilities?.conversionTrackingRevenue || 0;
  const mediaMonthly = results.mediaPerformance?.monthlyUplift || 0;
  
  // Apply ramp-up curve to get 36-month totals (not simple multiplication)
  let id36 = 0, capi36 = 0, media36 = 0;
  
  for (let month = 0; month < 36; month++) {
    const ramp = RAMP_UP_CURVE[month] || 1.30;
    id36 += idInfraMonthly * ramp;
    capi36 += capiMonthly * ramp;
    media36 += mediaMonthly * ramp;
  }
  
  return {
    idInfrastructure36mo: id36,
    capi36mo: capi36,
    mediaPerformance36mo: media36,
    total36mo: id36 + capi36 + media36,
    monthly: {
      idInfrastructure: idInfraMonthly,
      capi: capiMonthly,
      mediaPerformance: mediaMonthly,
      total: idInfraMonthly + capiMonthly + mediaMonthly,
    },
  };
};

/**
 * Calculate AdFixus share for a given month's CAPI incremental revenue
 * Only applies to CAPI revenue - ID Infrastructure and Media Performance are covered by platform fee
 */
export const calculateAdfixusShare = (
  modelType: CommercialModelType,
  monthlyCapiIncremental: number,
  cumulativeYearFees: number,
  modelParams: CommercialModel['params']
): { fee: number; postCapBenefit: number } => {
  switch (modelType) {
    case 'revenue-share': {
      const shareRate = modelParams.sharePercentage || 0.125;
      // Simple 12.5% uncapped on CAPI revenue
      const fee = monthlyCapiIncremental * shareRate;
      return { fee, postCapBenefit: 0 };
    }
    
    case 'flat-fee': {
      const annualFee = modelParams.annualFlatFee || 1000000;
      // Fixed monthly fee regardless of CAPI revenue
      return { fee: annualFee / 12, postCapBenefit: 0 };
    }
    
    case 'annual-cap': {
      const annualCap = modelParams.annualCap || 1200000;
      const shareRate = modelParams.baseSharePercentage || 0.125;
      
      // Calculate raw fee at 12.5%
      const rawFee = monthlyCapiIncremental * shareRate;
      
      // Check if we've already hit the annual cap
      const remainingCap = Math.max(0, annualCap - cumulativeYearFees);
      
      if (remainingCap <= 0) {
        // Cap already hit - Vox keeps 100% of this month's CAPI increment
        return { fee: 0, postCapBenefit: monthlyCapiIncremental };
      }
      
      // Fee is capped at remaining annual cap
      const actualFee = Math.min(rawFee, remainingCap);
      const postCapBenefit = actualFee < rawFee ? monthlyCapiIncremental - (actualFee / shareRate) : 0;
      
      return { fee: actualFee, postCapBenefit };
    }
    
    default:
      return { fee: 0, postCapBenefit: 0 };
  }
};

/**
 * Generate 36-month projection for CAPI commercial model
 * CRITICAL: This applies only to CAPI revenue, not the full deal
 */
export const generateMonthlyProjection = (
  model: CommercialModel,
  baseMonthlyCapiIncremental: number,
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
    
    // CAPI incremental for this month (with ramp-up)
    const monthlyIncremental = baseMonthlyCapiIncremental * rampUp;
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
    
    // Publisher net gain from CAPI = incremental - fees
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
 * Generate full scenario comparison for a CAPI commercial model
 * IMPORTANT: This shows CAPI-only economics, not the total deal
 */
export const generateScenarioComparison = (
  model: CommercialModel,
  results: UnifiedResults
): ScenarioComparison => {
  // CRITICAL: Use CAPI-only revenue, not total deal
  const baseMonthlyCapiIncremental = getCapiMonthlyIncremental(results);
  const baseMonthlyRevenue = results.totals.currentMonthlyRevenue;
  
  const projection = generateMonthlyProjection(model, baseMonthlyCapiIncremental, baseMonthlyRevenue);
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
 * Generate all three scenario comparisons for CAPI
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
      label: 'CAPI Incremental',
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
