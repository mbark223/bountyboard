import { pgTable, text, serial, timestamp, integer, decimal, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth.js";

// Business lines and states for filtering
export const BUSINESS_LINES = ["PMR", "Casino", "Sportsbook"] as const;
export const STATES = ["Florida", "New Jersey", "Michigan"] as const;

// Briefs table
export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  orgName: text("org_name").notNull(),
  businessLine: text("business_line").notNull().default("Sportsbook"), // 'PMR' | 'Casino' | 'Sportsbook'
  state: text("state").notNull().default("Florida"), // 'Florida' | 'New Jersey' | 'Michigan'
  overview: text("overview").notNull(),
  requirements: text("requirements").array().notNull(),
  dos: text("dos").array(),
  donts: text("donts").array(),
  deliverableRatio: text("deliverable_ratio").notNull(),
  deliverableLength: text("deliverable_length").notNull(),
  deliverableFormat: text("deliverable_format").notNull(),
  rewardType: text("reward_type").notNull(), // 'CASH' | 'BONUS_BETS' | 'OTHER'
  rewardAmount: text("reward_amount").notNull(),
  rewardCurrency: text("reward_currency").default("USD"),
  rewardDescription: text("reward_description"),
  deadline: timestamp("deadline").notNull(),
  status: text("status").notNull().default("DRAFT"), // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  password: text("password"), // optional password protection
  maxWinners: integer("max_winners").default(1),
  maxSubmissionsPerCreator: integer("max_submissions_per_creator").default(3),

  // NEW PROJECT MANAGEMENT FIELDS
  requester: text("requester"),
  responsible: text("responsible"),
  priority: text("priority").default("Medium"), // 'Low' | 'Medium' | 'High'
  finalDeliverable: text("final_deliverable"),
  campaignTopic: text("campaign_topic"),
  platforms: text("platforms").array(), // ['Instagram', 'TikTok', 'YouTube', etc.]
  creatorsNeeded: integer("creators_needed").default(1),

  // AIR.INC INTEGRATION
  airIncCampaignId: text("air_inc_campaign_id"), // ID from air.inc
  airIncSyncStatus: text("air_inc_sync_status"), // 'pending' | 'synced' | 'failed'
  airIncSyncedAt: timestamp("air_inc_synced_at"),
  airIncSyncError: text("air_inc_sync_error"),

  ownerId: text("owner_id").notNull(), // references users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBriefSchema = createInsertSchema(briefs, {
  requirements: z.array(z.string().min(1)),
  dos: z.array(z.string()).optional(),
  donts: z.array(z.string()).optional(),
  rewardType: z.enum(["CASH", "BONUS_BETS", "OTHER"]),
  businessLine: z.enum(["PMR", "Casino", "Sportsbook"]).default("Sportsbook"),
  state: z.enum(["Florida", "New Jersey", "Michigan"]).default("Florida"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  platforms: z.array(z.string()).optional(),
  airIncSyncStatus: z.enum(["pending", "synced", "failed"]).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  airIncSyncedAt: true,
});

export const selectBriefSchema = createSelectSchema(briefs);
export type InsertBrief = z.infer<typeof insertBriefSchema>;
export type Brief = typeof briefs.$inferSelect;

// Submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id),
  creatorId: text("creator_id"), // optional - links to users.id if creator is registered
  creatorName: text("creator_name").notNull(),
  creatorEmail: text("creator_email").notNull(),
  creatorPhone: text("creator_phone"),
  creatorHandle: text("creator_handle").notNull(), // Instagram handle
  creatorBettingAccount: text("creator_betting_account"), // Hard Rock Bet account username
  message: text("message"),
  videoUrl: text("video_url").notNull(),
  videoFileName: text("video_file_name").notNull(),
  videoMimeType: text("video_mime_type").notNull(),
  videoSizeBytes: integer("video_size_bytes").notNull(),
  status: text("status").notNull().default("RECEIVED"), // 'RECEIVED' | 'IN_REVIEW' | 'SELECTED' | 'NOT_SELECTED'
  payoutStatus: text("payout_status").notNull().default("NOT_APPLICABLE"), // 'NOT_APPLICABLE' | 'PENDING' | 'PAID'
  payoutAmount: decimal("payout_amount"),
  payoutNotes: text("payout_notes"),
  reviewedBy: text("reviewed_by"), // references users.id
  reviewNotes: text("review_notes"),
  selectedAt: timestamp("selected_at"),
  paidAt: timestamp("paid_at"),

  // FINANCE APPROVAL WORKFLOW
  financeApprovalStatus: text("finance_approval_status").default("pending"), // 'pending' | 'approved' | 'rejected'
  financeApprovedBy: text("finance_approved_by"), // references users.id
  financeApprovedAt: timestamp("finance_approved_at"),
  financeApprovalNotes: text("finance_approval_notes"),

  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  hasFeedback: integer("has_feedback").default(0), // 0 = false, 1 = true
  parentSubmissionId: integer("parent_submission_id"), // references submissions.id for resubmissions
  submissionVersion: integer("submission_version").default(1), // Version number (1, 2, 3, etc.)
  allowsResubmission: integer("allows_resubmission").default(1), // 0 = no, 1 = yes - set when rejected
});

export const insertSubmissionSchema = createInsertSchema(submissions, {
  status: z.enum(["RECEIVED", "IN_REVIEW", "SELECTED", "NOT_SELECTED"]).default("RECEIVED"),
  payoutStatus: z.enum(["NOT_APPLICABLE", "PENDING", "PAID"]).default("NOT_APPLICABLE"),
  financeApprovalStatus: z.enum(["pending", "approved", "rejected"]).default("pending"),
}).omit({
  id: true,
  submittedAt: true,
  selectedAt: true,
  paidAt: true,
  financeApprovedAt: true,
});

export const selectSubmissionSchema = createSelectSchema(submissions);
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Reviewers table - admins can invite other reviewers
export const reviewers = pgTable("reviewers", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id),
  userId: text("user_id").notNull(), // references users.id
  invitedBy: text("invited_by").notNull(), // references users.id
  canSelect: integer("can_select").default(1), // 1 = can select winners, 0 = view only
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewerSchema = createInsertSchema(reviewers).omit({
  id: true,
  createdAt: true,
});
export type InsertReviewer = z.infer<typeof insertReviewerSchema>;
export type Reviewer = typeof reviewers.$inferSelect;

// Saved prompt templates for quick brief creation
export const promptTemplates = pgTable("prompt_templates", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull(),
  overview: text("overview"),
  requirements: text("requirements").array(),
  deliverableRatio: text("deliverable_ratio"),
  deliverableLength: text("deliverable_length"),
  deliverableFormat: text("deliverable_format"),
  rewardType: text("reward_type"),
  rewardAmount: text("reward_amount"),
  rewardCurrency: text("reward_currency"),
  rewardDescription: text("reward_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPromptTemplateSchema = createInsertSchema(promptTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPromptTemplate = z.infer<typeof insertPromptTemplateSchema>;
export type PromptTemplate = typeof promptTemplates.$inferSelect;

// Feedback table for submission feedback
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id").notNull().references(() => submissions.id),
  authorId: text("author_id").notNull(), // references users.id
  authorName: text("author_name").notNull(), // denormalized for display
  comment: text("comment").notNull(),
  requiresAction: integer("requires_action").default(0), // 0 = informational, 1 = requires action
  isRead: integer("is_read").default(0), // 0 = unread, 1 = read by creator
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  isRead: true,
  createdAt: true,
  updatedAt: true,
});
export const selectFeedbackSchema = createSelectSchema(feedback);
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

// Influencers table for vetted content creators
export const influencers = pgTable("influencers", {
  id: serial("id").primaryKey(),
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  
  // Social Media
  instagramHandle: text("instagram_handle").notNull(),
  instagramFollowers: integer("instagram_followers"),
  instagramVerified: integer("instagram_verified").default(0), // 0 = not verified, 1 = verified
  tiktokHandle: text("tiktok_handle"),
  youtubeChannel: text("youtube_channel"),
  
  // Banking Information (encrypted in production)
  bankAccountHolderName: text("bank_account_holder_name"),
  bankRoutingNumber: text("bank_routing_number"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountType: text("bank_account_type"), // 'checking' | 'savings'
  taxIdNumber: text("tax_id_number"), // SSN or EIN
  
  // Status & Verification
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected' | 'suspended'
  idVerified: integer("id_verified").default(0), // 0 = not verified, 1 = verified
  bankVerified: integer("bank_verified").default(0), // 0 = not verified, 1 = verified
  
  // Admin Notes
  adminNotes: text("admin_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Timestamps
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  lastActiveAt: timestamp("last_active_at"),
  
  // Settings
  notificationPreferences: text("notification_preferences").default("all"), // 'all' | 'important' | 'none'
  preferredPaymentMethod: text("preferred_payment_method").default("bank"), // 'bank' | 'paypal' | 'venmo'
});

export const insertInfluencerSchema = createInsertSchema(influencers, {
  email: z.string().email(),
  instagramHandle: z.string().regex(/^@?[\w.]+$/, "Invalid Instagram handle"),
  status: z.enum(["pending", "approved", "rejected", "suspended"]).default("pending"),
  bankAccountType: z.enum(["checking", "savings"]).optional(),
  notificationPreferences: z.enum(["all", "important", "none"]).default("all"),
  preferredPaymentMethod: z.enum(["bank", "paypal", "venmo"]).default("bank"),
}).omit({
  id: true,
  appliedAt: true,
  approvedAt: true,
  rejectedAt: true,
  lastActiveAt: true,
});
export const selectInfluencerSchema = createSelectSchema(influencers);
export type InsertInfluencer = z.infer<typeof insertInfluencerSchema>;
export type Influencer = typeof influencers.$inferSelect;

// Influencer invites table
export const influencerInvites = pgTable("influencer_invites", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  invitedBy: text("invited_by").notNull(), // references users.id
  
  // Invitation details
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'expired'
  message: text("message"), // Optional personalized message
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  
  // Link to influencer after acceptance
  influencerId: integer("influencer_id"), // references influencers.id after acceptance
});

export const insertInfluencerInviteSchema = createInsertSchema(influencerInvites, {
  email: z.string().email(),
  inviteCode: z.string().min(8),
  status: z.enum(["pending", "accepted", "expired"]).default("pending"),
}).omit({
  id: true,
  createdAt: true,
  acceptedAt: true,
  influencerId: true,
});
export const selectInfluencerInviteSchema = createSelectSchema(influencerInvites);
export type InsertInfluencerInvite = z.infer<typeof insertInfluencerInviteSchema>;
export type InfluencerInvite = typeof influencerInvites.$inferSelect;

// Brief assignments table - many-to-many relationship between briefs and influencers
export const briefAssignments = pgTable("brief_assignments", {
  id: serial("id").primaryKey(),
  briefId: integer("brief_id").notNull().references(() => briefs.id, { onDelete: 'cascade' }),
  influencerId: integer("influencer_id").notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  assignedBy: text("assigned_by").notNull(), // references users.id
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  viewedAt: timestamp("viewed_at"),
  status: text("status").notNull().default("assigned"), // 'assigned' | 'viewed' | 'submitted'
}, (table) => {
  return {
    uniqueBriefInfluencer: unique().on(table.briefId, table.influencerId),
    briefIdIdx: index("idx_brief_assignments_brief_id").on(table.briefId),
    influencerIdIdx: index("idx_brief_assignments_influencer_id").on(table.influencerId),
  };
});

export const insertBriefAssignmentSchema = createInsertSchema(briefAssignments, {
  status: z.enum(["assigned", "viewed", "submitted"]).default("assigned"),
}).omit({
  id: true,
  assignedAt: true,
  viewedAt: true,
});
export const selectBriefAssignmentSchema = createSelectSchema(briefAssignments);
export type InsertBriefAssignment = z.infer<typeof insertBriefAssignmentSchema>;
export type BriefAssignment = typeof briefAssignments.$inferSelect;
