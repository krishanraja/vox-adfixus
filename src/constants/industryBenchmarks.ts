// Industry benchmarks and constants for unified calculations
// All values based on publicly available industry data

export const CAPI_BENCHMARKS = {
  BASELINE_MATCH_RATE: 0.30, // 30% without CAPI
  IMPROVED_MATCH_RATE: 0.75, // 75% with AdFixus (conservative)
  AGGRESSIVE_MATCH_RATE: 0.85, // 85% (upper bound)
  SERVICE_FEE_PERCENTAGE: 0.125, // 12.5%
  CAMPAIGN_ADOPTION_RATE: 0.20, // 20% of advertisers use CAPI
  CONVERSION_MULTIPLIER: 1.4, // 40% conversion improvement
  CTR_MULTIPLIER: 1.25, // 25% CTR improvement
};

export const MEDIA_PERFORMANCE_BENCHMARKS = {
  BASELINE_ROAS: 2.5,
  IMPROVED_ROAS: 3.5, // 40% improvement
  BASELINE_MAKEGOOD_RATE: 0.05, // 5% (reduced from 8%)
  IMPROVED_MAKEGOOD_RATE: 0.02, // 2%
  PREMIUM_INVENTORY_SHARE: 0.20, // 20% of inventory sold as premium (reduced from 30%)
  YIELD_UPLIFT_PERCENTAGE: 0.15, // 15% yield uplift on premium inventory (reduced from 25%)
};

// Vox Media browser traffic shares (blended mobile/desktop from Dec 2024 data)
// FIXED VALUES - DO NOT CALCULATE FROM DOMAIN DATA
export const ADDRESSABILITY_BENCHMARKS = {
  // Fixed Safari share for all calculations (35% per Vox Dec 2024 data)
  SAFARI_SHARE: 0.35, // 35% Safari traffic - FIXED, not calculated
  CHROME_SHARE: 0.48, // 48% Chrome traffic
  OTHER_SHARE: 0.17, // 17% Other browsers
  
  // Fixed baseline addressability (65% per Vox guidance)
  BASELINE_TOTAL_ADDRESSABILITY: 0.65, // 65% of inventory currently addressable
  
  // SAFARI-SPECIFIC addressability (THE KEY POC KPI)
  // Current state: 0% - Safari users unaddressable due to ITP
  // POC Target: +20% addressability improvement on Safari inventory
  CURRENT_SAFARI_ADDRESSABILITY: 0.0, // 0% - Safari users unaddressable due to ITP
  TARGET_SAFARI_ADDRESSABILITY: 0.20, // 20% POC target improvement
  STRETCH_SAFARI_ADDRESSABILITY: 0.30, // 30% internal stretch goal
  
  // Chrome/Other = 100% addressable (no ITP restrictions)
  CHROME_ADDRESSABILITY: 1.0,
  OTHER_ADDRESSABILITY: 1.0,
  
  CPM_IMPROVEMENT_FACTOR: 0.25, // 25% CPM boost on newly addressable
};

export const OPERATIONAL_BENCHMARKS = {
  BASELINE_ID_MULTIPLIER: 3.0, // 1 user = 3.0 IDs without solution
  IMPROVED_ID_MULTIPLIER: 1.1, // 1 user = 1.1 IDs with AdFixus
  // CDP Savings: Fixed at $3,500/month per Vox guidance
  CDP_MONTHLY_SAVINGS: 3500, // $3,500/month - FIXED VALUE
  MANUAL_LABOR_HOURS_SAVED: 40, // hours per month
  HOURLY_RATE: 75, // $75/hour for ad ops labor
  ID_REDUCTION_PERCENTAGE: 0.63, // 63% reduction in ID bloat
};

export const SCENARIO_MULTIPLIERS = {
  DEPLOYMENT: {
    SINGLE: 1.0, // Single domain baseline
    MULTI: 0.8, // 80% per additional domain (5-10 domains)
    FULL: 1.2, // 120% with network effects (15+ domains)
  },
  RAMP_UP: {
    MONTH_1_3: 0.15, // 15% in first 3 months
    MONTH_4_6: 0.35, // 35% in months 4-6
    MONTH_7_12: 1.0, // 100% from month 7 onwards
  },
};

// Campaign-specific CAPI values (benefit #4 from AdFixus_Benefits.xlsx)
export const CAPI_CAMPAIGN_VALUES = {
  ESTIMATED_CAPI_CAMPAIGNS_PER_MONTH: 10, // Conservative: 10 campaigns/month using CAPI
  AVG_CAMPAIGN_SPEND: 100000, // $100K average campaign spend
  SERVICE_FEE_PERCENTAGE: 0.125, // 12.5% service fee
  CONVERSION_RATE_MULTIPLIER: 1.40, // 40% conversion improvement
};

// CAPI Base Parameters for Dynamic Calculation based on Business Readiness
// CAPI campaigns are now OUTPUTS based on readiness factors, not manual inputs
export const CAPI_BASE_PARAMETERS = {
  // Base annual CAPI campaigns (conservative baseline - 2 in POC period)
  BASE_YEARLY_CAMPAIGNS: 8,
  
  // Base average campaign spend
  BASE_AVG_CAMPAIGN_SPEND: 75000, // $75K baseline
  
  // Maximum multipliers for readiness factors
  MAX_VOLUME_MULTIPLIER: 3.0, // Can grow to 3x base (24 campaigns/year)
  MAX_SPEND_MULTIPLIER: 2.0, // Can grow to 2x base ($150K/campaign)
  
  // Monthly ramp-up distribution for yearly campaigns
  // Weighted toward second half of year (realistic POC → scale pattern)
  MONTHLY_RAMP_WEIGHTS: [0.05, 0.08, 0.08, 0.08, 0.08, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.07],
};
