// Vox Media property data based on publicly available traffic estimates
// Total portfolio reach: ~238M monthly pageviews

export interface VoxDomain {
  id: string;
  name: string;
  monthlyPageviews: number;
  displayVideoSplit: number;
  category: 'news-tech' | 'lifestyle-food' | 'entertainment' | 'sports' | 'real-estate';
  audienceProfile: {
    techSavvy: number; // 0-1, higher = faster adoption
    safariShare: number; // % of traffic from Safari/iOS
  };
}

export const VOX_MEDIA_DOMAINS: VoxDomain[] = [
  {
    id: 'sbnation',
    name: 'SB Nation',
    monthlyPageviews: 129055407,
    displayVideoSplit: 90,
    category: 'sports',
    audienceProfile: {
      techSavvy: 0.60,
      safariShare: 0.32,
    }
  },
  {
    id: 'the-verge',
    name: 'The Verge',
    monthlyPageviews: 19368729,
    displayVideoSplit: 75,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.85,
      safariShare: 0.42,
    }
  },
  {
    id: 'the-dodo',
    name: 'The Dodo',
    monthlyPageviews: 18718709,
    displayVideoSplit: 88,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.55,
      safariShare: 0.45,
    }
  },
  {
    id: 'eater',
    name: 'Eater',
    monthlyPageviews: 17654262,
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.65,
      safariShare: 0.40,
    }
  },
  {
    id: 'vox',
    name: 'Vox',
    monthlyPageviews: 10233920,
    displayVideoSplit: 70,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.75,
      safariShare: 0.38,
    }
  },
  {
    id: 'vulture',
    name: 'Vulture',
    monthlyPageviews: 9504944,
    displayVideoSplit: 75,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.73,
      safariShare: 0.37,
    }
  },
  {
    id: 'nymag',
    name: 'NYMag',
    monthlyPageviews: 7322104,
    displayVideoSplit: 75,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.70,
      safariShare: 0.40,
    }
  },
  {
    id: 'the-cut',
    name: 'The Cut',
    monthlyPageviews: 7056920,
    displayVideoSplit: 80,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.72,
      safariShare: 0.41,
    }
  },
  {
    id: 'strategist',
    name: 'Strategist',
    monthlyPageviews: 5141758,
    displayVideoSplit: 82,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.68,
      safariShare: 0.42,
    }
  },
  {
    id: 'popsugar',
    name: 'PopSugar',
    monthlyPageviews: 5070798,
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.62,
      safariShare: 0.44,
    }
  },
  {
    id: 'intelligencer',
    name: 'Intelligencer',
    monthlyPageviews: 3556632,
    displayVideoSplit: 70,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.78,
      safariShare: 0.38,
    }
  },
  {
    id: 'thrillist',
    name: 'Thrillist',
    monthlyPageviews: 2277026,
    displayVideoSplit: 88,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.62,
      safariShare: 0.34,
    }
  },
  {
    id: 'curbed',
    name: 'Curbed',
    monthlyPageviews: 1063626,
    displayVideoSplit: 85,
    category: 'real-estate',
    audienceProfile: {
      techSavvy: 0.70,
      safariShare: 0.38,
    }
  },
  {
    id: 'nymag-app',
    name: 'NYMag App',
    monthlyPageviews: 761041,
    displayVideoSplit: 75,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.72,
      safariShare: 0.48,
    }
  },
  {
    id: 'punch',
    name: 'Punch',
    monthlyPageviews: 607077,
    displayVideoSplit: 80,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.65,
      safariShare: 0.38,
    }
  },
  {
    id: 'grub-street',
    name: 'Grub Street',
    monthlyPageviews: 486760,
    displayVideoSplit: 85,
    category: 'lifestyle-food',
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

// Quick select presets
export const DOMAIN_PRESETS = {
  top3: ['sbnation', 'the-verge', 'the-dodo'],
  newsNetwork: ['the-verge', 'vox', 'intelligencer'],
  fullPortfolio: VOX_MEDIA_DOMAINS.map(d => d.id),
};
