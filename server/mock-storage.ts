import type { 
  IStorage,
  User,
  Brief,
  BriefWithOrg,
  InsertBrief,
  Submission,
  InsertSubmission,
  PromptTemplate,
  InsertPromptTemplate,
  Feedback,
  InsertFeedback,
  Influencer,
  InsertInfluencer,
} from "./storage";

// Mock data
const mockBriefs: Brief[] = [
  {
    id: 1,
    slug: "pmr-new-years-2025",
    title: "PMR New Years 2025",
    orgName: "Hard Rock Bet",
    businessLine: "PMR",
    state: "Florida",
    overview: "Celebrate the New Year with Hard Rock Bet! Create engaging content showcasing your New Year's betting traditions and resolutions.",
    requirements: [
      "Mention Hard Rock Bet app",
      "Show responsible gaming message",
      "Include #HardRockNewYear",
      "Must be 21+ to participate"
    ],
    deliverableRatio: "9:16 (Vertical)",
    deliverableLength: "15-30 seconds",
    deliverableFormat: "MP4 / 1080p",
    rewardType: "BONUS_BETS",
    rewardAmount: "1000",
    rewardCurrency: "USD",
    rewardDescription: "in Free Bets",
    deadline: new Date("2025-01-05T23:59:00Z"),
    status: "PUBLISHED",
    password: null,
    maxWinners: 5,
    maxSubmissionsPerCreator: 1,
    ownerId: "demo-user-1",
    createdAt: new Date("2024-12-20T10:00:00Z"),
    updatedAt: new Date()
  },
  {
    id: 2,
    slug: "nfl-playoffs-hype",
    title: "NFL Playoffs Hype",
    orgName: "FanDuel",
    businessLine: "Sportsbook",
    state: "New Jersey",
    overview: "Get fans pumped for the NFL playoffs! Show your game day setup and predictions for the wild card weekend.",
    requirements: [
      "Wear your team colors",
      "Show FanDuel app on screen",
      "Share your playoff predictions",
      "High energy required",
      "Include #FanDuelPlayoffs"
    ],
    deliverableRatio: "16:9 or 9:16",
    deliverableLength: "30-60 seconds",
    deliverableFormat: "MP4 / 4K preferred",
    rewardType: "CASH",
    rewardAmount: "750",
    rewardCurrency: "USD",
    rewardDescription: null,
    deadline: new Date("2025-01-10T23:59:00Z"),
    status: "PUBLISHED",
    password: null,
    maxWinners: 10,
    maxSubmissionsPerCreator: 2,
    ownerId: "demo-user-1",
    createdAt: new Date("2024-12-28T14:00:00Z"),
    updatedAt: new Date()
  },
  {
    id: 3,
    slug: "huff-n-even-more-puff",
    title: "Huff N Even More Puff",
    orgName: "BetMGM",
    businessLine: "Casino",
    state: "Michigan",
    overview: "Showcase the excitement of our Big Bad Wolf slot game! Create fairy tale themed content that highlights the thrill of the chase.",
    requirements: [
      "Reference the Three Little Pigs story",
      "Show BetMGM Casino app",
      "Mention the bonus features",
      "Family-friendly content only",
      "Use #HuffAndPuffBig"
    ],
    deliverableRatio: "1:1 (Square)",
    deliverableLength: "15 seconds",
    deliverableFormat: "MP4 / 1080p",
    rewardType: "OTHER",
    rewardAmount: "Casino Credits",
    rewardDescription: "$500 in Casino Credits + Wolf Pack Merch",
    deadline: new Date("2025-01-20T23:59:00Z"),
    status: "PUBLISHED",
    password: null,
    maxWinners: 7,
    maxSubmissionsPerCreator: 3,
    ownerId: "demo-user-1",
    createdAt: new Date("2025-01-01T09:00:00Z"),
    updatedAt: new Date()
  }
];

const mockSubmissions: Submission[] = [
  // PMR New Years 2025 - Brief ID 1 (3 submissions)
  {
    id: 1,
    briefId: 1,
    creatorId: null,
    creatorName: "Sarah Jenkins",
    creatorEmail: "sarah.j@example.com",
    creatorPhone: "+1 555-0101",
    creatorHandle: "@sarahcreates",
    creatorBettingAccount: "sarah_bets",
    message: "Happy New Year from Hard Rock Bet! Here's to winning big in 2025! 🎊 #HardRockNewYear",
    videoUrl: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=450&fit=crop",
    videoFileName: "sarah-newyear.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 15728640,
    status: "SELECTED",
    payoutStatus: "PAID",
    payoutAmount: "1000",
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: null,
    selectedAt: new Date(),
    paidAt: new Date(),
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 2,
    briefId: 1,
    creatorId: null,
    creatorName: "Mike Chen",
    creatorEmail: "mike.c@example.com",
    creatorPhone: null,
    creatorHandle: "@mike_vlogs",
    creatorBettingAccount: null,
    message: "My 2025 betting resolution? Bet smart with Hard Rock! Remember to play responsibly 21+ #HardRockNewYear",
    videoUrl: "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=800&h=450&fit=crop",
    videoFileName: "mike-newyear.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 12582912,
    status: "IN_REVIEW",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: null,
    reviewNotes: null,
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 3,
    briefId: 1,
    creatorId: null,
    creatorName: "Jessica Alva",
    creatorEmail: "jess.alva@example.com",
    creatorPhone: null,
    creatorHandle: "@jess_fitness",
    creatorBettingAccount: null,
    message: "Starting 2025 right with Hard Rock Bet! New year, new wins! 🎯 #HardRockNewYear",
    videoUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&h=450&fit=crop",
    videoFileName: "jess-newyear.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 20971520,
    status: "NOT_SELECTED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: "Good content but forgot to mention the responsible gaming message",
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 1,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  // NFL Playoffs Hype - Brief ID 2 (4 submissions)
  {
    id: 4,
    briefId: 2,
    creatorId: null,
    creatorName: "Alex Rivera",
    creatorEmail: "alex.r@example.com",
    creatorPhone: null,
    creatorHandle: "@alexfitness",
    creatorBettingAccount: null,
    message: "Who's ready for WILD CARD WEEKEND?! 🏈 My Eagles are going all the way! #FanDuelPlayoffs",
    videoUrl: "https://images.unsplash.com/photo-1566479117168-c91ad0938155?w=800&h=450&fit=crop",
    videoFileName: "alex-playoffs.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 18874368,
    status: "SELECTED",
    payoutStatus: "PENDING",
    payoutAmount: "750",
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: null,
    selectedAt: new Date(),
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 5,
    briefId: 2,
    creatorId: null,
    creatorName: "Taylor Swift",
    creatorEmail: "taylor.s@example.com",
    creatorPhone: null,
    creatorHandle: "@tayloractive",
    creatorBettingAccount: null,
    message: "Game day setup complete! Chiefs Kingdom ready to dominate! Check my picks on FanDuel 🏈 #FanDuelPlayoffs",
    videoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&h=450&fit=crop",
    videoFileName: "taylor-playoffs.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 16777216,
    status: "IN_REVIEW",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: null,
    reviewNotes: null,
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 6,
    briefId: 2,
    creatorId: null,
    creatorName: "Jordan Lee",
    creatorEmail: "jordan.l@example.com",
    creatorPhone: null,
    creatorHandle: "@jordanruns",
    creatorBettingAccount: null,
    message: "Bills Mafia checking in! Wild card predictions locked in on FanDuel! LET'S GO! #FanDuelPlayoffs",
    videoUrl: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&h=450&fit=crop",
    videoFileName: "jordan-playoffs.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 14680064,
    status: "SELECTED",
    payoutStatus: "PENDING",
    payoutAmount: "750",
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: null,
    selectedAt: new Date(),
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 7,
    briefId: 2,
    creatorId: null,
    creatorName: "Casey Morgan",
    creatorEmail: "casey.m@example.com",
    creatorPhone: null,
    creatorHandle: "@caseyvibes",
    creatorBettingAccount: null,
    message: "Cowboys nation stand up! 🤠 Playoffs here we come! All my bets on FanDuel #FanDuelPlayoffs",
    videoUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=450&fit=crop",
    videoFileName: "casey-playoffs.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 19922944,
    status: "RECEIVED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: null,
    reviewNotes: null,
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  // Huff N Even More Puff - Brief ID 3 (5 submissions)
  {
    id: 8,
    briefId: 3,
    creatorId: null,
    creatorName: "Riley Cooper",
    creatorEmail: "riley.c@example.com",
    creatorPhone: null,
    creatorHandle: "@rileyoutdoors",
    creatorBettingAccount: null,
    message: "The Big Bad Wolf can't blow down my wins! 🐺 BetMGM Casino's bonus features are incredible! #HuffAndPuffBig",
    videoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=450&fit=crop",
    videoFileName: "riley-wolf.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 17825792,
    status: "SELECTED",
    payoutStatus: "PAID",
    payoutAmount: "Casino Credits",
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: null,
    selectedAt: new Date(),
    paidAt: new Date(),
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 9,
    briefId: 3,
    creatorId: null,
    creatorName: "Sam Williams",
    creatorEmail: "sam.w@example.com",
    creatorPhone: null,
    creatorHandle: "@samactive",
    creatorBettingAccount: null,
    message: "Little pigs better watch out! The wolf is coming to BetMGM Casino! 🏠 #HuffAndPuffBig",
    videoUrl: "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&h=450&fit=crop",
    videoFileName: "sam-wolf.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 13631488,
    status: "NOT_SELECTED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: "Did not mention bonus features as required",
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 1,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 10,
    briefId: 3,
    creatorId: null,
    creatorName: "Morgan Davis",
    creatorEmail: "morgan.d@example.com",
    creatorPhone: null,
    creatorHandle: "@morgansummer",
    creatorBettingAccount: null,
    message: "Building my house of bricks with BetMGM wins! 🧱 The wolf can't touch these bonuses! #HuffAndPuffBig",
    videoUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800&h=450&fit=crop",
    videoFileName: "morgan-wolf.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 15728640,
    status: "IN_REVIEW",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: null,
    reviewNotes: null,
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 11,
    briefId: 3,
    creatorId: null,
    creatorName: "Blake Turner",
    creatorEmail: "blake.t@example.com",
    creatorPhone: null,
    creatorHandle: "@blakefit",
    creatorBettingAccount: null,
    message: "Once upon a time, I found the BEST slots at BetMGM Casino! 🐷 Try the Big Bad Wolf! #HuffAndPuffBig",
    videoUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=450&fit=crop",
    videoFileName: "blake-wolf.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 21495808,
    status: "SELECTED",
    payoutStatus: "PENDING",
    payoutAmount: "Casino Credits",
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: null,
    selectedAt: new Date(),
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  {
    id: 12,
    briefId: 3,
    creatorId: null,
    creatorName: "Drew Johnson",
    creatorEmail: "drew.j@example.com",
    creatorPhone: null,
    creatorHandle: "@drewvibes",
    creatorBettingAccount: null,
    message: "Huffing and puffing my way to big wins! BetMGM's Wolf slots are family-friendly fun! 🏆 #HuffAndPuffBig",
    videoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop",
    videoFileName: "drew-wolf.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 11534336,
    status: "RECEIVED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: null,
    reviewNotes: null,
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 0,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  }
];

const mockInfluencers: Influencer[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 555-0101",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    instagramHandle: "@sarahcreates",
    instagramFollowers: 45000,
    instagramVerified: 1,
    tiktokHandle: "@sarahcreates",
    youtubeChannel: null,
    bankAccountHolderName: "Sarah Jenkins",
    bankRoutingNumber: "123456789",
    bankAccountNumber: "000123456",
    bankAccountType: "checking",
    taxIdNumber: "XXX-XX-1234",
    status: "approved",
    idVerified: 1,
    bankVerified: 1,
    adminNotes: null,
    rejectionReason: null,
    appliedAt: new Date(),
    approvedAt: new Date(),
    rejectedAt: null,
    lastActiveAt: new Date(),
    notificationPreferences: "all",
    preferredPaymentMethod: "bank"
  }
];

const mockFeedback: Feedback[] = [];
const mockTemplates: PromptTemplate[] = [];

let briefIdCounter = 4;
let submissionIdCounter = 13;
let feedbackIdCounter = 1;
let influencerIdCounter = 2;

export class MockStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return {
      id: "demo-user-1",
      email: "admin@example.com",
      role: "admin",
      orgName: "Demo Organization",
      orgSlug: "demo-org",
      orgLogoUrl: null,
      orgWebsite: null,
      orgDescription: null,
      onboardingCompleted: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async getAllPublishedBriefs(): Promise<BriefWithOrg[]> {
    return mockBriefs
      .filter(b => b.status === "PUBLISHED")
      .map(brief => ({
        ...brief,
        organization: {
          name: brief.orgName,
          slug: "demo-org",
          logoUrl: null,
          website: null,
          description: null
        }
      }));
  }

  async getAllBriefs(): Promise<Brief[]> {
    return [...mockBriefs];
  }

  async getBriefBySlug(slug: string): Promise<BriefWithOrg | undefined> {
    const brief = mockBriefs.find(b => b.slug === slug);
    if (!brief) return undefined;
    
    return {
      ...brief,
      organization: {
        name: brief.orgName,
        slug: "demo-org",
        logoUrl: null,
        website: null,
        description: null
      }
    };
  }

  async getBriefById(id: number): Promise<Brief | undefined> {
    return mockBriefs.find(b => b.id === id);
  }

  async getBriefsByOwnerId(ownerId: string): Promise<Brief[]> {
    return mockBriefs.filter(b => b.ownerId === ownerId);
  }

  async createBrief(brief: InsertBrief): Promise<Brief> {
    const newBrief: Brief = {
      id: briefIdCounter++,
      ...brief,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockBriefs.push(newBrief);
    return newBrief;
  }

  async updateBriefStatus(id: number, status: string): Promise<Brief> {
    const brief = mockBriefs.find(b => b.id === id);
    if (!brief) throw new Error("Brief not found");
    
    brief.status = status as "DRAFT" | "PUBLISHED" | "ARCHIVED";
    brief.updatedAt = new Date();
    return brief;
  }

  async getSubmissionsByBriefId(briefId: number): Promise<Submission[]> {
    return mockSubmissions.filter(s => s.briefId === briefId);
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    return mockSubmissions.find(s => s.id === id);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const newSubmission: Submission = {
      id: submissionIdCounter++,
      ...submission,
      creatorId: null,
      creatorPhone: submission.creatorPhone || null,
      payoutAmount: null,
      payoutNotes: null,
      reviewedBy: null,
      reviewNotes: null,
      selectedAt: null,
      paidAt: null,
      submittedAt: new Date(),
      hasFeedback: 0,
      parentSubmissionId: null,
      submissionVersion: 1,
      allowsResubmission: 1
    };
    mockSubmissions.push(newSubmission);
    return newSubmission;
  }

  async updateSubmissionStatus(
    id: number, 
    status: string, 
    selectedAt?: Date,
    allowsResubmission?: boolean,
    reviewNotes?: string
  ): Promise<Submission> {
    const submission = mockSubmissions.find(s => s.id === id);
    if (!submission) throw new Error("Submission not found");
    
    submission.status = status as any;
    if (selectedAt) submission.selectedAt = selectedAt;
    if (allowsResubmission !== undefined) submission.allowsResubmission = allowsResubmission ? 1 : 0;
    if (reviewNotes) submission.reviewNotes = reviewNotes;
    
    return submission;
  }

  async updateSubmissionPayout(
    id: number,
    payoutStatus: string,
    paidAt?: Date,
    notes?: string
  ): Promise<Submission> {
    const submission = mockSubmissions.find(s => s.id === id);
    if (!submission) throw new Error("Submission not found");
    
    submission.payoutStatus = payoutStatus as any;
    if (paidAt) submission.paidAt = paidAt;
    if (notes) submission.payoutNotes = notes;
    
    return submission;
  }

  async countSubmissionsByCreatorEmail(briefId: number, email: string): Promise<number> {
    return mockSubmissions.filter(
      s => s.briefId === briefId && s.creatorEmail.toLowerCase() === email.toLowerCase()
    ).length;
  }

  async createFeedback(feedback: InsertFeedback): Promise<Feedback> {
    const newFeedback: Feedback = {
      id: feedbackIdCounter++,
      ...feedback,
      isRead: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockFeedback.push(newFeedback);
    return newFeedback;
  }

  async getFeedbackBySubmissionId(submissionId: number): Promise<Feedback[]> {
    return mockFeedback.filter(f => f.submissionId === submissionId);
  }

  async updateFeedback(id: number, comment: string): Promise<Feedback> {
    const feedback = mockFeedback.find(f => f.id === id);
    if (!feedback) throw new Error("Feedback not found");
    
    feedback.comment = comment;
    feedback.updatedAt = new Date();
    return feedback;
  }

  async deleteFeedback(id: number): Promise<void> {
    const index = mockFeedback.findIndex(f => f.id === id);
    if (index !== -1) mockFeedback.splice(index, 1);
  }

  async getTemplatesByOwnerId(ownerId: string): Promise<PromptTemplate[]> {
    return mockTemplates.filter(t => t.ownerId === ownerId);
  }

  async getTemplateById(id: number): Promise<PromptTemplate | undefined> {
    return mockTemplates.find(t => t.id === id);
  }

  async createTemplate(template: InsertPromptTemplate): Promise<PromptTemplate> {
    const newTemplate: PromptTemplate = {
      id: mockTemplates.length + 1,
      ...template,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockTemplates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: number, updates: Partial<InsertPromptTemplate>): Promise<PromptTemplate> {
    const template = mockTemplates.find(t => t.id === id);
    if (!template) throw new Error("Template not found");
    
    Object.assign(template, updates);
    template.updatedAt = new Date();
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    const index = mockTemplates.findIndex(t => t.id === id);
    if (index !== -1) mockTemplates.splice(index, 1);
  }

  async getInfluencerByEmail(email: string): Promise<Influencer | undefined> {
    return mockInfluencers.find(i => i.email.toLowerCase() === email.toLowerCase());
  }

  async getInfluencerById(id: number): Promise<Influencer | undefined> {
    return mockInfluencers.find(i => i.id === id);
  }

  async getInfluencersByStatus(status: string): Promise<Influencer[]> {
    return mockInfluencers.filter(i => i.status === status);
  }

  async getAllInfluencers(): Promise<Influencer[]> {
    return [...mockInfluencers];
  }

  async createInfluencer(influencer: InsertInfluencer): Promise<Influencer> {
    const newInfluencer: Influencer = {
      id: influencerIdCounter++,
      ...influencer,
      profileImageUrl: influencer.profileImageUrl || null,
      tiktokHandle: influencer.tiktokHandle || null,
      youtubeChannel: influencer.youtubeChannel || null,
      bankAccountHolderName: influencer.bankAccountHolderName || null,
      bankRoutingNumber: influencer.bankRoutingNumber || null,
      bankAccountNumber: influencer.bankAccountNumber || null,
      bankAccountType: influencer.bankAccountType || null,
      taxIdNumber: influencer.taxIdNumber || null,
      adminNotes: influencer.adminNotes || null,
      rejectionReason: influencer.rejectionReason || null,
      appliedAt: new Date(),
      approvedAt: null,
      rejectedAt: null,
      lastActiveAt: null,
      notificationPreferences: influencer.notificationPreferences || "all",
      preferredPaymentMethod: influencer.preferredPaymentMethod || "bank"
    };
    mockInfluencers.push(newInfluencer);
    return newInfluencer;
  }

  async updateInfluencerStatus(
    id: number,
    status: string,
    rejectionReason?: string
  ): Promise<Influencer> {
    const influencer = mockInfluencers.find(i => i.id === id);
    if (!influencer) throw new Error("Influencer not found");
    
    influencer.status = status;
    if (status === "approved") influencer.approvedAt = new Date();
    if (status === "rejected") {
      influencer.rejectedAt = new Date();
      if (rejectionReason) influencer.rejectionReason = rejectionReason;
    }
    
    return influencer;
  }

  async updateInfluencerActivity(id: number): Promise<void> {
    const influencer = mockInfluencers.find(i => i.id === id);
    if (influencer) influencer.lastActiveAt = new Date();
  }

  async getInfluencerSubmissions(email: string): Promise<Submission[]> {
    return mockSubmissions.filter(s => s.creatorEmail.toLowerCase() === email.toLowerCase());
  }
}