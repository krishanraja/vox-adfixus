import type { SimplifiedInputs, UnifiedResults, ScenarioState, MonthlyProjection, AssumptionOverrides, PricingModel, ROIAnalysis, CapiConfiguration } from '@/types/scenarios';
import {
  CAPI_BENCHMARKS,
  MEDIA_PERFORMANCE_BENCHMARKS,
  ADDRESSABILITY_BENCHMARKS,
  OPERATIONAL_BENCHMARKS,
  SCENARIO_MULTIPLIERS,
  CAPI_CAMPAIGN_VALUES,
  CAPI_BASE_PARAMETERS,
} from '@/constants/industryBenchmarks';
import { aggregateDomainInputs } from '@/utils/domainAggregation';
import { RISK_SCENARIOS, type RiskScenario } from '@/constants/riskScenarios';
import { CONTRACT_PRICING } from '@/constants/voxMediaDomains';

export class UnifiedCalculationEngine {
  static calculate(
    inputs: SimplifiedInputs, 
    scenario: ScenarioState,
    riskScenario: RiskScenario = 'moderate',
    overrides?: AssumptionOverrides
  ): UnifiedResults {
    // Aggregate domain inputs with user-provided CPMs and pageview/safari overrides
    const aggregated = aggregateDomainInputs(
      inputs.selectedDomains, 
      inputs.displayCPM, 
      inputs.videoCPM,
      inputs.domainPageviewOverrides,
      inputs.safariShareOverrides
    );
    const { 
      totalMonthlyPageviews, 
      totalMonthlyImpressions,
      displayCPM, 
      videoCPM, 
      weightedDisplayVideoSplit,
      weightedSafariShare,
      weightedAdsPerPage 
    } = aggregated;
    
    // Get risk multipliers
    const risk = { ...RISK_SCENARIOS[riskScenario] };
    
    // Apply readiness adjustments if provided
    // NOTE: Readiness factors now affect ALL benefit categories (ID Infra, CAPI, Media Performance)
    // They also affect CAPI configuration separately in calculateCapiConfiguration()
    // This is intentional: readiness affects BOTH deployment risk AND campaign volume
    if (overrides?.readinessFactors) {
      const rf = overrides.readinessFactors;
      
      // ========== SALES READINESS (Core Business Driver) ==========
      // Impacts: CPM realization (must sell premium), premium inventory positioning, sales execution
      if (rf.salesReadiness !== undefined) {
        // CPM uplift requires sales to articulate value to buyers
        // Range: 0.5 → 0.7x, 0.9 → 1.1x (significant impact)
        const salesCpmFactor = 0.4 + (rf.salesReadiness * 0.8);
        risk.cpmUpliftRealization *= salesCpmFactor;
        
        // Premium inventory positioning requires trained sales team
        risk.premiumInventoryShare *= salesCpmFactor;
        
        // Direct impact on sales effectiveness
        risk.salesEffectiveness *= rf.salesReadiness;
      }
      
      // ========== TRAINING GAPS (Operational Efficiency) ==========
      // Impacts: Adoption rate (untrained = slower rollout), addressability efficiency
      if (rf.trainingGaps !== undefined) {
        // Training directly affects how quickly teams can adopt new workflows
        // Range: 0.5 → 0.75x, 0.9 → 1.05x
        const trainingAdoptionFactor = 0.5 + (rf.trainingGaps * 0.6);
        risk.adoptionRate *= trainingAdoptionFactor;
        
        // Operational efficiency depends on training
        risk.addressabilityEfficiency *= trainingAdoptionFactor;
      }
      
      // ========== ADVERTISER BUY-IN (External Factor) ==========
      // Impacts: CPM realization (advertisers set prices!), CAPI deployment (they must enable CAPI)
      if (rf.advertiserBuyIn !== undefined) {
        // Advertisers directly control premium pricing acceptance
        // Range: 0.5 → 0.75x, 0.9 → 1.1x
        const buyInCpmFactor = 0.5 + (rf.advertiserBuyIn * 0.7);
        risk.cpmUpliftRealization *= buyInCpmFactor;
        
        // CAPI requires advertiser participation
        risk.capiDeploymentRate *= rf.advertiserBuyIn;
      }
      
      // ========== ORGANIZATIONAL OWNERSHIP ==========
      // Apply organizational ownership to adoption rate
      if (rf.organizationalOwnership !== undefined) {
        risk.adoptionRate *= rf.organizationalOwnership;
      }
      
      // ========== TECHNICAL FACTORS ==========
      if (rf.technicalDeploymentMonths !== undefined) {
        risk.rampUpMonths = rf.technicalDeploymentMonths;
      }
      if (rf.integrationDelays !== undefined) {
        // Integration delays affect technical deployment speed
        risk.addressabilityEfficiency *= rf.integrationDelays;
      }
      if (rf.resourceAvailability !== undefined) {
        // Resource availability affects adoption rate and ramp-up
        risk.adoptionRate *= rf.resourceAvailability;
        // Adjust ramp-up based on resource availability (less resources = longer ramp-up)
        if (rf.resourceAvailability < 0.75) {
          risk.rampUpMonths = Math.min(18, risk.rampUpMonths * (1 + (0.75 - rf.resourceAvailability)));
        }
      }
      
      // ========== MARKET CONDITIONS (External Macro Factor) ==========
      // Apply market conditions as overall dampener to financial metrics
      if (rf.marketConditions !== undefined) {
        const marketMultiplier = rf.marketConditions;
        risk.addressabilityEfficiency *= marketMultiplier;
        risk.cpmUpliftRealization *= marketMultiplier;
        risk.cdpSavingsRealization *= marketMultiplier;
      }
    }

    // Calculate base metrics using domain-specific adsPerPage
    const displayShare = weightedDisplayVideoSplit / 100;
    const videoShare = 1 - displayShare;
    const totalImpressions = totalMonthlyImpressions; // Use domain-weighted impressions
    const displayImpressions = totalImpressions * displayShare;
    const videoImpressions = totalImpressions * videoShare;

    // Current revenue
    const currentDisplayRevenue = (displayImpressions / 1000) * displayCPM;
    const currentVideoRevenue = (videoImpressions / 1000) * videoCPM;
    const currentMonthlyRevenue = currentDisplayRevenue + currentVideoRevenue;

    // Calculate ID Infrastructure (always included) - BASE before risk adjustment
    const baseIdInfrastructure = this.calculateIdInfrastructure(
      totalMonthlyPageviews,
      displayCPM,
      videoCPM,
      scenario,
      currentMonthlyRevenue,
      displayImpressions,
      videoImpressions,
      weightedSafariShare, // Pass domain-weighted Safari share
      overrides
    );

    // Apply risk adjustments to ID infrastructure (before adoption rate)
    const riskAdjustedIdInfrastructure = {
      ...baseIdInfrastructure,
      monthlyUplift: baseIdInfrastructure.monthlyUplift * risk.addressabilityEfficiency * risk.cdpSavingsRealization,
      annualUplift: baseIdInfrastructure.annualUplift * risk.addressabilityEfficiency * risk.cdpSavingsRealization,
      details: {
        ...baseIdInfrastructure.details,
        addressabilityRevenue: baseIdInfrastructure.details.addressabilityRevenue * risk.addressabilityEfficiency * risk.cpmUpliftRealization,
        cdpSavingsRevenue: baseIdInfrastructure.details.cdpSavingsRevenue * risk.cdpSavingsRealization,
      }
    };

    // Apply adoption rate to ID Infrastructure component
    const adoptedIdInfrastructure = {
      ...riskAdjustedIdInfrastructure,
      monthlyUplift: riskAdjustedIdInfrastructure.monthlyUplift * risk.adoptionRate,
      annualUplift: riskAdjustedIdInfrastructure.annualUplift * risk.adoptionRate,
    };

    // Calculate CAPI Capabilities (if enabled) - BASE before risk adjustment
    let adoptedCapiCapabilities;
    if (scenario.scope === 'id-capi' || scenario.scope === 'id-capi-performance') {
      const baseCapiCapabilities = this.calculateCapiCapabilities(inputs, scenario, currentMonthlyRevenue, riskScenario, overrides);
      
      // Apply risk adjustments to CAPI (before adoption rate)
      const riskAdjustedCapiCapabilities = {
        ...baseCapiCapabilities,
        monthlyUplift: baseCapiCapabilities.monthlyUplift * risk.capiDeploymentRate * risk.salesEffectiveness,
        annualUplift: baseCapiCapabilities.annualUplift * risk.capiDeploymentRate * risk.salesEffectiveness,
        conversionTrackingRevenue: baseCapiCapabilities.conversionTrackingRevenue * risk.capiDeploymentRate,
        campaignServiceFees: baseCapiCapabilities.campaignServiceFees * risk.salesEffectiveness,
      };

      // Apply adoption rate to CAPI component
      adoptedCapiCapabilities = {
        ...riskAdjustedCapiCapabilities,
        monthlyUplift: riskAdjustedCapiCapabilities.monthlyUplift * risk.adoptionRate,
        annualUplift: riskAdjustedCapiCapabilities.annualUplift * risk.adoptionRate,
      };
    }

    // Calculate Media Performance (if enabled) - BASE before risk adjustment
    let adoptedMediaPerformance;
    if (scenario.scope === 'id-capi-performance') {
      const baseMediaPerformance = this.calculateMediaPerformance(
        totalMonthlyPageviews,
        displayCPM,
        videoCPM,
        weightedDisplayVideoSplit,
        scenario,
        currentMonthlyRevenue,
        displayImpressions,
        videoImpressions,
        overrides
      );
      
      // Apply risk adjustments to media performance (before adoption rate)
      const riskAdjustedMediaPerformance = {
        ...baseMediaPerformance,
        monthlyUplift: baseMediaPerformance.monthlyUplift * (risk.premiumInventoryShare / 0.30) * risk.cpmUpliftRealization,
        annualUplift: baseMediaPerformance.annualUplift * (risk.premiumInventoryShare / 0.30) * risk.cpmUpliftRealization,
        premiumPricingPower: baseMediaPerformance.premiumPricingPower * (risk.premiumInventoryShare / 0.30),
      };

      // Apply adoption rate to Media Performance component
      adoptedMediaPerformance = {
        ...riskAdjustedMediaPerformance,
        monthlyUplift: riskAdjustedMediaPerformance.monthlyUplift * risk.adoptionRate,
        annualUplift: riskAdjustedMediaPerformance.annualUplift * risk.adoptionRate,
      };
    }

    // Calculate totals as sum of adopted components (mathematically consistent)
    const totalMonthlyUplift =
      adoptedIdInfrastructure.monthlyUplift +
      (adoptedCapiCapabilities?.monthlyUplift || 0) +
      (adoptedMediaPerformance?.monthlyUplift || 0);
    const totalAnnualUplift = totalMonthlyUplift * 12;
    const threeYearProjection = totalAnnualUplift * 3;
    const percentageImprovement = (totalMonthlyUplift / currentMonthlyRevenue) * 100;

    // Calculate unadjusted values for comparison (what it would be with optimistic)
    const optimisticRisk = RISK_SCENARIOS.optimistic;
    const hasCapi = scenario.scope === 'id-capi' || scenario.scope === 'id-capi-performance';
    const hasMediaPerformance = scenario.scope === 'id-capi-performance';
    const unadjustedMonthlyUplift = (
      baseIdInfrastructure.monthlyUplift +
      (hasCapi ? this.calculateCapiCapabilities(inputs, scenario, currentMonthlyRevenue, 'optimistic').monthlyUplift : 0) +
      (hasMediaPerformance ? this.calculateMediaPerformance(
        totalMonthlyPageviews,
        displayCPM,
        videoCPM,
        weightedDisplayVideoSplit,
        scenario,
        currentMonthlyRevenue,
        displayImpressions,
        videoImpressions,
        undefined // No overrides for comparison calculation
      ).monthlyUplift : 0)
    ) * optimisticRisk.adoptionRate;
    
    const adjustmentPercentage = ((unadjustedMonthlyUplift - totalMonthlyUplift) / unadjustedMonthlyUplift) * 100;

    // Calculate breakdown percentages using adopted values (after adoption rate) with division-by-zero protection
    const breakdown = {
      idInfrastructurePercent: totalMonthlyUplift > 0 ? (adoptedIdInfrastructure.monthlyUplift / totalMonthlyUplift) * 100 : 0,
      capiPercent: totalMonthlyUplift > 0 ? ((adoptedCapiCapabilities?.monthlyUplift || 0) / totalMonthlyUplift) * 100 : 0,
      performancePercent: totalMonthlyUplift > 0 ? ((adoptedMediaPerformance?.monthlyUplift || 0) / totalMonthlyUplift) * 100 : 0,
    };

    // Calculate ROI Analysis with contract pricing
    const pricing = this.calculatePricing(inputs, riskScenario, overrides);
    const roiAnalysis = this.calculateROI(totalMonthlyUplift, pricing);

    return {
      scenario,
      inputs,
      assumptionOverrides: overrides,
      riskScenario,
      riskAdjustmentSummary: {
        unadjustedMonthlyUplift,
        adjustedMonthlyUplift: totalMonthlyUplift,
        adjustmentPercentage,
      },
      pricing,
      roiAnalysis,
      idInfrastructure: adoptedIdInfrastructure,
      capiCapabilities: adoptedCapiCapabilities,
      mediaPerformance: adoptedMediaPerformance,
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
    videoImpressions: number,
    weightedSafariShare: number, // Domain-weighted Safari share
    overrides?: AssumptionOverrides
  ) {
    // ============ FIXED SAFARI SHARE (35% per Vox guidance) ============
    // Use fixed 35% Safari share for all addressability calculations
    // Domain-weighted share is only for display in domain tables
    const safariShare = ADDRESSABILITY_BENCHMARKS.SAFARI_SHARE; // FIXED 35%
    
    // ============ FIXED BASELINE ADDRESSABILITY (65% per Vox guidance) ============
    const currentTotalAddressability = ADDRESSABILITY_BENCHMARKS.BASELINE_TOTAL_ADDRESSABILITY; // FIXED 65%
    
    // Safari-specific addressability (POC KPI)
    // Current: 0% - Safari users unaddressable due to ITP
    // Target: +20% improvement on Safari inventory
    const currentSafariAddressability = ADDRESSABILITY_BENCHMARKS.CURRENT_SAFARI_ADDRESSABILITY; // 0%
    const targetSafariAddressability = ADDRESSABILITY_BENCHMARKS.TARGET_SAFARI_ADDRESSABILITY; // 20%
    const safariAddressabilityImprovement = targetSafariAddressability - currentSafariAddressability; // +20%
    
    // ============ PROJECTED ADDRESSABILITY ============
    // 65% baseline + (35% Safari × 20% improvement) = 65% + 7% = 72%
    const addressabilityGain = safariShare * safariAddressabilityImprovement;
    const improvedTotalAddressability = currentTotalAddressability + addressabilityGain; // 72%

    // ============ NEWLY ADDRESSABLE SAFARI IMPRESSIONS ============
    const totalImpressions = displayImpressions + videoImpressions;
    const safariImpressions = totalImpressions * safariShare;
    // POC Target: +20% of Safari impressions become addressable
    const newlyAddressableSafariImpressions = safariImpressions * safariAddressabilityImprovement;
    const newlyAddressableDisplay = displayImpressions * safariShare * safariAddressabilityImprovement;
    const newlyAddressableVideo = videoImpressions * safariShare * safariAddressabilityImprovement;

    // CPM improvement on newly addressable Safari inventory
    const cpmUpliftFactor = overrides?.cpmUpliftFactor ?? ADDRESSABILITY_BENCHMARKS.CPM_IMPROVEMENT_FACTOR;
    const improvedDisplayCPM = displayCPM * (1 + cpmUpliftFactor);
    const improvedVideoCPM = videoCPM * (1 + cpmUpliftFactor);

    const displayUplift = (newlyAddressableDisplay / 1000) * improvedDisplayCPM;
    const videoUplift = (newlyAddressableVideo / 1000) * improvedVideoCPM;
    const cpmImprovement = displayUplift + videoUplift;

    // CDP cost savings: FIXED at $3,500/month per Vox guidance
    const monthlyCdpSavings = OPERATIONAL_BENCHMARKS.CDP_MONTHLY_SAVINGS; // FIXED $3,500

    // Apply deployment multiplier
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);

    const addressabilityRevenue = cpmImprovement * deploymentMultiplier;
    const cdpSavingsRevenue = monthlyCdpSavings * deploymentMultiplier;
    const monthlyUplift = addressabilityRevenue + cdpSavingsRevenue;
    const annualUplift = monthlyUplift * 12;

    return {
      addressabilityRecovery: addressabilityGain * 100, // +7 percentage points
      cpmImprovement,
      cdpSavings: monthlyCdpSavings,
      monthlyUplift,
      annualUplift,
      details: {
        // Fixed values for consistency
        safariShare: safariShare * 100, // FIXED 35%
        currentSafariAddressability: currentSafariAddressability * 100, // 0%
        targetSafariAddressability: targetSafariAddressability * 100, // 20%
        safariAddressabilityImprovement: safariAddressabilityImprovement * 100, // +20%
        
        // Total inventory metrics
        currentAddressability: currentTotalAddressability * 100, // FIXED 65%
        improvedAddressability: improvedTotalAddressability * 100, // 72%
        totalAddressabilityImprovement: addressabilityGain * 100, // +7%
        
        newlyAddressableImpressions: newlyAddressableSafariImpressions,
        addressabilityRevenue,
        cdpSavingsRevenue,
        idReductionPercentage: OPERATIONAL_BENCHMARKS.ID_REDUCTION_PERCENTAGE * 100,
        monthlyCdpSavings,
      },
    };
  }

  /**
   * Calculate CAPI configuration based on Business Readiness factors
   * CAPI campaigns are now OUTPUTS, not manual inputs
   * KEY FIX: Now uses scenario-specific readiness defaults to link ROI to scenario
   */
  private static calculateCapiConfiguration(
    riskScenario: RiskScenario = 'moderate',
    overrides?: AssumptionOverrides
  ): CapiConfiguration {
    const base = CAPI_BASE_PARAMETERS;
    
    // Check for manual overrides FIRST - if provided, use them directly
    if (overrides?.capiYearlyCampaigns !== undefined || overrides?.capiAvgCampaignSpend !== undefined) {
      const yearlyCampaigns = overrides.capiYearlyCampaigns ?? base.BASE_YEARLY_CAMPAIGNS;
      const avgCampaignSpend = overrides.capiAvgCampaignSpend ?? base.BASE_AVG_CAMPAIGN_SPEND;
      
      // POC campaigns (first 3 months) - use ramp weights
      const pocWeight = base.MONTHLY_RAMP_WEIGHTS.slice(0, 3).reduce((a, b) => a + b, 0);
      const pocCampaigns = Math.max(1, Math.round(yearlyCampaigns * pocWeight));
      
      // Monthly distribution based on ramp weights
      const monthlyDistribution = base.MONTHLY_RAMP_WEIGHTS.map(weight => 
        Math.round(yearlyCampaigns * weight * 10) / 10 // Allow decimals for display
      );
      
      return {
        yearlyCampaigns,
        avgCampaignSpend,
        pocCampaigns,
        fullYearCampaigns: yearlyCampaigns,
        monthlyDistribution,
      };
    }
    
    // Fall back to auto-calculation if no manual overrides
    // Get scenario-specific readiness defaults (THIS IS THE KEY FIX)
    const scenarioDefaults = RISK_SCENARIOS[riskScenario].defaultReadiness;
    
    // Use overrides if provided, otherwise use scenario-specific defaults
    const salesReadiness = overrides?.readinessFactors?.salesReadiness ?? scenarioDefaults.salesReadiness;
    const trainingGaps = overrides?.readinessFactors?.trainingGaps ?? scenarioDefaults.trainingGaps;
    const advertiserBuyIn = overrides?.readinessFactors?.advertiserBuyIn ?? scenarioDefaults.advertiserBuyIn;
    const marketConditions = overrides?.readinessFactors?.marketConditions ?? scenarioDefaults.marketConditions;
    
    // LINEAR INTERPOLATION for controlled variance (replaces step functions)
    // At 0.5 readiness = low multiplier, at 0.9 = high multiplier
    // This creates ~3.7x difference instead of 8x from step functions
    
    // Sales multiplier: 0.5→0.7, 0.9→1.3 (linear)
    const salesMultiplier = Math.max(0.5, Math.min(1.5, 0.7 + (salesReadiness - 0.5) * 1.5));
    
    // Training multiplier: 0.5→0.8, 0.9→1.2 (linear)
    const trainingMultiplier = Math.max(0.6, Math.min(1.3, 0.8 + (trainingGaps - 0.5) * 1.0));
    
    // Buy-in multiplier: 0.5→0.7, 0.9→1.18 (linear)
    const buyInMultiplier = Math.max(0.5, Math.min(1.3, 0.7 + (advertiserBuyIn - 0.5) * 1.2));
    
    // Apply MIN/MAX bounds to compress CAPI variance
    const volumeMultiplier = Math.max(
      base.MIN_VOLUME_MULTIPLIER, // Floor at 0.7x
      Math.min(
        base.MAX_VOLUME_MULTIPLIER, // Cap at 1.4x
        salesMultiplier * trainingMultiplier * buyInMultiplier
      )
    );
    
    // Market conditions multiplier: 0.5→0.7, 0.9→1.1 (linear, tighter range)
    const spendMultiplier = Math.min(
      base.MAX_SPEND_MULTIPLIER,
      Math.max(0.6, Math.min(1.2, 0.7 + (marketConditions - 0.5) * 1.0))
    );
    
    // Calculate yearly campaigns and average spend
    const yearlyCampaigns = Math.max(2, Math.round(base.BASE_YEARLY_CAMPAIGNS * volumeMultiplier));
    const avgCampaignSpend = Math.round(base.BASE_AVG_CAMPAIGN_SPEND * spendMultiplier);
    
    // POC campaigns (first 3 months) - use ramp weights
    const pocWeight = base.MONTHLY_RAMP_WEIGHTS.slice(0, 3).reduce((a, b) => a + b, 0);
    const pocCampaigns = Math.max(1, Math.round(yearlyCampaigns * pocWeight));
    
    // Monthly distribution based on ramp weights
    const monthlyDistribution = base.MONTHLY_RAMP_WEIGHTS.map(weight => 
      Math.round(yearlyCampaigns * weight * 10) / 10 // Allow decimals for display
    );
    
    return {
      yearlyCampaigns,
      avgCampaignSpend,
      pocCampaigns,
      fullYearCampaigns: yearlyCampaigns,
      monthlyDistribution,
    };
  }

  private static calculateCapiCapabilities(
    inputs: SimplifiedInputs,
    scenario: ScenarioState,
    currentMonthlyRevenue: number,
    riskScenario: RiskScenario = 'moderate',
    overrides?: AssumptionOverrides
  ) {
    // Calculate CAPI configuration from Business Readiness factors + risk scenario
    const capiConfig = this.calculateCapiConfiguration(riskScenario, overrides);
    
    // Match rate improvement
    const baselineMatchRate = CAPI_BENCHMARKS.BASELINE_MATCH_RATE;
    const improvedMatchRate = overrides?.capiMatchRate ?? CAPI_BENCHMARKS.IMPROVED_MATCH_RATE;
    const matchRateImprovement = (improvedMatchRate / baselineMatchRate - 1) * 100;

    // Campaign-based service fees using calculated CAPI configuration
    // Convert yearly campaigns to monthly average for calculations
    const avgMonthlyCapiCampaigns = capiConfig.yearlyCampaigns / 12;
    const avgCampaignSpend = capiConfig.avgCampaignSpend;
    const capiLineItemShare = overrides?.capiLineItemShare ?? inputs.capiLineItemShare;
    const serviceFee = overrides?.capiServiceFee ?? CONTRACT_PRICING.CAPI_SERVICE_FEE_RATE;

    // Total baseline CAPI campaign spend (monthly average)
    const baselineCapiSpend = avgMonthlyCapiCampaigns * avgCampaignSpend;
    
    // CAPI-eligible spend (only line items running CAPI tracking)
    const capiEligibleSpend = baselineCapiSpend * capiLineItemShare;

    // Operational labor savings from CAPI
    const capiLaborSavings = OPERATIONAL_BENCHMARKS.MANUAL_LABOR_HOURS_SAVED * OPERATIONAL_BENCHMARKS.HOURLY_RATE;

    // With better conversion tracking, advertisers increase spend by 40% on CAPI-enabled line items
    const conversionImprovement = CAPI_CAMPAIGN_VALUES.CONVERSION_RATE_MULTIPLIER - 1;
    const improvedCapiEligibleSpend = capiEligibleSpend * (1 + conversionImprovement);

    // Additional revenue from improved conversion tracking
    const conversionTrackingRevenue = capiEligibleSpend * conversionImprovement;

    // Service fee applies ONLY to CAPI-enabled line items (with improvement)
    const campaignServiceFees = improvedCapiEligibleSpend * serviceFee;

    // Apply deployment multiplier
    const deploymentMultiplier = this.getDeploymentMultiplier(scenario.deployment);

    // NET Publisher benefit from CAPI
    const monthlyUplift = (conversionTrackingRevenue + capiLaborSavings - campaignServiceFees) * deploymentMultiplier;
    const annualUplift = monthlyUplift * 12;

    // 80% of CAPI campaigns are NET NEW (wouldn't exist without CAPI capability)
    const NET_NEW_CAMPAIGN_RATE = 0.80;
    const netNewCampaignRevenue = baselineCapiSpend * NET_NEW_CAMPAIGN_RATE;

    return {
      matchRateImprovement,
      baselineCapiSpend,
      capiEligibleSpend,
      totalCapiSpendWithImprovement: baselineCapiSpend + conversionTrackingRevenue,
      conversionTrackingRevenue,
      campaignServiceFees,
      capiLaborSavings,
      monthlyUplift,
      annualUplift,
      details: {
        baselineMatchRate: baselineMatchRate * 100,
        improvedMatchRate: improvedMatchRate * 100,
        conversionImprovement: conversionImprovement * 100,
        ctrImprovement: (CAPI_BENCHMARKS.CTR_MULTIPLIER - 1) * 100,
      },
      capiConfiguration: capiConfig,
      netNewCampaignRevenue,
      netNewCampaignRate: NET_NEW_CAMPAIGN_RATE,
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
    videoImpressions: number,
    overrides?: AssumptionOverrides
  ) {
    // Premium CPM uplift on premium inventory subset (Benefit #3: Higher CPMs)
    // Only applies to inventory sold as premium/performance campaigns
    const premiumInventoryShare = overrides?.premiumInventoryShare ?? MEDIA_PERFORMANCE_BENCHMARKS.PREMIUM_INVENTORY_SHARE;
    const yieldUplift = overrides?.premiumYieldUplift ?? MEDIA_PERFORMANCE_BENCHMARKS.YIELD_UPLIFT_PERCENTAGE;

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

  private static calculatePricing(
    inputs: SimplifiedInputs, 
    riskScenario: RiskScenario = 'moderate',
    overrides?: AssumptionOverrides
  ): PricingModel {
    // Calculate CAPI configuration to get spend values (now scenario-aware)
    const capiConfig = this.calculateCapiConfiguration(riskScenario, overrides);
    
    // Use contract pricing from voxMediaDomains.ts
    const pocFlatFee = CONTRACT_PRICING.POC_FLAT_FEE;
    const pocDurationMonths = CONTRACT_PRICING.POC_DURATION_MONTHS;
    const fullContractMonthly = CONTRACT_PRICING.FULL_CONTRACT_MONTHLY;
    const capiServiceFeeRate = CONTRACT_PRICING.CAPI_SERVICE_FEE_RATE;
    
    // Use calculated CAPI values (yearly → monthly average)
    const avgMonthlyCapiCampaigns = capiConfig.yearlyCampaigns / 12;
    const totalMonthlyCapiSpend = avgMonthlyCapiCampaigns * capiConfig.avgCampaignSpend;
    const monthlyCapiServiceFees = totalMonthlyCapiSpend * capiServiceFeeRate;
    
    return {
      pocFlatFee,
      pocDurationMonths,
      pocMonthlyEquivalent: pocFlatFee / pocDurationMonths,
      fullContractMonthly,
      capiServiceFeeRate,
      totalMonthlyCapiSpend,
      monthlyCapiServiceFees,
    };
  }

  private static calculateROI(
    totalMonthlyBenefits: number,
    pricing: PricingModel
  ): ROIAnalysis {
    // Service fees are already subtracted from CAPI benefits in calculateCapiCapabilities()
    // Publisher costs = platform fees ONLY
    const platformFeePOC = pricing.pocMonthlyEquivalent; // $5K/month (50% off!)
    const pocPhaseTotalMonthlyCost = platformFeePOC;
    
    const platformFeeFull = pricing.fullContractMonthly; // $19,928/month (reduced from $26K!)
    const fullContractTotalMonthlyCost = platformFeeFull;
    
    // POC Phase Net ROI
    const pocPhaseNetMonthlyROI = totalMonthlyBenefits - pocPhaseTotalMonthlyCost;
    const pocPhaseNetAnnualROI = pocPhaseNetMonthlyROI * 12;
    const pocPhaseROIMultiple = pocPhaseTotalMonthlyCost > 0 
      ? totalMonthlyBenefits / pocPhaseTotalMonthlyCost
      : 0;
    
    // Full Contract Phase Net ROI
    const fullContractNetMonthlyROI = totalMonthlyBenefits - fullContractTotalMonthlyCost;
    const fullContractNetAnnualROI = fullContractNetMonthlyROI * 12;
    const fullContractROIMultiple = fullContractTotalMonthlyCost > 0
      ? totalMonthlyBenefits / fullContractTotalMonthlyCost
      : 0;
    
    // Payback period (months to recover costs from benefits)
    const pocPaybackMonths = totalMonthlyBenefits > 0 
      ? pricing.pocFlatFee / totalMonthlyBenefits 
      : 999;
    const fullContractPaybackMonths = totalMonthlyBenefits > 0 
      ? platformFeeFull / totalMonthlyBenefits 
      : 999;
    
    return {
      totalMonthlyBenefits,
      totalAnnualBenefits: totalMonthlyBenefits * 12,
      costs: {
        pocPhaseMonthly: pocPhaseTotalMonthlyCost,
        fullContractMonthly: fullContractTotalMonthlyCost,
        platformFeePOC,
        platformFeeFull,
        capiServiceFees: 0, // Service fees already deducted from CAPI benefits
      },
      netMonthlyROI: {
        pocPhase: pocPhaseNetMonthlyROI,
        fullContract: fullContractNetMonthlyROI,
      },
      netAnnualROI: {
        pocPhase: pocPhaseNetAnnualROI,
        fullContract: fullContractNetAnnualROI,
      },
      roiMultiple: {
        pocPhase: pocPhaseROIMultiple,
        fullContract: fullContractROIMultiple,
      },
      paybackMonths: {
        pocPhase: pocPaybackMonths,
        fullContract: fullContractPaybackMonths,
      },
    };
  }

  static generateMonthlyProjection(results: UnifiedResults): MonthlyProjection[] {
    const { currentMonthlyRevenue, totalMonthlyUplift } = results.totals;
    
    // Get ramp-up months from risk scenario
    const rampUpMonths = results.riskScenario ? RISK_SCENARIOS[results.riskScenario].rampUpMonths : 12;
    
    // Get pricing info for ROI calculation
    const { costs } = results.roiAnalysis;

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
      
      // Calculate ROI for this month
      const monthlyCost = month <= 3 
        ? costs.pocPhaseMonthly  // POC pricing months 1-3
        : costs.fullContractMonthly; // Full contract month 4+
      
      const netROI = monthlyUplift - monthlyCost;
      const roiMultiple = monthlyCost > 0 ? monthlyUplift / monthlyCost : 0;

      return {
        month,
        monthLabel: `Month ${month}`,
        currentRevenue: currentMonthlyRevenue,
        projectedRevenue,
        uplift: monthlyUplift,
        rampUpFactor,
        netROI,
        roiMultiple,
      };
    });
  }
}
