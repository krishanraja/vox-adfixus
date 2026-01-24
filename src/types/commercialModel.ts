// Commercial Model Types for CFO-level scenario comparison
// Language: "share of upside" not "cost", "alignment model" not "pricing"

export type CommercialModelType = 'revenue-share' | 'flat-fee' | 'annual-cap';

export interface CommercialModel {
  type: CommercialModelType;
  label: string;
  shortLabel: string;
  description: string;
  isRecommended: boolean;
  tagline: string;
  
  // Model-specific parameters
  params: {
    // Revenue Share (12.5% with $30K campaign cap)
    sharePercentage?: number;
    campaignCap?: number;
    
    // Flat Fee
    annualFlatFee?: number;
    
    // Annual Cap
    annualCap?: number;
    baseSharePercentage?: number;
  };
}

export interface ScenarioComparison {
  model: CommercialModel;
  
  // Revenue isolation
  baseRevenue: number;           // Existing revenue (untouched)
  incrementalRevenue: number;    // AdFixus-created (36-month cumulative)
  
  // Financial outcomes
  publisherNetGain: number;
  adfixusShare: number;
  
  // Value leakage (only for flat-fee and cap)
  valueSuppressed: number;       // Revenue that didn't exist due to misalignment
  suppressionReason: string;     // Why value was suppressed
  
  // Monthly breakdown for chart (36 months)
  monthlyProjection: MonthlyCommercialData[];
  
  // Summary metrics
  netPublisherGainPercentage: number; // What % of incremental does publisher keep
  roiMultiple: number;
}

export interface MonthlyCommercialData {
  month: number;
  monthLabel: string;
  
  // Revenue layers
  baseRevenue: number;
  incrementalRevenue: number;
  cumulativeIncremental: number;
  
  // Financial outcomes
  publisherNetGain: number;
  cumulativePublisherGain: number;
  adfixusShare: number;
  cumulativeAdfixusShare: number;
  
  // Value leakage
  valueSuppressed: number;
  cumulativeValueSuppressed: number;
}

// The three locked commercial scenarios
export const COMMERCIAL_MODELS: CommercialModel[] = [
  {
    type: 'revenue-share',
    label: 'Revenue Share',
    shortLabel: 'Rev Share',
    description: 'AdFixus earns only when Vox wins. Share of upside with campaign cap.',
    isRecommended: true,
    tagline: 'Aligned incentives. Uncapped growth.',
    params: {
      sharePercentage: 0.125, // 12.5%
      campaignCap: 30000, // $30K per campaign per month
    },
  },
  {
    type: 'flat-fee',
    label: 'Flat Annual Fee',
    shortLabel: 'Flat Fee',
    description: 'Fixed annual payment regardless of performance. Vendor risk transferred to publisher.',
    isRecommended: false,
    tagline: 'High upfront risk. Misaligned incentives.',
    params: {
      annualFlatFee: 500000, // $500K/year
    },
  },
  {
    type: 'annual-cap',
    label: 'Annual Cap',
    shortLabel: 'Annual Cap',
    description: 'Revenue share capped at annual maximum. Growth throttled after cap.',
    isRecommended: false,
    tagline: 'Capped upside. Throttled growth.',
    params: {
      annualCap: 150000, // $150K/year max
      baseSharePercentage: 0.125, // 12.5% until cap
    },
  },
];

// Waterfall step for visualization
export interface WaterfallStep {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'neutral' | 'total';
  color: string;
}

// PDF export data structure
export interface CommercialPDFData {
  headline: string;
  scenarios: ScenarioComparison[];
  proofPoint: {
    quote: string;
    author: string;
    title: string;
    company: string;
  };
  closingLine: string;
}
