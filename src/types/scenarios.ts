// Scenario-based calculator types

export type DeploymentType = 'single' | 'multi' | 'full';
export type ScopeType = 'id-only' | 'id-capi' | 'id-capi-performance';

export interface ScenarioState {
  deployment: DeploymentType;
  scope: ScopeType;
}

export interface SimplifiedInputs {
  selectedDomains: string[]; // Array of domain IDs from VOX_MEDIA_DOMAINS
  capiCampaignsPerMonth: number;
  avgCampaignSpend: number;
}

export interface UnifiedResults {
  scenario: ScenarioState;
  inputs: SimplifiedInputs;
  
  // Risk scenario metadata
  riskScenario?: 'conservative' | 'moderate' | 'optimistic';
  riskAdjustmentSummary?: {
    unadjustedMonthlyUplift: number;
    adjustedMonthlyUplift: number;
    adjustmentPercentage: number;
  };
  
  // ID Infrastructure
  idInfrastructure: {
    addressabilityRecovery: number;
    cpmImprovement: number;
    cdpSavings: number;
    monthlyUplift: number;
    annualUplift: number;
    details: {
      currentAddressability: number;
      improvedAddressability: number;
      newlyAddressableImpressions: number;
      addressabilityRevenue: number; // Separated from CDP
      cdpSavingsRevenue: number; // Separated from addressability
      idReductionPercentage: number;
      monthlyCdpSavings: number;
    };
  };
  
  // CAPI Capabilities (optional)
  capiCapabilities?: {
    matchRateImprovement: number;
    conversionTrackingRevenue: number;
    campaignServiceFees: number;
    monthlyUplift: number;
    annualUplift: number;
    details: {
      baselineMatchRate: number;
      improvedMatchRate: number;
      conversionImprovement: number;
      ctrImprovement: number;
    };
  };
  
  // Media Performance (optional)
  mediaPerformance?: {
    advertiserROASImprovement: number;
    makeGoodReduction: number;
    premiumPricingPower: number;
    monthlyUplift: number;
    annualUplift: number;
    details: {
      baselineROAS: number;
      improvedROAS: number;
      baselineMakeGoodRate: number;
      improvedMakeGoodRate: number;
      makeGoodSavings: number;
    };
  };
  
  // Totals
  totals: {
    currentMonthlyRevenue: number;
    totalMonthlyUplift: number;
    totalAnnualUplift: number;
    threeYearProjection: number;
    percentageImprovement: number;
  };
  
  // Breakdown
  breakdown: {
    idInfrastructurePercent: number;
    capiPercent: number;
    performancePercent: number;
  };
}

export interface MonthlyProjection {
  month: number;
  monthLabel: string;
  currentRevenue: number;
  projectedRevenue: number;
  uplift: number;
  rampUpFactor: number;
}

export interface ComparisonData {
  metric: string;
  current: string | number;
  withAdFixus: string | number;
  improvement: string | number;
}
