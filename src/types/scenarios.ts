// Scenario-based calculator types

export type DeploymentType = 'single' | 'multi' | 'full';
export type ScopeType = 'id-only' | 'id-capi' | 'id-capi-performance';

export interface ScenarioState {
  deployment: DeploymentType;
  scope: ScopeType;
}

export interface SimplifiedInputs {
  selectedDomains: string[]; // Array of domain IDs from VOX_MEDIA_DOMAINS
  displayCPM: number;
  videoCPM: number;
  capiCampaignsPerMonth: number;
  avgCampaignSpend: number;
  capiLineItemShare: number; // 0.20 - 1.00, default 0.60 (60% of campaign spend is CAPI-enabled)
  domainPageviewOverrides?: Record<string, number>; // Optional overrides for domain monthly pageviews
  safariShareOverrides?: Record<string, number>; // Optional overrides for domain Safari traffic share (0.0 - 1.0)
}

export interface AssumptionOverrides {
  // ID Infrastructure
  safariBaselineAddressability?: number; // 0.40 - 0.70, default 0.55
  safariWithDurableId?: number; // 0.75 - 0.95, default 0.85
  cpmUpliftFactor?: number; // 0.10 - 0.40, default 0.25
  cdpCostReduction?: number; // 0.10 - 0.18, default 0.14
  
  // CAPI
  capiServiceFee?: number; // 0.10 - 0.20, default 0.125
  capiMatchRate?: number; // 0.50 - 0.90, default 0.75
  
  // Media Performance
  premiumInventoryShare?: number; // 0.20 - 0.50, default 0.30
  premiumYieldUplift?: number; // 0.15 - 0.40, default 0.25
  
  // Business Readiness Factors
  readinessFactors?: {
    salesReadiness?: number; // 0.5-1.0, affects sales effectiveness
    technicalDeploymentMonths?: number; // 3-18 months, affects ramp-up
    advertiserBuyIn?: number; // 0.6-1.0, affects CAPI deployment rate
    organizationalOwnership?: number; // 0.6-1.0, affects adoption rate
    marketConditions?: number; // 0.7-1.0, overall market dampener
    trainingGaps?: number; // 0.5-1.0, training program quality
    integrationDelays?: number; // 0.6-1.0, potential integration delays
    resourceAvailability?: number; // 0.6-1.0, dedicated resources
  };
}

export interface PricingModel {
  pocFlatFee: number; // $15,000
  pocDurationMonths: number; // 3 months
  pocMonthlyEquivalent: number; // $5,000/month
  fullContractMonthly: number; // $26,000/month
  capiServiceFeeRate: number; // 0.125 (12.5%)
  totalMonthlyCapiSpend: number; // Calculated from inputs
  monthlyCapiServiceFees: number; // 12.5% of campaign spend
}

export interface ROIAnalysis {
  // Benefits (Revenue Uplifts)
  totalMonthlyBenefits: number;
  totalAnnualBenefits: number;
  
  // Costs
  costs: {
    pocPhaseMonthly: number; // $5K platform + CAPI fees
    fullContractMonthly: number; // $26K platform + CAPI fees
    platformFeePOC: number; // $5K/month
    platformFeeFull: number; // $26K/month
    capiServiceFees: number; // 12.5% of campaign spend
  };
  
  // Net ROI
  netMonthlyROI: {
    pocPhase: number; // Benefits - POC costs
    fullContract: number; // Benefits - Full contract costs
  };
  netAnnualROI: {
    pocPhase: number;
    fullContract: number;
  };
  
  // ROI Multiples (e.g., 3.5x)
  roiMultiple: {
    pocPhase: number; // Total Benefits / Costs
    fullContract: number;
  };
  
  // Payback Period
  paybackMonths: {
    pocPhase: number;
    fullContract: number;
  };
}

export interface UnifiedResults {
  scenario: ScenarioState;
  inputs: SimplifiedInputs;
  assumptionOverrides?: AssumptionOverrides;
  
  // Risk scenario metadata
  riskScenario?: 'conservative' | 'moderate' | 'optimistic';
  riskAdjustmentSummary?: {
    unadjustedMonthlyUplift: number;
    adjustedMonthlyUplift: number;
    adjustmentPercentage: number;
  };
  
  // Pricing & ROI
  pricing: PricingModel;
  roiAnalysis: ROIAnalysis;
  
  // ID Infrastructure
  idInfrastructure: {
    addressabilityRecovery: number;
    cpmImprovement: number;
    cdpSavings: number;
    monthlyUplift: number;
    annualUplift: number;
    details: {
      // Safari-specific metrics (POC KPI focus)
      safariShare: number;
      currentSafariAddressability: number;
      targetSafariAddressability: number; // Renamed from improvedSafariAddressability
      safariAddressabilityImprovement: number;
      // Total inventory metrics
      currentAddressability: number;
      improvedAddressability: number;
      totalAddressabilityImprovement: number;
      newlyAddressableImpressions: number;
      addressabilityRevenue: number;
      cdpSavingsRevenue: number;
      idReductionPercentage: number;
      monthlyCdpSavings: number;
    };
  };
  
  // CAPI Capabilities (optional)
  capiCapabilities?: {
    matchRateImprovement: number;
    baselineCapiSpend: number;
    capiEligibleSpend: number; // CAPI-enabled portion of campaign spend
    totalCapiSpendWithImprovement: number;
    conversionTrackingRevenue: number;
    campaignServiceFees: number;
    capiLaborSavings: number;
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
  roiMultiple: number;
  netROI: number;
}

export interface ComparisonData {
  metric: string;
  current: string | number;
  withAdFixus: string | number;
  improvement: string | number;
}
