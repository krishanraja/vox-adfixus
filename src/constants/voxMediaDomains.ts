// Vox Media property data - Briar's Internal Reporting (December 2024)
// Total portfolio reach: ~203.5M monthly pageviews (Briar's numbers)
// Pricing based on 70M pageview/month allowance at $239,140/year

export interface VoxDomain {
  id: string;
  name: string;
  monthlyPageviews: number;
  displayVideoSplit: number;
  category: 'news-tech' | 'lifestyle-food' | 'entertainment' | 'sports' | 'real-estate';
  adsPerPage: number; // Ad units per pageview (1.5, 2.0, or 2.5)
  audienceProfile: {
    techSavvy: number; // 0-1, higher = faster adoption
    safariShare: number; // % of traffic from Safari/iOS
  };
  inPoc?: boolean; // Part of initial POC scope
}

export const VOX_MEDIA_DOMAINS: VoxDomain[] = [
  // SPORTS - Highest volume
  {
    id: 'sbnation',
    name: 'SB Nation',
    monthlyPageviews: 102866201, // Briar's internal reporting
    displayVideoSplit: 90,
    category: 'sports',
    adsPerPage: 2.5,
    audienceProfile: {
      techSavvy: 0.60,
      safariShare: 0.32,
    }
  },
  // FOOD & LIFESTYLE
  {
    id: 'eater',
    name: 'Eater',
    monthlyPageviews: 10518128, // Briar's internal reporting
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    adsPerPage: 2.0,
    audienceProfile: {
      techSavvy: 0.65,
      safariShare: 0.40,
    }
  },
  // NEWS & TECH - POC domains
  {
    id: 'the-verge',
    name: 'The Verge',
    monthlyPageviews: 22808519, // Briar's internal reporting
    displayVideoSplit: 75,
    category: 'news-tech',
    adsPerPage: 2.0,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.85,
      safariShare: 0.42,
    }
  },
  // ENTERTAINMENT
  {
    id: 'the-dodo',
    name: 'The Dodo',
    monthlyPageviews: 15877015, // Briar's internal reporting
    displayVideoSplit: 88,
    category: 'entertainment',
    adsPerPage: 2.5,
    audienceProfile: {
      techSavvy: 0.55,
      safariShare: 0.45,
    }
  },
  {
    id: 'vulture',
    name: 'Vulture',
    monthlyPageviews: 14422791, // Briar's internal reporting
    displayVideoSplit: 75,
    category: 'entertainment',
    adsPerPage: 1.5,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.73,
      safariShare: 0.37,
    }
  },
  {
    id: 'nymag',
    name: 'NYMag (incl Strategist + Intelligencer)',
    monthlyPageviews: 14926266, // Briar's internal reporting: NYMag 4,362,773 + Strategist 6,566,186 + Intelligencer 3,997,307
    displayVideoSplit: 76, // Weighted average across the three properties
    category: 'entertainment',
    adsPerPage: 1.5,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.72, // Weighted average
      safariShare: 0.40, // Weighted average
    }
  },
  // NEWS & TECH
  {
    id: 'vox',
    name: 'Vox',
    monthlyPageviews: 6015197, // Briar's internal reporting
    displayVideoSplit: 70,
    category: 'news-tech',
    adsPerPage: 2.0,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.75,
      safariShare: 0.38,
    }
  },
  // ENTERTAINMENT
  {
    id: 'the-cut',
    name: 'The Cut',
    monthlyPageviews: 9110699, // Briar's internal reporting
    displayVideoSplit: 80,
    category: 'entertainment',
    adsPerPage: 1.5,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.72,
      safariShare: 0.41,
    }
  },
  {
    id: 'popsugar',
    name: 'PopSugar',
    monthlyPageviews: 3269639, // Briar's internal reporting
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    adsPerPage: 2.5,
    audienceProfile: {
      techSavvy: 0.62,
      safariShare: 0.44,
    }
  },
  {
    id: 'thrillist',
    name: 'Thrillist',
    monthlyPageviews: 1323468, // Briar's internal reporting
    displayVideoSplit: 88,
    category: 'lifestyle-food',
    adsPerPage: 2.5,
    audienceProfile: {
      techSavvy: 0.62,
      safariShare: 0.34,
    }
  },
  {
    id: 'punch',
    name: 'Punch',
    monthlyPageviews: 926506, // Briar's internal reporting
    displayVideoSplit: 80,
    category: 'lifestyle-food',
    adsPerPage: 1.5,
    audienceProfile: {
      techSavvy: 0.65,
      safariShare: 0.38,
    }
  },
  {
    id: 'curbed',
    name: 'Curbed',
    monthlyPageviews: 833480, // Briar's internal reporting
    displayVideoSplit: 85,
    category: 'real-estate',
    adsPerPage: 2.0,
    audienceProfile: {
      techSavvy: 0.70,
      safariShare: 0.38,
    }
  },
  {
    id: 'grub-street',
    name: 'Grub Street',
    monthlyPageviews: 648815, // Briar's internal reporting
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    adsPerPage: 1.5,
    inPoc: true,
    audienceProfile: {
      techSavvy: 0.68,
      safariShare: 0.39,
    }
  },
];

export const CATEGORY_LABELS: Record<VoxDomain['category'], string> = {
  'news-tech': 'News & Technology',
  'lifestyle-food': 'Lifestyle & Food',
  'entertainment': 'Entertainment',
  'sports': 'Sports',
  'real-estate': 'Real Estate',
};

// Contract-based presets
export const DOMAIN_PRESETS = {
  // POC: 5 domains (The Verge, Vox, NYMag cluster - NYMag now includes Strategist + Intelligencer)
  pocDomains: ['the-verge', 'vox', 'nymag', 'the-cut', 'vulture', 'grub-street'], // 6 domains, nymag includes Strategist + Intelligencer
  // Full contract: all 14 domains
  fullPortfolio: VOX_MEDIA_DOMAINS.map(d => d.id),
  // High-traffic domains
  topDomains: ['sbnation', 'eater', 'the-verge', 'the-dodo'],
};

// Contract pricing constants
export const CONTRACT_PRICING = {
  // POC Phase (Months 1-3)
  POC_FLAT_FEE: 15000, // $15,000 for 3 months (50% discount!)
  POC_MONTHLY_EQUIVALENT: 5000, // $5,000/month during POC
  POC_DURATION_MONTHS: 3,
  
  // Full Contract (Month 4+) - DOWN from previous quote!
  ANNUAL_LICENSE_FEE: 239140, // $239,140/year (was $312K - 23% reduction!)
  FULL_CONTRACT_MONTHLY: 19928, // $19,928/month (was $26K!)
  INCLUDED_PAGEVIEWS: 70000000, // 70M pageviews/month included
  
  // Overage pricing
  OVERAGE_RATE_PER_THOUSAND: 0.048, // $0.048 per 1,000 excess pageviews
  
  // CAPI Service Fee
  CAPI_SERVICE_FEE_RATE: 0.125, // 12.5% of campaign revenue
  
  // Additional fees
  CONNECTION_FEE_MONTHLY: 287, // $287/month per Active Connection
  STREAM_EVENT_FEE_PER_THOUSAND: 0.64, // $0.64 per 1,000 Stream Events
  ADDITIONAL_DOMAIN_FEE: 204, // $204/month per additional domain
  
  // Contract terms
  CONTRACT_EFFECTIVE_DATE: '2026-01-01',
  ANNUAL_FEE_INCREASE: 0.08, // 8% annual increase
};

// Calculated totals
export const PORTFOLIO_TOTALS = {
  TOTAL_MONTHLY_PAGEVIEWS: VOX_MEDIA_DOMAINS.reduce((sum, d) => sum + d.monthlyPageviews, 0),
  TOTAL_MONTHLY_IMPRESSIONS: VOX_MEDIA_DOMAINS.reduce((sum, d) => sum + (d.monthlyPageviews * d.adsPerPage), 0),
  POC_MONTHLY_PAGEVIEWS: VOX_MEDIA_DOMAINS.filter(d => d.inPoc).reduce((sum, d) => sum + d.monthlyPageviews, 0),
  DOMAIN_COUNT: VOX_MEDIA_DOMAINS.length,
  POC_DOMAIN_COUNT: VOX_MEDIA_DOMAINS.filter(d => d.inPoc).length,
};
