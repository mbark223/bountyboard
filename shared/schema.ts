import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
  rewardAmount: text("reward_amount").notNull(), // store as text to handle both numbers and strings
  rewardCurrency: text("reward_currency").default("USD"),
  rewardDescription: text("reward_description"),
  deadline: timestamp("deadline").notNull(),
  status: text("status").notNull().default("DRAFT"), // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
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
  creatorName: text("creator_name").notNull(),
  creatorEmail: text("creator_email").notNull(),
  creatorHandle: text("creator_handle").notNull(),
  message: text("message"),
  videoUrl: text("video_url").notNull(),
  videoFileName: text("video_file_name").notNull(),
  videoMimeType: text("video_mime_type").notNull(),
  videoSizeBytes: integer("video_size_bytes").notNull(),
  status: text("status").notNull().default("RECEIVED"), // 'RECEIVED' | 'IN_REVIEW' | 'SELECTED' | 'NOT_SELECTED'
  payoutStatus: text("payout_status").notNull().default("NOT_APPLICABLE"), // 'NOT_APPLICABLE' | 'PENDING' | 'PAID'
  payoutAmount: decimal("payout_amount"),
  payoutNotes: text("payout_notes"),
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
