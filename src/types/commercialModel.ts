// Commercial Model Types for CFO-level scenario comparison
// Language: "share of upside" not "cost", "alignment model" not "pricing"

export type CommercialModelType = 'revenue-share' | 'annual-cap' | 'flat-fee';

export interface CommercialModel {
  type: CommercialModelType;
  label: string;
  shortLabel: string;
  description: string;
  isRecommended: boolean;
  tagline: string;
  
  // Model-specific parameters
  params: {
    // Revenue Share (12.5% uncapped)
    sharePercentage?: number;
    
    // Annual Cap ($1.2M cap, $300K floor at 12.5%)
    annualCap?: number;
    annualFloor?: number;
    baseSharePercentage?: number;
    
    // Flat Fee ($1M annual)
    annualFlatFee?: number;
  };
}

// Incentive alignment replaces "value suppression"
export interface IncentiveAlignment {
  alignmentScore: number; // 0-100
  partnershipLevel: 'Full Partnership' | 'Limited Partnership' | 'Vendor Relationship';
  investmentLevel: 'Maximum' | 'Reduced' | 'Minimum';
  description: string;
}

export interface ScenarioComparison {
  model: CommercialModel;
  
  // Revenue isolation
  baseRevenue: number;           // Existing revenue (untouched)
  incrementalRevenue: number;    // AdFixus-created (36-month cumulative)
  
  // Financial outcomes
  publisherNetGain: number;
  adfixusShare: number;
  
  // Incentive alignment (replaces value suppression)
  incentiveAlignment: IncentiveAlignment;
  
  // For visualization: what happens after cap is hit (annual-cap model)
  postCapBenefit: number; // Revenue that goes 100% to Vox after cap
  
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
  
  // Post-cap benefit (for annual-cap model)
  postCapBenefit: number;
  cumulativePostCapBenefit: number;
}

// The three locked commercial scenarios - CORRECTED PARAMETERS
export const COMMERCIAL_MODELS: CommercialModel[] = [
  {
    type: 'revenue-share',
    label: 'Revenue Share (Uncapped)',
    shortLabel: 'Rev Share',
    description: '12.5% on all CAPI line items. Both parties incentivized to grow.',
    isRecommended: true,
    tagline: 'Aligned incentives. Mutual growth.',
    params: {
      sharePercentage: 0.125, // 12.5% uncapped
    },
  },
  {
    type: 'annual-cap',
    label: 'Annual Cap',
    shortLabel: 'Annual Cap',
    description: '12.5% with Year-1 cap at $1.2M, $300K floor. Unlimited upside for Vox after cap.',
    isRecommended: false,
    tagline: 'Capped risk. Partner incentive capped too.',
    params: {
      annualCap: 1200000, // $1.2M Year-1 cap
      annualFloor: 300000, // $300K floor
      baseSharePercentage: 0.125, // 12.5% until cap
    },
  },
  {
    type: 'flat-fee',
    label: 'Flat Annual Fee',
    shortLabel: 'Flat Fee',
    description: '$1M annual, scoped, no growth promises. Fixed cost regardless of success.',
    isRecommended: false,
    tagline: 'Fixed cost. No growth alignment.',
    params: {
      annualFlatFee: 1000000, // $1M/year
    },
  },
];

// Incentive alignment data
export const INCENTIVE_ALIGNMENT: Record<CommercialModelType, IncentiveAlignment> = {
  'revenue-share': {
    alignmentScore: 100,
    partnershipLevel: 'Full Partnership',
    investmentLevel: 'Maximum',
    description: 'AdFixus invests in Vox success because our growth is tied to yours. Sales support, training, advertiser outreach, and ongoing optimization included.',
  },
  'annual-cap': {
    alignmentScore: 60,
    partnershipLevel: 'Limited Partnership',
    investmentLevel: 'Reduced',
    description: 'AdFixus incentive drops to zero after $1.2M cap is reached each year. May deprioritize Vox in favor of other clients after cap.',
  },
  'flat-fee': {
    alignmentScore: 20,
    partnershipLevel: 'Vendor Relationship',
    investmentLevel: 'Minimum',
    description: 'No financial incentive for AdFixus to help grow CAPI adoption. Likely minimum viable service level.',
  },
};

// Waterfall step for visualization
export interface WaterfallStep {
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'neutral' | 'total' | 'highlight';
  color: string;
}

// Deal concessions to highlight
export interface DealConcession {
  label: string;
  value: string;
  description: string;
  category: 'capi' | 'contract' | 'poc' | 'onboarding';
}

export const DEAL_CONCESSIONS: DealConcession[] = [
  {
    label: 'CAPI Cap Reduction',
    value: '~30%',
    description: 'CAPI campaign cap is ~30% smaller than standard rate',
    category: 'capi',
  },
  {
    label: 'Contract Discount',
    value: '23%',
    description: 'Reduced overall contract price by 23% vs rate card',
    category: 'contract',
  },
  {
    label: 'POC Discount',
    value: '50%',
    description: '3-month POC at $5K/mo (vs $10K) with full services',
    category: 'poc',
  },
  {
    label: 'Onboarding Waived',
    value: '$11.25K',
    description: 'Waived $11,250 onboarding services fee',
    category: 'onboarding',
  },
];

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
