// Risk scenario definitions based on organizational readiness and execution factors

export type RiskScenario = 'conservative' | 'moderate' | 'optimistic';

export interface ReadinessDefaults {
  salesReadiness: number;
  trainingGaps: number;
  advertiserBuyIn: number;
  marketConditions: number;
}

export interface RiskMultipliers {
  // Time to full value (months)
  rampUpMonths: number;
  
  // Adoption rate (what % of potential is realized)
  adoptionRate: number;
  
  // Technical/operational friction
  addressabilityEfficiency: number; // 0.7 = only 70% of expected addressability gain
  capiDeploymentRate: number; // 0.6 = only 60% of campaigns get CAPI
  premiumInventoryShare: number; // Might be lower than expected if sales struggles
  
  // Commercial execution
  cpmUpliftRealization: number; // 0.8 = only 80% of expected uplift realized
  salesEffectiveness: number; // Affects CAPI revenue generation
  
  // CDP cost savings confidence
  cdpSavingsRealization: number;
  
  // Scenario-specific CAPI readiness defaults (drives campaign volume)
  defaultReadiness: ReadinessDefaults;
}

export const RISK_SCENARIOS: Record<RiskScenario, RiskMultipliers> = {
  conservative: {
    rampUpMonths: 12, // 12 months to full value (aligned with sales ramp, not deployment)
    adoptionRate: 0.78, // 78% of properties/campaigns get full deployment
    addressabilityEfficiency: 0.82, // Minor DNS delays, mostly complete rollout
    capiDeploymentRate: 0.75, // 75% of campaigns use CAPI
    premiumInventoryShare: 0.20, // Sales doesn't position premium effectively
    cpmUpliftRealization: 0.80, // 80% of expected uplift realized
    salesEffectiveness: 0.80, // Sales training mostly complete
    cdpSavingsRealization: 0.85, // Minor technical delays in ID reduction
    // Conservative: Low readiness → fewer CAPI campaigns → lower ROI
    defaultReadiness: {
      salesReadiness: 0.55,      // Sales team struggles with new products
      trainingGaps: 0.50,        // Significant training gaps
      advertiserBuyIn: 0.55,     // Advertisers slow to adopt CAPI
      marketConditions: 0.65,    // Cautious market environment
    },
  },
  
  moderate: {
    rampUpMonths: 9, // 9 months to full value (faster with good execution)
    adoptionRate: 0.72, // 72% deployment across portfolio
    addressabilityEfficiency: 0.75, // Expected friction
    capiDeploymentRate: 0.65, // 65% of expected campaigns
    premiumInventoryShare: 0.22, // Slightly below optimal
    cpmUpliftRealization: 0.78, // 78% of expected uplift
    salesEffectiveness: 0.72, // Good but not perfect sales execution
    cdpSavingsRealization: 0.80, // Some delays
    // Moderate: Standard readiness → baseline CAPI campaigns
    defaultReadiness: {
      salesReadiness: 0.75,      // Good sales execution
      trainingGaps: 0.75,        // Adequate training
      advertiserBuyIn: 0.80,     // Reasonable adoption
      marketConditions: 0.85,    // Normal market
    },
  },
  
  optimistic: {
    rampUpMonths: 6, // Fast 6-month ramp
    adoptionRate: 0.80, // 80% deployment (realistic ceiling)
    addressabilityEfficiency: 0.82, // Good efficiency with some friction
    capiDeploymentRate: 0.75, // Strong but realistic CAPI adoption
    premiumInventoryShare: 0.25, // Good premium positioning
    cpmUpliftRealization: 0.82, // 82% of expected uplift
    salesEffectiveness: 0.80, // Very good sales execution
    cdpSavingsRealization: 0.85, // Minor delays
    // Optimistic: High readiness → more CAPI campaigns → higher ROI (but capped)
    defaultReadiness: {
      salesReadiness: 0.90,      // Excellent sales execution
      trainingGaps: 0.90,        // Comprehensive training
      advertiserBuyIn: 0.90,     // Strong advertiser adoption
      marketConditions: 0.90,    // Strong market conditions
    },
  },
};

export const RISK_SCENARIO_DESCRIPTIONS: Record<RiskScenario, string> = {
  conservative: 'Cautious execution with expected friction. 12-month sales ramp with training gaps and gradual advertiser adoption.',
  moderate: 'Solid enterprise rollout. 9-month ramp with good sales adoption and manageable friction.',
  optimistic: 'Strong execution, dedicated ownership. 6-month ramp with excellent sales training and advertiser buy-in.',
};

// Key risk factors that affect each scenario
export const RISK_FACTORS = {
  conservative: [
    'Sales team not trained on addressable products',
    'Technical integration delays across properties',
    'Limited CAPI campaign setup by advertisers',
    'Organizational change management challenges',
    'Slow reporting and proof-of-value cycles',
  ],
  moderate: [
    'Some sales execution gaps',
    'Normal technical rollout timelines',
    'Partial CAPI adoption by advertisers',
    'Standard enterprise deployment friction',
  ],
  optimistic: [
    'Dedicated project leadership',
    'Sales team fully trained and incentivized',
    'Fast technical deployment',
    'Strong advertiser buy-in',
    'Clear success metrics and rapid feedback',
  ],
};
