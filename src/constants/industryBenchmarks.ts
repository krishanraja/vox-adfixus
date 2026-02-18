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
  // Make-goods only apply to direct-sold guaranteed inventory, not programmatic
  // 40% is the industry standard for a premium publisher like Vox
  DIRECT_SOLD_INVENTORY_SHARE: 0.40,
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
  // POC Target (external): +20% addressability improvement on Safari inventory
  // Internal calculation target: +35% for ROI modeling (not promised to client)
  CURRENT_SAFARI_ADDRESSABILITY: 0.0, // 0% - Safari users unaddressable due to ITP
  TARGET_SAFARI_ADDRESSABILITY: 0.35, // 35% INTERNAL calculation target (conservative achievable)
  POC_PROMISE_ADDRESSABILITY: 0.20, // 20% POC EXTERNAL promise (what we commit to)
  STRETCH_SAFARI_ADDRESSABILITY: 0.40, // 40% internal stretch goal
  
  // Chrome/Other = 100% addressable (no ITP restrictions)
  CHROME_ADDRESSABILITY: 1.0,
  OTHER_ADDRESSABILITY: 1.0,
  
  CPM_IMPROVEMENT_FACTOR: 0.25, // 25% CPM boost on newly addressable
  CONTEXTUAL_CPM_RATIO: 0.72, // Contextual CPM is ~72% of addressable CPM (industry benchmark)
};

export const OPERATIONAL_BENCHMARKS = {
  BASELINE_ID_MULTIPLIER: 3.5, // 1 user = 3.5 IDs without solution (increased for Vox properties)
  IMPROVED_ID_MULTIPLIER: 1.08, // 1 user = 1.08 IDs with AdFixus (tighter)
  // CDP Savings: Fixed at $3,500/month per Vox guidance
  CDP_MONTHLY_SAVINGS: 3500, // $3,500/month - FIXED VALUE
  MANUAL_LABOR_HOURS_SAVED: 40, // hours per month
  HOURLY_RATE: 75, // $75/hour for ad ops labor
  ID_REDUCTION_PERCENTAGE: 0.69, // 69% reduction in ID bloat (Vox properties have 15-18% overlap)
  CROSS_DOMAIN_OVERLAP: 0.17, // 17% average cross-domain user overlap for Vox portfolio
};

export const SCENARIO_MULTIPLIERS = {
  DEPLOYMENT: {
    SINGLE: 1.0, // Single domain baseline
    MULTI: 0.8, // 80% per additional domain (5-10 domains)
    FULL: 1.2, // 120% with network effects (15+ domains)
  },
  // Updated ramp-up: Early adopters (3 months) then full team (9 months)
  RAMP_UP: {
    MONTH_1_3: 0.40, // 40% in POC (early adopter sellers, 3 months)
    MONTH_4_6: 0.80, // 80% in Q2 (full sales team ramping, months 4-6)
    MONTH_7_12: 1.0, // 100% from month 7 onwards (full capacity)
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
  // Base annual CAPI campaigns (increased from 8 for realistic enterprise publisher)
  BASE_YEARLY_CAMPAIGNS: 12,
  
  // Base average campaign spend
  BASE_AVG_CAMPAIGN_SPEND: 75000, // $75K baseline
  
  // Volume multiplier bounds (tightened to compress ROI variance)
  MIN_VOLUME_MULTIPLIER: 0.7, // Floor at 0.7x base (~8 campaigns/year min)
  MAX_VOLUME_MULTIPLIER: 1.4, // Cap at 1.4x base (~17 campaigns/year max)
  MAX_SPEND_MULTIPLIER: 1.15, // Cap at 1.15x base (~$86K/campaign max)
  
  // Monthly ramp-up distribution for yearly campaigns
  // Weighted toward second half of year (realistic POC → scale pattern)
  MONTHLY_RAMP_WEIGHTS: [0.05, 0.08, 0.08, 0.08, 0.08, 0.10, 0.10, 0.10, 0.10, 0.08, 0.08, 0.07],
};

// CAPI Pricing Model Constants (for visualization and PDF)
// Vox deal: 12.5% revenue share with $30K/campaign/month cap
export const CAPI_PRICING_MODEL = {
  // Revenue share percentage
  REVENUE_SHARE_PERCENTAGE: 0.125, // 12.5%
  
  // Campaign cap - $30K per campaign per month (US market, 2x Australia's $24K cap)
  CAMPAIGN_CAP_MONTHLY: 30000, // $30,000
  
  // Cap threshold - at what campaign spend does the cap kick in?
  // $30K / 12.5% = $240K campaign spend
  CAP_THRESHOLD_SPEND: 240000,
  
  // Conversion improvement for CAPI campaigns (40% improvement baseline)
  ASSUMED_CONVERSION_MULTIPLIER: 1.40,
  
  // Illustrative campaign sizes for charts
  ILLUSTRATIVE_CAMPAIGN_SIZES: [50000, 100000, 150000, 200000, 240000, 300000, 350000, 400000, 500000],
  
  // Value proposition discounts
  VALUE_HIGHLIGHTS: {
    CONTRACT_DISCOUNT_PERCENT: 23, // 23% below rate card
    POC_DISCOUNT_PERCENT: 50, // 50% off during POC
    WAIVED_ONBOARDING_FEE: 11250, // $11,250 waived
    RATE_CARD_MONTHLY: 26000, // Original $26K/mo
    DISCOUNTED_MONTHLY: 19900, // Now $19.9K/mo
    POC_MONTHLY: 5000, // $5K/mo during POC
  },
};
