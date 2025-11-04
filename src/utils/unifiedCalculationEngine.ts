import type { SimplifiedInputs, UnifiedResults, ScenarioState, MonthlyProjection } from '@/types/scenarios';
import {
  CAPI_BENCHMARKS,
  MEDIA_PERFORMANCE_BENCHMARKS,
  ADDRESSABILITY_BENCHMARKS,
  OPERATIONAL_BENCHMARKS,
  SCENARIO_MULTIPLIERS,
  CAMPAIGN_VALUES,
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

    // Addressability calculations
    const safariShare = ADDRESSABILITY_BENCHMARKS.SAFARI_IOS_SHARE;
    const currentSafariAddressability = ADDRESSABILITY_BENCHMARKS.CURRENT_SAFARI_ADDRESSABILITY;
    const improvedSafariAddressability = ADDRESSABILITY_BENCHMARKS.IMPROVED_SAFARI_ADDRESSABILITY;

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

    // CDP cost savings from ID reduction
    const currentUsers = inputs.monthlyPageviews * 0.8; // 80% unique users
    const currentMonthlyIds = currentUsers * OPERATIONAL_BENCHMARKS.BASELINE_ID_MULTIPLIER;
    const optimizedMonthlyIds = currentUsers * OPERATIONAL_BENCHMARKS.IMPROVED_ID_MULTIPLIER;
    const idsReduced = currentMonthlyIds - optimizedMonthlyIds;
    const monthlyCdpSavings = idsReduced * OPERATIONAL_BENCHMARKS.COST_PER_ID;

    // Apply scenario multipliers
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);
    const addressabilityMultiplier = this.getAddressabilityMultiplier(scenario.addressability);

    const monthlyUplift = (cpmImprovement + monthlyCdpSavings) * deploymentMultiplier * addressabilityMultiplier;
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
    const { monthlyPageviews } = inputs;

    // Match rate improvement
    const baselineMatchRate = CAPI_BENCHMARKS.BASELINE_MATCH_RATE;
    const improvedMatchRate = CAPI_BENCHMARKS.IMPROVED_MATCH_RATE;
    const matchRateImprovement = (improvedMatchRate / baselineMatchRate - 1) * 100;

    // Campaign service revenue from CAPI adoption
    const potentialCampaigns = monthlyPageviews * CAMPAIGN_VALUES.CAMPAIGN_CONVERSION_RATE;
    const capiAdoptedCampaigns = potentialCampaigns * CAMPAIGN_VALUES.CAPI_ADOPTION_RATE;
    const avgCampaignSpend = CAMPAIGN_VALUES.AVG_CAMPAIGN_SPEND;
    const campaignServiceFees = capiAdoptedCampaigns * avgCampaignSpend * CAPI_BENCHMARKS.SERVICE_FEE_PERCENTAGE;

    // Conversion tracking revenue improvement
    const conversionImprovement = CAPI_BENCHMARKS.CONVERSION_MULTIPLIER - 1;
    const conversionTrackingRevenue = currentMonthlyRevenue * conversionImprovement * 0.2; // 20% of revenue is performance-based

    // Apply scenario multipliers
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);
    const addressabilityMultiplier = this.getAddressabilityMultiplier(scenario.addressability);

    const monthlyUplift = (campaignServiceFees + conversionTrackingRevenue) * deploymentMultiplier * addressabilityMultiplier;
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
    // Advertiser ROAS improvement
    const baselineROAS = MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_ROAS;
    const improvedROAS = MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_ROAS;
    const roasImprovement = ((improvedROAS - baselineROAS) / baselineROAS) * 100;

    // Publisher captures value through premium pricing
    const estimatedAdvertiserSpend = currentMonthlyRevenue * 2; // Rough proxy
    const advertiserValueIncrease = estimatedAdvertiserSpend * (improvedROAS - baselineROAS);
    const premiumPricingPower = advertiserValueIncrease * MEDIA_PERFORMANCE_BENCHMARKS.PUBLISHER_VALUE_CAPTURE;

    // Make-good reduction savings
    const baselineMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.BASELINE_MAKEGOOD_RATE;
    const improvedMakeGoods = currentMonthlyRevenue * MEDIA_PERFORMANCE_BENCHMARKS.IMPROVED_MAKEGOOD_RATE;
    const makeGoodSavings = baselineMakeGoods - improvedMakeGoods;

    // Apply scenario multipliers
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);
    const addressabilityMultiplier = this.getAddressabilityMultiplier(scenario.addressability);

    const monthlyUplift = (premiumPricingPower + makeGoodSavings) * deploymentMultiplier * addressabilityMultiplier;
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

  private static getAddressabilityMultiplier(addressability: string): number {
    switch (addressability) {
      case 'limited':
        return SCENARIO_MULTIPLIERS.ADDRESSABILITY.LIMITED;
      case 'partial':
        return SCENARIO_MULTIPLIERS.ADDRESSABILITY.PARTIAL;
      case 'full':
        return SCENARIO_MULTIPLIERS.ADDRESSABILITY.FULL;
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
