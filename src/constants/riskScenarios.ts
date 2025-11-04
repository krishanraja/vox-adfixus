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
    rampUpMonths: 18, // Takes 18 months to full value
    adoptionRate: 0.60, // Only 60% of properties/campaigns get full deployment
    addressabilityEfficiency: 0.70, // DNS delays, incomplete rollout
    capiDeploymentRate: 0.50, // Sales struggles, only 50% of campaigns use CAPI
    premiumInventoryShare: 0.20, // Sales doesn't position premium effectively
    cpmUpliftRealization: 0.70, // Only 70% of expected uplift (= 17.5% actual)
    salesEffectiveness: 0.60, // Sales training incomplete
    cdpSavingsRealization: 0.70, // Some technical delays in ID reduction
  },
  
  moderate: {
    rampUpMonths: 12, // 12 months to full value (base assumption)
    adoptionRate: 0.80, // 80% deployment across portfolio
    addressabilityEfficiency: 0.85,
    capiDeploymentRate: 0.75, // 75% of expected campaigns
    premiumInventoryShare: 0.25, // Slightly below optimal
    cpmUpliftRealization: 0.85, // 85% of expected uplift
    salesEffectiveness: 0.80,
    cdpSavingsRealization: 0.85,
  },
  
  optimistic: {
    rampUpMonths: 6, // Fast 6-month ramp
    adoptionRate: 1.0, // Full deployment as planned
    addressabilityEfficiency: 1.0,
    capiDeploymentRate: 1.0,
    premiumInventoryShare: 0.30, // Achieves target
    cpmUpliftRealization: 1.0, // Full uplift realized
    salesEffectiveness: 1.0,
    cdpSavingsRealization: 1.0,
  },
};

export const RISK_SCENARIO_DESCRIPTIONS: Record<RiskScenario, string> = {
  conservative: 'Sales execution challenges, technical delays, 18-month ramp. Accounts for training gaps, integration friction, and cautious buyer adoption.',
  moderate: 'Normal enterprise rollout with expected friction. 12-month ramp with partial sales adoption and some technical delays.',
  optimistic: 'Smooth deployment, strong sales execution, 6-month ramp. Assumes dedicated project ownership and buyer readiness.',
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
