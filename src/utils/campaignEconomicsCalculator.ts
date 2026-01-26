// Campaign-Level CAPI Economics Calculator
// Shows the magic of the $30K campaign cap for large campaigns

import type { 
  CampaignEconomics, 
  CampaignTier, 
  CampaignPortfolioAnalysis 
} from '@/types/campaignEconomics';
import { CAPI_ECONOMICS_CONSTANTS } from '@/types/campaignEconomics';

const { 
  REVENUE_SHARE_RATE, 
  CAMPAIGN_CAP, 
  CONVERSION_IMPROVEMENT,
  CAP_THRESHOLD,
  DEFAULT_DISTRIBUTION 
} = CAPI_ECONOMICS_CONSTANTS;

/**
 * Calculate economics for a single CAPI campaign
 * Shows the cap benefit for large campaigns
 */
export const calculateCampaignEconomics = (campaignSpend: number): CampaignEconomics => {
  const incrementalRevenue = campaignSpend * CONVERSION_IMPROVEMENT;
  const rawFee = incrementalRevenue * REVENUE_SHARE_RATE;
  const cappedFee = Math.min(rawFee, CAMPAIGN_CAP);
  const netToPublisher = incrementalRevenue - cappedFee;
  const roiMultiple = cappedFee > 0 ? incrementalRevenue / cappedFee : 0;
  const isCapped = rawFee > CAMPAIGN_CAP;
  const capSavings = Math.max(0, rawFee - cappedFee);
  
  return {
    campaignSpend,
    incrementalRevenue,
    rawFee,
    cappedFee,
    netToPublisher,
    roiMultiple,
    isCapped,
    capSavings,
  };
};

/**
 * Generate realistic campaign distribution based on average spend
 * Returns array of campaign spends that average to the given value
 */
export const generateCampaignDistribution = (
  totalCampaigns: number,
  avgCampaignSpend: number
): number[] => {
  if (totalCampaigns === 0) return [];
  
  // Calculate tier counts
  const smallCount = Math.floor(totalCampaigns * DEFAULT_DISTRIBUTION.small);
  const mediumCount = Math.floor(totalCampaigns * DEFAULT_DISTRIBUTION.medium);
  const largeCount = Math.max(1, totalCampaigns - smallCount - mediumCount);
  
  // Define tier ranges that average to the target
  // Small: 30K - 80K (avg ~55K)
  // Medium: 100K - 250K (avg ~175K)
  // Large: 300K - 800K (avg ~550K)
  
  // Weighted average should equal avgCampaignSpend
  // (smallCount × 55K + mediumCount × 175K + largeCount × 550K) / total = avg
  // We'll adjust large tier avg to hit the target
  
  const targetTotal = totalCampaigns * avgCampaignSpend;
  const smallTotal = smallCount * 55000;
  const mediumTotal = mediumCount * 175000;
  const remainingForLarge = targetTotal - smallTotal - mediumTotal;
  const largeAvg = largeCount > 0 ? Math.max(300000, remainingForLarge / largeCount) : 0;
  
  const campaigns: number[] = [];
  
  // Generate small campaigns (30K - 80K)
  for (let i = 0; i < smallCount; i++) {
    const variance = (Math.random() - 0.5) * 50000; // ±25K variance
    campaigns.push(Math.max(30000, 55000 + variance));
  }
  
  // Generate medium campaigns (100K - 250K)
  for (let i = 0; i < mediumCount; i++) {
    const variance = (Math.random() - 0.5) * 150000; // ±75K variance
    campaigns.push(Math.max(100000, 175000 + variance));
  }
  
  // Generate large campaigns (300K+)
  for (let i = 0; i < largeCount; i++) {
    const variance = (Math.random() - 0.5) * 400000; // ±200K variance
    campaigns.push(Math.max(300000, largeAvg + variance));
  }
  
  return campaigns;
};

/**
 * Calculate portfolio-level analysis from campaign inputs
 * This is the main function for CAPI economics display
 */
export const calculateCampaignPortfolio = (
  yearlyCampaigns: number,
  avgCampaignSpend: number
): CampaignPortfolioAnalysis => {
  if (yearlyCampaigns === 0 || avgCampaignSpend === 0) {
    return createEmptyPortfolio();
  }
  
  // Calculate tier distribution based on default percentages
  const smallCount = Math.round(yearlyCampaigns * DEFAULT_DISTRIBUTION.small);
  const mediumCount = Math.round(yearlyCampaigns * DEFAULT_DISTRIBUTION.medium);
  const largeCount = Math.max(0, yearlyCampaigns - smallCount - mediumCount);
  
  // Define tier averages based on overall average
  // Adjust to hit the target average
  const targetTotal = yearlyCampaigns * avgCampaignSpend;
  const smallAvg = Math.min(avgCampaignSpend * 0.5, 60000);
  const mediumAvg = avgCampaignSpend * 1.2;
  const smallMedTotal = (smallCount * smallAvg) + (mediumCount * mediumAvg);
  const largeAvg = largeCount > 0 
    ? Math.max(avgCampaignSpend * 2, (targetTotal - smallMedTotal) / largeCount)
    : 0;
  
  // Build tiers with calculated economics
  const tiers: CampaignTier[] = [];
  
  // Small tier
  if (smallCount > 0) {
    const economics = calculateCampaignEconomics(smallAvg);
    tiers.push({
      label: 'Small',
      minSpend: 30000,
      maxSpend: 100000,
      avgSpend: smallAvg,
      count: smallCount,
      economics,
      totalIncremental: economics.incrementalRevenue * smallCount,
      totalFees: economics.cappedFee * smallCount,
      totalNet: economics.netToPublisher * smallCount,
    });
  }
  
  // Medium tier
  if (mediumCount > 0) {
    const economics = calculateCampaignEconomics(mediumAvg);
    tiers.push({
      label: 'Medium',
      minSpend: 100000,
      maxSpend: 300000,
      avgSpend: mediumAvg,
      count: mediumCount,
      economics,
      totalIncremental: economics.incrementalRevenue * mediumCount,
      totalFees: economics.cappedFee * mediumCount,
      totalNet: economics.netToPublisher * mediumCount,
    });
  }
  
  // Large tier
  if (largeCount > 0) {
    const economics = calculateCampaignEconomics(largeAvg);
    tiers.push({
      label: 'Large',
      minSpend: 300000,
      maxSpend: 1000000,
      avgSpend: largeAvg,
      count: largeCount,
      economics,
      totalIncremental: economics.incrementalRevenue * largeCount,
      totalFees: economics.cappedFee * largeCount,
      totalNet: economics.netToPublisher * largeCount,
    });
  }
  
  // Aggregate totals
  const totalIncremental = tiers.reduce((sum, t) => sum + t.totalIncremental, 0);
  const totalFees = tiers.reduce((sum, t) => sum + t.totalFees, 0);
  const totalNet = tiers.reduce((sum, t) => sum + t.totalNet, 0);
  const totalCampaignSpend = tiers.reduce((sum, t) => sum + (t.avgSpend * t.count), 0);
  
  // Calculate cap savings from large campaigns
  const totalCapSavings = tiers.reduce((sum, t) => sum + (t.economics.capSavings * t.count), 0);
  
  // Campaigns above cap threshold
  const campaignsAboveCap = tiers
    .filter(t => t.avgSpend >= CAP_THRESHOLD)
    .reduce((sum, t) => sum + t.count, 0);
  
  const aboveCapTiers = tiers.filter(t => t.avgSpend >= CAP_THRESHOLD);
  const aboveCapIncremental = aboveCapTiers.reduce((sum, t) => sum + t.totalIncremental, 0);
  const aboveCapSavings = aboveCapTiers.reduce((sum, t) => sum + (t.economics.capSavings * t.count), 0);
  
  // Generate example campaigns for storytelling
  const exampleCampaigns = [
    calculateCampaignEconomics(79000),    // Average campaign
    calculateCampaignEconomics(150000),   // Medium campaign
    calculateCampaignEconomics(300000),   // Large campaign
    calculateCampaignEconomics(500000),   // Very large
    calculateCampaignEconomics(1000000),  // CarSales example
  ];
  
  return {
    totalCampaigns: yearlyCampaigns,
    avgCampaignSpend,
    totalCampaignSpend,
    
    totalIncremental,
    totalFees,
    totalCapSavings,
    totalNetToPublisher: totalNet,
    portfolioROI: totalFees > 0 ? totalIncremental / totalFees : 0,
    
    tiers,
    
    campaignsAboveCap,
    capThreshold: CAP_THRESHOLD,
    aboveCapIncremental,
    aboveCapSavings,
    
    // Annualize
    monthlyIncremental: totalIncremental / 12,
    annualIncremental: totalIncremental,
    monthlyFees: totalFees / 12,
    annualFees: totalFees,
    monthlyNet: totalNet / 12,
    annualNet: totalNet,
    
    exampleCampaigns,
  };
};

/**
 * Create empty portfolio when no CAPI campaigns
 */
const createEmptyPortfolio = (): CampaignPortfolioAnalysis => ({
  totalCampaigns: 0,
  avgCampaignSpend: 0,
  totalCampaignSpend: 0,
  totalIncremental: 0,
  totalFees: 0,
  totalCapSavings: 0,
  totalNetToPublisher: 0,
  portfolioROI: 0,
  tiers: [],
  campaignsAboveCap: 0,
  capThreshold: CAP_THRESHOLD,
  aboveCapIncremental: 0,
  aboveCapSavings: 0,
  monthlyIncremental: 0,
  annualIncremental: 0,
  monthlyFees: 0,
  annualFees: 0,
  monthlyNet: 0,
  annualNet: 0,
  exampleCampaigns: [],
});

/**
 * Format currency for display
 */
export const formatCampaignCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${Math.round(value)}`;
};

/**
 * Format ROI multiple
 */
export const formatROI = (roi: number): string => {
  return `${roi.toFixed(1)}x`;
};
