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
    rampUpMonths: 12, // 12 months to full value
    adoptionRate: 0.68, // 68% of properties get full deployment
    addressabilityEfficiency: 0.72, // Moderate friction in rollout
    capiDeploymentRate: 0.70, // 70% of campaigns use CAPI (raised to narrow gap)
    premiumInventoryShare: 0.18, // Sales struggles with premium positioning
    cpmUpliftRealization: 0.72, // 72% of expected uplift realized
    salesEffectiveness: 0.72, // Moderate sales challenges (raised to narrow gap)
    cdpSavingsRealization: 0.78, // Technical delays in ID reduction
    // Conservative: Low readiness → fewer CAPI campaigns → lower ROI
    defaultReadiness: {
      salesReadiness: 0.55,
      trainingGaps: 0.50,
      advertiserBuyIn: 0.55,
      marketConditions: 0.65,
    },
  },
  
  moderate: {
    rampUpMonths: 9, // 9 months to full value
    adoptionRate: 0.75, // 75% deployment across portfolio
    addressabilityEfficiency: 0.80, // Expected friction
    capiDeploymentRate: 0.72, // 72% of campaigns use CAPI
    premiumInventoryShare: 0.22, // Reasonable premium share
    cpmUpliftRealization: 0.82, // 82% of expected uplift
    salesEffectiveness: 0.78, // Good sales execution
    cdpSavingsRealization: 0.85, // Minor delays
    // Moderate: Standard readiness → baseline CAPI campaigns
    defaultReadiness: {
      salesReadiness: 0.75,
      trainingGaps: 0.75,
      advertiserBuyIn: 0.80,
      marketConditions: 0.85,
    },
  },
  
  optimistic: {
    rampUpMonths: 6, // Fast 6-month ramp
    adoptionRate: 0.82, // 82% deployment (lowered to narrow gap)
    addressabilityEfficiency: 0.85, // Good efficiency (lowered to narrow gap)
    capiDeploymentRate: 0.78, // 78% CAPI adoption (lowered to narrow gap)
    premiumInventoryShare: 0.24, // Good premium positioning
    cpmUpliftRealization: 0.85, // 85% of expected uplift (lowered to narrow gap)
    salesEffectiveness: 0.80, // Good sales execution (lowered to narrow gap)
    cdpSavingsRealization: 0.88, // Quick ID reduction
    // Optimistic: High readiness → more CAPI campaigns → higher ROI (capped)
    defaultReadiness: {
      salesReadiness: 0.90,
      trainingGaps: 0.90,
      advertiserBuyIn: 0.90,
      marketConditions: 0.90,
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
