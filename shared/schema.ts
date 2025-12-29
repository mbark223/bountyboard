import { pgTable, text, serial, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Briefs table
export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  orgName: text("org_name").notNull(),
  overview: text("overview").notNull(),
  requirements: text("requirements").array().notNull(),
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
  ownerId: text("owner_id").notNull(), // references users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBriefSchema = createInsertSchema(briefs, {
  requirements: z.array(z.string().min(1)),
  rewardType: z.enum(["CASH", "BONUS_BETS", "OTHER"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissions, {
  status: z.enum(["RECEIVED", "IN_REVIEW", "SELECTED", "NOT_SELECTED"]).default("RECEIVED"),
  payoutStatus: z.enum(["NOT_APPLICABLE", "PENDING", "PAID"]).default("NOT_APPLICABLE"),
}).omit({
  id: true,
  submittedAt: true,
  selectedAt: true,
  paidAt: true,
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
