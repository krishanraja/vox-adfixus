import type { SimplifiedInputs, UnifiedResults, ScenarioState, MonthlyProjection } from '@/types/scenarios';
import {
  CAPI_BENCHMARKS,
  MEDIA_PERFORMANCE_BENCHMARKS,
  ADDRESSABILITY_BENCHMARKS,
  OPERATIONAL_BENCHMARKS,
  SCENARIO_MULTIPLIERS,
  CAPI_CAMPAIGN_VALUES,
} from '@/constants/industryBenchmarks';
import { aggregateDomainInputs } from '@/utils/domainAggregation';
import { RISK_SCENARIOS, type RiskScenario } from '@/constants/riskScenarios';

export class UnifiedCalculationEngine {
  static calculate(
    inputs: SimplifiedInputs, 
    scenario: ScenarioState,
    riskScenario: RiskScenario = 'moderate'
  ): UnifiedResults {
    // Aggregate domain inputs
    const aggregated = aggregateDomainInputs(inputs.selectedDomains);
    const { 
      totalMonthlyPageviews, 
      weightedDisplayCPM, 
      weightedVideoCPM, 
      weightedDisplayVideoSplit 
    } = aggregated;
    
    // Get risk multipliers
    const risk = RISK_SCENARIOS[riskScenario];

    // Calculate base metrics
    const displayShare = weightedDisplayVideoSplit / 100;
    const videoShare = 1 - displayShare;
    const totalImpressions = totalMonthlyPageviews * 2.5; // Avg 2.5 ad impressions per pageview
    const displayImpressions = totalImpressions * displayShare;
    const videoImpressions = totalImpressions * videoShare;

    // Current revenue
    const currentDisplayRevenue = (displayImpressions / 1000) * weightedDisplayCPM;
    const currentVideoRevenue = (videoImpressions / 1000) * weightedVideoCPM;
    const currentMonthlyRevenue = currentDisplayRevenue + currentVideoRevenue;

    // Calculate ID Infrastructure (always included) - BASE before risk adjustment
    const baseIdInfrastructure = this.calculateIdInfrastructure(
      totalMonthlyPageviews,
      weightedDisplayCPM,
      weightedVideoCPM,
      scenario,
      currentMonthlyRevenue,
      displayImpressions,
      videoImpressions
    );

    // Apply risk adjustments to ID infrastructure
    const idInfrastructure = {
      ...baseIdInfrastructure,
      monthlyUplift: baseIdInfrastructure.monthlyUplift * risk.addressabilityEfficiency * risk.cdpSavingsRealization,
      annualUplift: baseIdInfrastructure.annualUplift * risk.addressabilityEfficiency * risk.cdpSavingsRealization,
      details: {
        ...baseIdInfrastructure.details,
        addressabilityRevenue: baseIdInfrastructure.details.addressabilityRevenue * risk.addressabilityEfficiency * risk.cpmUpliftRealization,
        cdpSavingsRevenue: baseIdInfrastructure.details.cdpSavingsRevenue * risk.cdpSavingsRealization,
      }
    };

    // Calculate CAPI Capabilities (if enabled) - BASE before risk adjustment
    let capiCapabilities;
    if (scenario.scope === 'id-capi' || scenario.scope === 'id-capi-performance') {
      const baseCapiCapabilities = this.calculateCapiCapabilities(inputs, scenario, currentMonthlyRevenue);
      
      // Apply risk adjustments to CAPI
      capiCapabilities = {
        ...baseCapiCapabilities,
        monthlyUplift: baseCapiCapabilities.monthlyUplift * risk.capiDeploymentRate * risk.salesEffectiveness,
        annualUplift: baseCapiCapabilities.annualUplift * risk.capiDeploymentRate * risk.salesEffectiveness,
        conversionTrackingRevenue: baseCapiCapabilities.conversionTrackingRevenue * risk.capiDeploymentRate,
        campaignServiceFees: baseCapiCapabilities.campaignServiceFees * risk.salesEffectiveness,
      };
    }

    // Calculate Media Performance (if enabled) - BASE before risk adjustment
    let mediaPerformance;
    if (scenario.scope === 'id-capi-performance') {
      const baseMediaPerformance = this.calculateMediaPerformance(
        totalMonthlyPageviews,
        weightedDisplayCPM,
        weightedVideoCPM,
        weightedDisplayVideoSplit,
        scenario,
        currentMonthlyRevenue,
        displayImpressions,
        videoImpressions
      );
      
      // Apply risk adjustments to media performance
      mediaPerformance = {
        ...baseMediaPerformance,
        monthlyUplift: baseMediaPerformance.monthlyUplift * (risk.premiumInventoryShare / 0.30) * risk.cpmUpliftRealization,
        annualUplift: baseMediaPerformance.annualUplift * (risk.premiumInventoryShare / 0.30) * risk.cpmUpliftRealization,
        premiumPricingPower: baseMediaPerformance.premiumPricingPower * (risk.premiumInventoryShare / 0.30),
      };
    }

    // Calculate totals with adoption rate applied
    const baseMonthlyUplift =
      idInfrastructure.monthlyUplift +
      (capiCapabilities?.monthlyUplift || 0) +
      (mediaPerformance?.monthlyUplift || 0);
    
    const totalMonthlyUplift = baseMonthlyUplift * risk.adoptionRate;
    const totalAnnualUplift = totalMonthlyUplift * 12;
    const threeYearProjection = totalAnnualUplift * 3;
    const percentageImprovement = (totalMonthlyUplift / currentMonthlyRevenue) * 100;

    // Calculate unadjusted values for comparison (what it would be with optimistic)
    const optimisticRisk = RISK_SCENARIOS.optimistic;
    const unadjustedMonthlyUplift = (
      baseIdInfrastructure.monthlyUplift +
      (capiCapabilities ? this.calculateCapiCapabilities(inputs, scenario, currentMonthlyRevenue).monthlyUplift : 0) +
      (mediaPerformance ? this.calculateMediaPerformance(
        totalMonthlyPageviews,
        weightedDisplayCPM,
        weightedVideoCPM,
        weightedDisplayVideoSplit,
        scenario,
        currentMonthlyRevenue,
        displayImpressions,
        videoImpressions
      ).monthlyUplift : 0)
    ) * optimisticRisk.adoptionRate;
    
    const adjustmentPercentage = ((unadjustedMonthlyUplift - totalMonthlyUplift) / unadjustedMonthlyUplift) * 100;

    // Calculate breakdown percentages
    const breakdown = {
      idInfrastructurePercent: (idInfrastructure.monthlyUplift / totalMonthlyUplift) * 100,
      capiPercent: ((capiCapabilities?.monthlyUplift || 0) / totalMonthlyUplift) * 100,
      performancePercent: ((mediaPerformance?.monthlyUplift || 0) / totalMonthlyUplift) * 100,
    };

    return {
      scenario,
      inputs,
      riskScenario,
      riskAdjustmentSummary: {
        unadjustedMonthlyUplift,
        adjustedMonthlyUplift: totalMonthlyUplift,
        adjustmentPercentage,
      },
      idInfrastructure,
      capiCapabilities,
      mediaPerformance,
      totals: {
        currentMonthlyRevenue,
        totalMonthlyUplift,
        totalAnnualUplift,
        threeYearProjection,
        percentageImprovement,
      },
      breakdown,
    };
  }

  private static calculateIdInfrastructure(
    monthlyPageviews: number,
    displayCPM: number,
    videoCPM: number,
    scenario: ScenarioState,
    currentMonthlyRevenue: number,
    displayImpressions: number,
    videoImpressions: number
  ) {
    // Safari addressability: Binary improvement with durable ID
    // Without AdFixus: Safari users lose identity after 7 days
    // With AdFixus: Durable ID recognizes returning users beyond 7 days
    const safariShare = ADDRESSABILITY_BENCHMARKS.SAFARI_IOS_SHARE;
    const currentSafariAddressability = ADDRESSABILITY_BENCHMARKS.WITHOUT_ADFIXUS;
    const improvedSafariAddressability = ADDRESSABILITY_BENCHMARKS.WITH_ADFIXUS;

    const currentAddressability =
      ADDRESSABILITY_BENCHMARKS.CHROME_SHARE +
      safariShare * currentSafariAddressability +
      ADDRESSABILITY_BENCHMARKS.FIREFOX_OTHER;

    const improvedAddressability =
      ADDRESSABILITY_BENCHMARKS.CHROME_SHARE +
      safariShare * improvedSafariAddressability +
      ADDRESSABILITY_BENCHMARKS.FIREFOX_OTHER;

    const addressabilityImprovement = improvedAddressability - currentAddressability;

    // Calculate newly addressable impressions
    const totalImpressions = displayImpressions + videoImpressions;
    const newlyAddressableImpressions = totalImpressions * addressabilityImprovement;
    const newlyAddressableDisplay = displayImpressions * addressabilityImprovement;
    const newlyAddressableVideo = videoImpressions * addressabilityImprovement;

    // CPM improvement on newly addressable inventory
    const improvedDisplayCPM = displayCPM * ADDRESSABILITY_BENCHMARKS.CPM_IMPROVEMENT_FACTOR;
    const improvedVideoCPM = videoCPM * ADDRESSABILITY_BENCHMARKS.CPM_IMPROVEMENT_FACTOR;

    const displayUplift = (newlyAddressableDisplay / 1000) * improvedDisplayCPM;
    const videoUplift = (newlyAddressableVideo / 1000) * improvedVideoCPM;
    const cpmImprovement = displayUplift + videoUplift;

    // CDP cost savings: Percentage-based model (Benefit #5: 30-40% lower platform costs)
    const estimatedMonthlyCdpCosts = OPERATIONAL_BENCHMARKS.ESTIMATED_MONTHLY_CDP_COSTS;
    const cdpCostReduction = OPERATIONAL_BENCHMARKS.CDP_COST_REDUCTION_PERCENTAGE;
    const monthlyCdpSavings = estimatedMonthlyCdpCosts * cdpCostReduction;

    // Apply deployment multiplier only (addressability is binary - either you have durable ID or you don't)
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);

    const addressabilityRevenue = cpmImprovement * deploymentMultiplier;
    const cdpSavingsRevenue = monthlyCdpSavings * deploymentMultiplier;
    const monthlyUplift = addressabilityRevenue + cdpSavingsRevenue;
    const annualUplift = monthlyUplift * 12;

    return {
      addressabilityRecovery: addressabilityImprovement * 100,
      cpmImprovement,
      cdpSavings: monthlyCdpSavings,
      monthlyUplift,
      annualUplift,
      details: {
        currentAddressability: currentAddressability * 100,
        improvedAddressability: improvedAddressability * 100,
        newlyAddressableImpressions,
        addressabilityRevenue, // Separated for transparency
        cdpSavingsRevenue, // Separated for transparency
        idReductionPercentage: OPERATIONAL_BENCHMARKS.ID_REDUCTION_PERCENTAGE * 100,
        monthlyCdpSavings,
      },
    };
  }

  private static calculateCapiCapabilities(
    inputs: SimplifiedInputs,
    scenario: ScenarioState,
    currentMonthlyRevenue: number
  ) {
    // Match rate improvement
    const baselineMatchRate = CAPI_BENCHMARKS.BASELINE_MATCH_RATE;
    const improvedMatchRate = CAPI_BENCHMARKS.IMPROVED_MATCH_RATE;
    const matchRateImprovement = (improvedMatchRate / baselineMatchRate - 1) * 100;

    // Campaign-based service fees (Benefit #4: Ad Performance/CAPI)
    // CAPI benefits come from individual campaigns sold with AdFixus Stream
    // Now using user-configurable inputs instead of hardcoded values
    const estimatedCapiCampaigns = inputs.capiCampaignsPerMonth;
    const avgCampaignSpend = inputs.avgCampaignSpend;
    const campaignServiceFees = estimatedCapiCampaigns * avgCampaignSpend * CAPI_CAMPAIGN_VALUES.SERVICE_FEE_PERCENTAGE;

    // Operational labor savings from CAPI (reduced troubleshooting, better data quality)
    const capiLaborSavings = OPERATIONAL_BENCHMARKS.MANUAL_LABOR_HOURS_SAVED * OPERATIONAL_BENCHMARKS.HOURLY_RATE;

    // Conversion tracking revenue improvement (40% better conversion rates)
    const conversionImprovement = CAPI_CAMPAIGN_VALUES.CONVERSION_RATE_MULTIPLIER - 1;
    const conversionTrackingRevenue = campaignServiceFees * conversionImprovement;

    // Apply deployment multiplier only (CAPI works the same regardless of addressability)
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);

    const monthlyUplift = (campaignServiceFees + capiLaborSavings) * deploymentMultiplier;
    const annualUplift = monthlyUplift * 12;

    return {
      matchRateImprovement,
      conversionTrackingRevenue,
      campaignServiceFees,
      monthlyUplift,
      annualUplift,
      details: {
        baselineMatchRate: baselineMatchRate * 100,
        improvedMatchRate: improvedMatchRate * 100,
        conversionImprovement: conversionImprovement * 100,
        ctrImprovement: (CAPI_BENCHMARKS.CTR_MULTIPLIER - 1) * 100,
      },
    };
  }

  private static calculateMediaPerformance(
    monthlyPageviews: number,
    displayCPM: number,
    videoCPM: number,
    displayVideoSplit: number,
    scenario: ScenarioState,
    currentMonthlyRevenue: number,
    displayImpressions: number,
    videoImpressions: number
  ) {
    // Premium CPM uplift on premium inventory subset (Benefit #3: Higher CPMs)
    // Only applies to inventory sold as premium/performance campaigns
    const premiumInventoryShare = MEDIA_PERFORMANCE_BENCHMARKS.PREMIUM_INVENTORY_SHARE;
    const yieldUplift = MEDIA_PERFORMANCE_BENCHMARKS.YIELD_UPLIFT_PERCENTAGE;

    const premiumDisplayImpressions = displayImpressions * premiumInventoryShare;
    const premiumVideoImpressions = videoImpressions * premiumInventoryShare;

    const displayPremiumUplift = (premiumDisplayImpressions / 1000) * displayCPM * yieldUplift;
    const videoPremiumUplift = (premiumVideoImpressions / 1000) * videoCPM * yieldUplift;
    const premiumPricingPower = displayPremiumUplift + videoPremiumUplift;

    // Make-good reduction savings (applies to all inventory)
    const baselineMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE;
    const improvedMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE;
    const makeGoodSavings = baselineMakeGoods - improvedMakeGoods;

    // Advertiser ROAS improvement (for reference/reporting)
    const baselineROAS = MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_ROAS;
    const improvedROAS = MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_ROAS;
    const roasImprovement = ((improvedROAS - baselineROAS) / baselineROAS) * 100;

    // Apply deployment multiplier only (media performance scales with deployment)
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);

    const monthlyUplift = (premiumPricingPower + makeGoodSavings) * deploymentMultiplier;
    const annualUplift = monthlyUplift * 12;

    return {
      advertiserROASImprovement: roasImprovement,
      makeGoodReduction: (MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE - MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE) * 100,
      premiumPricingPower,
      monthlyUplift,
      annualUplift,
      details: {
        baselineROAS,
        improvedROAS,
        baselineMakeGoodRate: MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE * 100,
        improvedMakeGoodRate: MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE * 100,
        makeGoodSavings,
      },
    };
  }

  private static getDeploymentMultiplier(deployment: string): number {
    switch (deployment) {
      case 'single':
        return SCENARIO_MULTIPLIERS.DEPLOYMENT.SINGLE;
      case 'multi':
        return SCENARIO_MULTIPLIERS.DEPLOYMENT.MULTI;
      case 'full':
        return SCENARIO_MULTIPLIERS.DEPLOYMENT.FULL;
      default:
        return 1;
    }
  }

  static generateMonthlyProjection(results: UnifiedResults): MonthlyProjection[] {
    const { currentMonthlyRevenue, totalMonthlyUplift } = results.totals;
    
    // Get ramp-up months from risk scenario
    const rampUpMonths = results.riskScenario ? RISK_SCENARIOS[results.riskScenario].rampUpMonths : 12;

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      let rampUpFactor = 1;

      // Adjust ramp-up based on risk scenario timeline
      if (rampUpMonths <= 6) {
        // Optimistic: 6-month ramp
        if (month <= 2) rampUpFactor = 0.30;
        else if (month <= 4) rampUpFactor = 0.60;
        else rampUpFactor = 1.0;
      } else if (rampUpMonths <= 12) {
        // Moderate: 12-month ramp
        if (month <= 3) rampUpFactor = 0.25;
        else if (month <= 6) rampUpFactor = 0.50;
        else if (month <= 9) rampUpFactor = 0.75;
        else rampUpFactor = 1.0;
      } else {
        // Conservative: 18-month ramp (only shows first 12 months)
        if (month <= 3) rampUpFactor = 0.15;
        else if (month <= 6) rampUpFactor = 0.30;
        else if (month <= 9) rampUpFactor = 0.50;
        else rampUpFactor = 0.70; // Still ramping at month 12
      }

      const monthlyUplift = totalMonthlyUplift * rampUpFactor;
      const projectedRevenue = currentMonthlyRevenue + monthlyUplift;

      return {
        month,
        monthLabel: `Month ${month}`,
        currentRevenue: currentMonthlyRevenue,
        projectedRevenue,
        uplift: monthlyUplift,
        rampUpFactor,
      };
    });
  }
}
