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
    slug: "summer-vibes-campaign",
    title: "Summer Vibes Campaign 2025",
    orgName: "Glow Energy",
    businessLine: "Sportsbook",
    state: "Florida",
    overview: "We are looking for high-energy creators to showcase our new Summer Berry flavor.",
    requirements: ["Show product clearly", "Mention Zero Sugar", "Include #GlowSummer"],
    deliverableRatio: "9:16 (Vertical)",
    deliverableLength: "15-30 seconds",
    deliverableFormat: "MP4 / 1080p",
    rewardType: "CASH",
    rewardAmount: "500",
    rewardCurrency: "USD",
    rewardDescription: null,
    deadline: new Date("2025-07-15T23:59:00Z"),
    status: "PUBLISHED",
    password: null,
    maxWinners: 3,
    maxSubmissionsPerCreator: 3,
    ownerId: "demo-user-1",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const mockSubmissions: Submission[] = [
  {
    id: 1,
    briefId: 1,
    creatorId: null,
    creatorName: "Sarah Jenkins",
    creatorEmail: "sarah.j@example.com",
    creatorPhone: "+1 555-0101",
    creatorHandle: "@sarahcreates",
    creatorBettingAccount: "sarah_bets",
    message: "Love the new flavor! Perfect for summer vibes ☀️",
    videoUrl: "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&h=450&fit=crop",
    videoFileName: "sarah-summer.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 15728640,
    status: "SELECTED",
    payoutStatus: "PAID",
    payoutAmount: "500",
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
    message: "Great energy drink for my morning runs!",
    videoUrl: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&h=450&fit=crop",
    videoFileName: "mike-glow.mp4",
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
    message: "Zero sugar and tastes amazing!",
    videoUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&h=450&fit=crop",
    videoFileName: "jess-summer.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 20971520,
    status: "NOT_SELECTED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: "Good content but didn't show the product clearly in the first 3 seconds",
    selectedAt: null,
    paidAt: null,
    submittedAt: new Date(),
    hasFeedback: 1,
    parentSubmissionId: null,
    submissionVersion: 1,
    allowsResubmission: 1
  },
  // Add more submissions to reach 12 total
  {
    id: 4,
    briefId: 1,
    creatorId: null,
    creatorName: "Alex Rivera",
    creatorEmail: "alex.r@example.com",
    creatorPhone: null,
    creatorHandle: "@alexfitness",
    creatorBettingAccount: null,
    message: "Perfect pre-workout boost!",
    videoUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop",
    videoFileName: "alex-energy.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 18874368,
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
  {
    id: 5,
    briefId: 1,
    creatorId: null,
    creatorName: "Taylor Swift",
    creatorEmail: "taylor.s@example.com",
    creatorPhone: null,
    creatorHandle: "@tayloractive",
    creatorBettingAccount: null,
    message: "Loving the berry flavor!",
    videoUrl: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=450&fit=crop",
    videoFileName: "taylor-glow.mp4",
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
    briefId: 1,
    creatorId: null,
    creatorName: "Jordan Lee",
    creatorEmail: "jordan.l@example.com",
    creatorPhone: null,
    creatorHandle: "@jordanruns",
    creatorBettingAccount: null,
    message: "Zero sugar, all energy!",
    videoUrl: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=450&fit=crop",
    videoFileName: "jordan-summer.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 14680064,
    status: "SELECTED",
    payoutStatus: "PENDING",
    payoutAmount: "500",
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
    briefId: 1,
    creatorId: null,
    creatorName: "Casey Morgan",
    creatorEmail: "casey.m@example.com",
    creatorPhone: null,
    creatorHandle: "@caseyvibes",
    creatorBettingAccount: null,
    message: "Beach day essential!",
    videoUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&h=450&fit=crop",
    videoFileName: "casey-beach.mp4",
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
  {
    id: 8,
    briefId: 1,
    creatorId: null,
    creatorName: "Riley Cooper",
    creatorEmail: "riley.c@example.com",
    creatorPhone: null,
    creatorHandle: "@rileyoutdoors",
    creatorBettingAccount: null,
    message: "Perfect for hiking!",
    videoUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=450&fit=crop",
    videoFileName: "riley-energy.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 17825792,
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
    id: 9,
    briefId: 1,
    creatorId: null,
    creatorName: "Sam Williams",
    creatorEmail: "sam.w@example.com",
    creatorPhone: null,
    creatorHandle: "@samactive",
    creatorBettingAccount: null,
    message: "My new favorite drink!",
    videoUrl: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=450&fit=crop",
    videoFileName: "sam-glow.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 13631488,
    status: "NOT_SELECTED",
    payoutStatus: "NOT_APPLICABLE",
    payoutAmount: null,
    payoutNotes: null,
    reviewedBy: "demo-user-1",
    reviewNotes: "Video was too long (45 seconds)",
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
    briefId: 1,
    creatorId: null,
    creatorName: "Morgan Davis",
    creatorEmail: "morgan.d@example.com",
    creatorPhone: null,
    creatorHandle: "@morgansummer",
    creatorBettingAccount: null,
    message: "Refreshing and energizing!",
    videoUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=450&fit=crop",
    videoFileName: "morgan-beach.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 15728640,
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
  {
    id: 11,
    briefId: 1,
    creatorId: null,
    creatorName: "Blake Turner",
    creatorEmail: "blake.t@example.com",
    creatorPhone: null,
    creatorHandle: "@blakefit",
    creatorBettingAccount: null,
    message: "Game changer for workouts!",
    videoUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop",
    videoFileName: "blake-energy.mp4",
    videoMimeType: "video/mp4",
    videoSizeBytes: 21495808,
    status: "SELECTED",
    payoutStatus: "PENDING",
    payoutAmount: "500",
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
    briefId: 1,
    creatorId: null,
    creatorName: "Drew Johnson",
    creatorEmail: "drew.j@example.com",
    creatorPhone: null,
    creatorHandle: "@drewvibes",
    creatorBettingAccount: null,
    message: "Summer ready with Glow!",
    videoUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=450&fit=crop",
    videoFileName: "drew-summer.mp4",
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

let briefIdCounter = 2;
let submissionIdCounter = 2;
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