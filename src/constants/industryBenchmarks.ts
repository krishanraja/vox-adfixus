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
  PUBLISHER_VALUE_CAPTURE: 0.30, // 30% of advertiser uplift
  BASELINE_MAKEGOOD_RATE: 0.08, // 8%
  IMPROVED_MAKEGOOD_RATE: 0.02, // 2%
  PREMIUM_CPM_MULTIPLIER: 1.15, // 15% premium for better performance
  ADVERTISER_RETENTION_VALUE: 1.25, // 25% higher LTV from better performance
};

export const ADDRESSABILITY_BENCHMARKS = {
  CHROME_SHARE: 0.50, // 50% default
  SAFARI_IOS_SHARE: 0.35, // 35% default
  FIREFOX_OTHER: 0.15, // 15%
  CURRENT_SAFARI_ADDRESSABILITY: 0.20, // 20% addressable without solution
  IMPROVED_SAFARI_ADDRESSABILITY: 0.85, // 85% with AdFixus
  CPM_IMPROVEMENT_FACTOR: 1.25, // 25% CPM boost on newly addressable
  CPM_PREMIUM_MULTIPLIER: 1.20, // 20% premium on improved inventory
};

export const OPERATIONAL_BENCHMARKS = {
  BASELINE_ID_MULTIPLIER: 4.5, // 1 user = 4.5 IDs without solution
  IMPROVED_ID_MULTIPLIER: 1.2, // 1 user = 1.2 IDs with AdFixus
  COST_PER_ID: 0.004, // $0.004 per ID in CDP
  MANUAL_LABOR_HOURS_SAVED: 40, // hours per month
  HOURLY_RATE: 75, // $75/hour for ad ops labor
  ID_REDUCTION_PERCENTAGE: 0.73, // 73% reduction in ID bloat
};

export const SCENARIO_MULTIPLIERS = {
  DEPLOYMENT: {
    SINGLE: 1.0, // Single domain baseline
    MULTI: 0.8, // 80% per additional domain (5-10 domains)
    FULL: 1.2, // 120% with network effects (15+ domains)
  },
  ADDRESSABILITY: {
    LIMITED: 0.5, // Chrome only = 50% of potential
    PARTIAL: 0.7, // Chrome + some Safari = 70% of potential
    FULL: 1.0, // 100% addressability
  },
  RAMP_UP: {
    MONTH_1_3: 0.15, // 15% in first 3 months
    MONTH_4_6: 0.35, // 35% in months 4-6
    MONTH_7_12: 1.0, // 100% from month 7 onwards
  },
};

// Average campaign values for CAPI calculations
export const CAMPAIGN_VALUES = {
  AVG_CAMPAIGN_SPEND: 50000, // $50K average campaign
  CAMPAIGN_CONVERSION_RATE: 0.02, // 2% of pageviews lead to campaign interest
  CAPI_ADOPTION_RATE: 0.20, // 20% of campaigns use CAPI
};
