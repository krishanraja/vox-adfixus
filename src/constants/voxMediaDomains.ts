// Vox Media property data based on publicly available traffic estimates
// Total portfolio reach: ~130M monthly visitors (Vox Media reported)

export interface VoxDomain {
  id: string;
  name: string;
  monthlyPageviews: number;
  displayCPM: number;
  videoCPM: number;
  displayVideoSplit: number;
  category: 'news-tech' | 'lifestyle-food' | 'entertainment' | 'sports' | 'real-estate';
  audienceProfile: {
    techSavvy: number; // 0-1, higher = faster adoption
    safariShare: number; // % of traffic from Safari/iOS
  };
}

export const VOX_MEDIA_DOMAINS: VoxDomain[] = [
  {
    id: 'the-verge',
    name: 'The Verge',
    monthlyPageviews: 40000000,
    displayCPM: 5.50,
    videoCPM: 18,
    displayVideoSplit: 75,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.85,
      safariShare: 0.42,
    }
  },
  {
    id: 'vox',
    name: 'Vox',
    monthlyPageviews: 35000000,
    displayCPM: 4.75,
    videoCPM: 15,
    displayVideoSplit: 70,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.75,
      safariShare: 0.38,
    }
  },
  {
    id: 'polygon',
    name: 'Polygon',
    monthlyPageviews: 25000000,
    displayCPM: 5.00,
    videoCPM: 16,
    displayVideoSplit: 80,
    category: 'news-tech',
    audienceProfile: {
      techSavvy: 0.80,
      safariShare: 0.40,
    }
  },
  {
    id: 'eater',
    name: 'Eater',
    monthlyPageviews: 20000000,
    displayCPM: 4.25,
    videoCPM: 12,
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.65,
      safariShare: 0.40,
    }
  },
  {
    id: 'sbnation',
    name: 'SB Nation',
    monthlyPageviews: 30000000,
    displayCPM: 3.75,
    videoCPM: 10,
    displayVideoSplit: 90,
    category: 'sports',
    audienceProfile: {
      techSavvy: 0.60,
      safariShare: 0.32,
    }
  },
  {
    id: 'curbed',
    name: 'Curbed',
    monthlyPageviews: 12000000,
    displayCPM: 4.50,
    videoCPM: 14,
    displayVideoSplit: 85,
    category: 'real-estate',
    audienceProfile: {
      techSavvy: 0.70,
      safariShare: 0.38,
    }
  },
  {
    id: 'the-cut',
    name: 'The Cut',
    monthlyPageviews: 18000000,
    displayCPM: 5.25,
    videoCPM: 16,
    displayVideoSplit: 80,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.72,
      safariShare: 0.41,
    }
  },
  {
    id: 'grub-street',
    name: 'Grub Street',
    monthlyPageviews: 10000000,
    displayCPM: 4.00,
    videoCPM: 13,
    displayVideoSplit: 85,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.68,
      safariShare: 0.39,
    }
  },
  {
    id: 'vulture',
    name: 'Vulture',
    monthlyPageviews: 22000000,
    displayCPM: 5.00,
    videoCPM: 15,
    displayVideoSplit: 75,
    category: 'entertainment',
    audienceProfile: {
      techSavvy: 0.73,
      safariShare: 0.37,
    }
  },
  {
    id: 'thrillist',
    name: 'Thrillist',
    monthlyPageviews: 15000000,
    displayCPM: 3.50,
    videoCPM: 11,
    displayVideoSplit: 88,
    category: 'lifestyle-food',
    audienceProfile: {
      techSavvy: 0.62,
      safariShare: 0.34,
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
  top3: ['the-verge', 'vox', 'sbnation'],
  newsNetwork: ['the-verge', 'vox', 'polygon'],
  fullPortfolio: VOX_MEDIA_DOMAINS.map(d => d.id),
};
