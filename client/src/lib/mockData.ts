export interface Brief {
  id: string;
  title: string;
  orgName: string;
  overview: string;
  requirements: string[];
  deliverables: {
    ratio: string;
    length: string;
    format: string;
  };
  reward: {
    type: 'CASH' | 'BONUS_BETS' | 'OTHER';
    amount: number | string;
    currency?: string;
    description?: string;
  };
  deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  submissionCount: number;
  slug: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  briefId: string;
  creator: {
    name: string;
    email: string;
    handle: string;
    avatar?: string;
  };
  video: {
    url: string;
    thumbnail?: string;
    duration?: string;
  };
  status: 'RECEIVED' | 'IN_REVIEW' | 'SELECTED' | 'NOT_SELECTED';
  submittedAt: string;
  payoutStatus: 'NOT_APPLICABLE' | 'PENDING' | 'PAID';
}

export const MOCK_BRIEFS: Brief[] = [
  {
    id: '1',
    slug: 'summer-vibes-campaign',
    title: 'Summer Vibes Campaign 2025',
    orgName: 'Glow Energy',
    overview: 'We are looking for high-energy creators to showcase our new Summer Berry flavor. The vibe should be outdoors, fun, and active.',
    requirements: [
      'Must show the can clearly within the first 3 seconds',
      'Mention "Zero Sugar" and "Natural Caffeine"',
      'Include the hashtag #GlowSummer in the caption',
      'Filmed outdoors in sunlight',
    ],
    deliverables: {
      ratio: '9:16 (Vertical)',
      length: '15-30 seconds',
      format: 'MP4 / 1080p',
    },
    reward: {
      type: 'CASH',
      amount: 500,
      currency: 'USD',
    },
    deadline: '2025-07-15T23:59:00Z',
    status: 'PUBLISHED',
    submissionCount: 12,
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: '2',
    slug: 'tech-setup-tour',
    title: 'Ultimate Desk Setup Tour',
    orgName: 'ErgoLife',
    overview: 'Show us how you use the ErgoLife Standing Desk in your daily workflow. Focus on ergonomics and productivity.',
    requirements: [
      'Demonstrate the sit-to-stand transition',
      'Talk about how it helps your back pain/posture',
      'Clean, minimal aesthetic preferred',
    ],
    deliverables: {
      ratio: '16:9 or 9:16',
      length: '45-60 seconds',
      format: 'MP4',
    },
    reward: {
      type: 'OTHER',
      amount: 'Free Desk Accessories',
      description: 'Full set of cable management + monitor arm ($300 value)',
    },
    deadline: '2025-08-01T23:59:00Z',
    status: 'PUBLISHED',
    submissionCount: 5,
    createdAt: '2025-06-05T14:20:00Z',
  },
  {
    id: '3',
    slug: 'gaming-night-promo',
    title: 'Gaming Night Promo',
    orgName: 'BetZone',
    overview: 'Create a hype video for the upcoming championship finals. Authentic reaction style.',
    requirements: [
      'Must be 21+ to submit',
      'Show excitement/reactions',
      'No music due to copyright, voiceover only',
    ],
    deliverables: {
      ratio: '9:16',
      length: '15s',
      format: 'MP4',
    },
    reward: {
      type: 'BONUS_BETS',
      amount: 1000,
      description: 'in Bonus Bets',
    },
    deadline: '2025-06-30T00:00:00Z',
    status: 'DRAFT',
    submissionCount: 0,
    createdAt: '2025-06-15T09:00:00Z',
  }
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 's1',
    briefId: '1',
    creator: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      handle: '@sarahcreates',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100',
    },
    video: {
      url: '#',
      thumbnail: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&w=800&q=80',
      duration: '0:24',
    },
    status: 'SELECTED',
    submittedAt: '2025-06-10T14:30:00Z',
    payoutStatus: 'PAID',
  },
  {
    id: 's2',
    briefId: '1',
    creator: {
      name: 'Mike Chen',
      email: 'mike.c@example.com',
      handle: '@mike_vlogs',
    },
    video: {
      url: '#',
      thumbnail: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80',
      duration: '0:18',
    },
    status: 'IN_REVIEW',
    submittedAt: '2025-06-12T09:15:00Z',
    payoutStatus: 'NOT_APPLICABLE',
  },
  {
    id: 's3',
    briefId: '1',
    creator: {
      name: 'Jessica Alva',
      email: 'jess.alva@example.com',
      handle: '@jess_fitness',
    },
    video: {
      url: '#',
      thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
      duration: '0:30',
    },
    status: 'RECEIVED',
    submittedAt: '2025-06-14T16:45:00Z',
    payoutStatus: 'NOT_APPLICABLE',
  }
];
