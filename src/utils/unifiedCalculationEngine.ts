import type { SimplifiedInputs, UnifiedResults, ScenarioState, MonthlyProjection } from '@/types/scenarios';
import {
  CAPI_BENCHMARKS,
  MEDIA_PERFORMANCE_BENCHMARKS,
  ADDRESSABILITY_BENCHMARKS,
  OPERATIONAL_BENCHMARKS,
  SCENARIO_MULTIPLIERS,
  CAPI_CAMPAIGN_VALUES,
} from '@/constants/industryBenchmarks';

export class UnifiedCalculationEngine {
  static calculate(inputs: SimplifiedInputs, scenario: ScenarioState): UnifiedResults {
    const { monthlyPageviews, displayCPM, videoCPM, displayVideoSplit } = inputs;

    // Calculate base metrics
    const displayShare = displayVideoSplit / 100;
    const videoShare = 1 - displayShare;
    const totalImpressions = monthlyPageviews * 2.5; // Avg 2.5 ad impressions per pageview
    const displayImpressions = totalImpressions * displayShare;
    const videoImpressions = totalImpressions * videoShare;

    // Current revenue
    const currentDisplayRevenue = (displayImpressions / 1000) * displayCPM;
    const currentVideoRevenue = (videoImpressions / 1000) * videoCPM;
    const currentMonthlyRevenue = currentDisplayRevenue + currentVideoRevenue;

    // Calculate ID Infrastructure (always included)
    const idInfrastructure = this.calculateIdInfrastructure(
      inputs,
      scenario,
      currentMonthlyRevenue,
      displayImpressions,
      videoImpressions
    );

    // Calculate CAPI Capabilities (if enabled)
    const capiCapabilities =
      scenario.scope === 'id-capi' || scenario.scope === 'id-capi-performance'
        ? this.calculateCapiCapabilities(inputs, scenario, currentMonthlyRevenue)
        : undefined;

    // Calculate Media Performance (if enabled)
    const mediaPerformance =
      scenario.scope === 'id-capi-performance'
        ? this.calculateMediaPerformance(inputs, scenario, currentMonthlyRevenue)
        : undefined;

    // Calculate totals
    const totalMonthlyUplift =
      idInfrastructure.monthlyUplift +
      (capiCapabilities?.monthlyUplift || 0) +
      (mediaPerformance?.monthlyUplift || 0);

    const totalAnnualUplift = totalMonthlyUplift * 12;
    const threeYearProjection = totalAnnualUplift * 3;
    const percentageImprovement = (totalMonthlyUplift / currentMonthlyRevenue) * 100;

    // Calculate breakdown percentages
    const breakdown = {
      idInfrastructurePercent: (idInfrastructure.monthlyUplift / totalMonthlyUplift) * 100,
      capiPercent: ((capiCapabilities?.monthlyUplift || 0) / totalMonthlyUplift) * 100,
      performancePercent: ((mediaPerformance?.monthlyUplift || 0) / totalMonthlyUplift) * 100,
    };

    return {
      scenario,
      inputs,
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
    inputs: SimplifiedInputs,
    scenario: ScenarioState,
    currentMonthlyRevenue: number,
    displayImpressions: number,
    videoImpressions: number
  ) {
    const { displayCPM, videoCPM } = inputs;

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
    inputs: SimplifiedInputs,
    scenario: ScenarioState,
    currentMonthlyRevenue: number
  ) {
    const { monthlyPageviews, displayCPM, videoCPM, displayVideoSplit } = inputs;

    // Calculate base metrics
    const displayShare = displayVideoSplit / 100;
    const videoShare = 1 - displayShare;
    const totalImpressions = monthlyPageviews * 2.5;
    const displayImpressions = totalImpressions * displayShare;
    const videoImpressions = totalImpressions * videoShare;

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

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      let rampUpFactor = 1;

      if (month <= 3) {
        rampUpFactor = SCENARIO_MULTIPLIERS.RAMP_UP.MONTH_1_3;
      } else if (month <= 6) {
        rampUpFactor = SCENARIO_MULTIPLIERS.RAMP_UP.MONTH_4_6;
      } else {
        rampUpFactor = SCENARIO_MULTIPLIERS.RAMP_UP.MONTH_7_12;
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
