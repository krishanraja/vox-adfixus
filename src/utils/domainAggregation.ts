import { VOX_MEDIA_DOMAINS, type VoxDomain } from '@/constants/voxMediaDomains';

export interface AggregatedInputs {
  totalMonthlyPageviews: number;
  weightedDisplayCPM: number;
  weightedVideoCPM: number;
  weightedDisplayVideoSplit: number;
  weightedSafariShare: number;
  weightedTechSavvy: number;
  selectedDomains: VoxDomain[];
}

/**
 * Aggregates metrics from selected domains, weighted by pageview volume
 */
export const aggregateDomainInputs = (domainIds: string[]): AggregatedInputs => {
  const domains = VOX_MEDIA_DOMAINS.filter(d => domainIds.includes(d.id));
  
  if (domains.length === 0) {
    // Return defaults if no domains selected
    return {
      totalMonthlyPageviews: 0,
      weightedDisplayCPM: 4.50,
      weightedVideoCPM: 12,
      weightedDisplayVideoSplit: 80,
      weightedSafariShare: 0.38,
      weightedTechSavvy: 0.70,
      selectedDomains: [],
    };
  }
  
  const totalPageviews = domains.reduce((sum, d) => sum + d.monthlyPageviews, 0);
  
  // Weight all metrics by pageview volume
  const weightedDisplayCPM = domains.reduce(
    (sum, d) => sum + (d.displayCPM * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
  const weightedVideoCPM = domains.reduce(
    (sum, d) => sum + (d.videoCPM * d.monthlyPageviews),
    0
  ) / totalPageviews;
  
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
    weightedDisplayCPM,
    weightedVideoCPM,
    weightedDisplayVideoSplit,
    weightedSafariShare,
    weightedTechSavvy,
    selectedDomains: domains,
  };
};
