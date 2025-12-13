import { VOX_MEDIA_DOMAINS, type VoxDomain } from '@/constants/voxMediaDomains';

export interface AggregatedInputs {
  totalMonthlyPageviews: number;
  totalMonthlyImpressions: number; // Pageviews × adsPerPage
  displayCPM: number;
  videoCPM: number;
  weightedDisplayVideoSplit: number;
  weightedSafariShare: number;
  weightedTechSavvy: number;
  weightedAdsPerPage: number;
  selectedDomains: VoxDomain[];
}

/**
 * Aggregates metrics from selected domains, weighted by pageview volume
 * Uses user-provided CPMs and domain-specific adsPerPage multipliers
 */
export const aggregateDomainInputs = (
  domainIds: string[], 
  displayCPM: number = 4.50, 
  videoCPM: number = 15.00,
  pageviewOverrides?: Record<string, number>,
  safariShareOverrides?: Record<string, number>
): AggregatedInputs => {
  const domains = VOX_MEDIA_DOMAINS.filter(d => domainIds.includes(d.id)).map(d => ({
    ...d,
    monthlyPageviews: pageviewOverrides?.[d.id] ?? d.monthlyPageviews,
    audienceProfile: {
      ...d.audienceProfile,
      safariShare: safariShareOverrides?.[d.id] ?? d.audienceProfile.safariShare
    }
  }));
  
  if (domains.length === 0) {
    // Return defaults if no domains selected
    return {
      totalMonthlyPageviews: 0,
      totalMonthlyImpressions: 0,
      displayCPM,
      videoCPM,
      weightedDisplayVideoSplit: 80,
      weightedSafariShare: 0.38,
      weightedTechSavvy: 0.70,
      weightedAdsPerPage: 2.0,
      selectedDomains: [],
    };
  }
  
  const totalPageviews = domains.reduce((sum, d) => sum + d.monthlyPageviews, 0);
  
  // Calculate total impressions using domain-specific adsPerPage
  const totalImpressions = domains.reduce(
    (sum, d) => sum + (d.monthlyPageviews * d.adsPerPage),
    0
  );
  
  // Weight metrics by pageview volume
  const weightedDisplayVideoSplit = domains.reduce(
    (sum, d) => sum + (d.displayVideoSplit * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
  const weightedSafariShare = domains.reduce(
    (sum, d) => sum + (d.audienceProfile.safariShare * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
  const weightedTechSavvy = domains.reduce(
    (sum, d) => sum + (d.audienceProfile.techSavvy * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
  const weightedAdsPerPage = domains.reduce(
    (sum, d) => sum + (d.adsPerPage * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
  return {
    totalMonthlyPageviews: totalPageviews,
    totalMonthlyImpressions: totalImpressions,
    displayCPM,
    videoCPM,
    weightedDisplayVideoSplit,
    weightedSafariShare,
    weightedTechSavvy,
    weightedAdsPerPage,
    selectedDomains: domains,
  };
};
