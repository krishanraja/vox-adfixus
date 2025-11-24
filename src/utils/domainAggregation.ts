import { VOX_MEDIA_DOMAINS, type VoxDomain } from '@/constants/voxMediaDomains';

export interface AggregatedInputs {
  totalMonthlyPageviews: number;
  displayCPM: number;
  videoCPM: number;
  weightedDisplayVideoSplit: number;
  weightedSafariShare: number;
  weightedTechSavvy: number;
  selectedDomains: VoxDomain[];
}

/**
 * Aggregates metrics from selected domains, weighted by pageview volume
 * Uses user-provided CPMs instead of domain-specific CPMs
 */
export const aggregateDomainInputs = (
  domainIds: string[], 
  displayCPM: number = 4.50, 
  videoCPM: number = 15.00,
  pageviewOverrides?: Record<string, number>
): AggregatedInputs => {
  const domains = VOX_MEDIA_DOMAINS.filter(d => domainIds.includes(d.id)).map(d => ({
    ...d,
    monthlyPageviews: pageviewOverrides?.[d.id] ?? d.monthlyPageviews
  }));
  
  if (domains.length === 0) {
    // Return defaults if no domains selected
    return {
      totalMonthlyPageviews: 0,
      displayCPM,
      videoCPM,
      weightedDisplayVideoSplit: 80,
      weightedSafariShare: 0.38,
      weightedTechSavvy: 0.70,
      selectedDomains: [],
    };
  }
  
  const totalPageviews = domains.reduce((sum, d) => sum + d.monthlyPageviews, 0);
  
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
  
  return {
    totalMonthlyPageviews: totalPageviews,
    displayCPM,
    videoCPM,
    weightedDisplayVideoSplit,
    weightedSafariShare,
    weightedTechSavvy,
    selectedDomains: domains,
  };
};
