// Risk scenario definitions based on organizational readiness and execution factors

export type RiskScenario = 'conservative' | 'moderate' | 'optimistic';

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
}

export const RISK_SCENARIOS: Record<RiskScenario, RiskMultipliers> = {
  conservative: {
    rampUpMonths: 12, // 12 months to full value (aligned with sales ramp, not deployment)
    adoptionRate: 0.70, // 70% of properties/campaigns get full deployment
    addressabilityEfficiency: 0.75, // DNS delays, incomplete rollout
    capiDeploymentRate: 0.65, // Sales challenges, 65% of campaigns use CAPI
    premiumInventoryShare: 0.20, // Sales doesn't position premium effectively
    cpmUpliftRealization: 0.75, // 75% of expected uplift realized
    salesEffectiveness: 0.75, // Sales training partial
    cdpSavingsRealization: 0.80, // Some technical delays in ID reduction
  },
  
  moderate: {
    rampUpMonths: 9, // 9 months to full value (faster with good execution)
    adoptionRate: 0.75, // 75% deployment across portfolio
    addressabilityEfficiency: 0.80, // Slight friction expected
    capiDeploymentRate: 0.70, // 70% of expected campaigns
    premiumInventoryShare: 0.22, // Slightly below optimal
    cpmUpliftRealization: 0.80, // 80% of expected uplift
    salesEffectiveness: 0.78, // Good but not perfect sales execution
    cdpSavingsRealization: 0.82, // Minor delays
  },
  
  optimistic: {
    rampUpMonths: 6, // Fast 6-month ramp
    adoptionRate: 0.92, // 92% deployment (realistic ceiling)
    addressabilityEfficiency: 0.95, // Near-full efficiency
    capiDeploymentRate: 0.90, // Strong CAPI adoption
    premiumInventoryShare: 0.28, // Near-achieves target
    cpmUpliftRealization: 0.95, // 95% of expected uplift (not 100%)
    salesEffectiveness: 0.95, // Excellent sales execution
    cdpSavingsRealization: 0.95, // Minimal delays
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
