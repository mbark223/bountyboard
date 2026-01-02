import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, text, boolean, integer } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table with organization/brand details
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Organization/Brand details
  orgName: varchar("org_name"),
  orgSlug: varchar("org_slug").unique(),
  orgLogoUrl: text("org_logo_url"),
  orgWebsite: text("org_website"),
  orgDescription: text("org_description"),
  isOnboarded: boolean("is_onboarded").default(false),
  role: varchar("role").default("admin"), // 'admin' | 'reviewer'
  // New fields for extended user system
  userType: varchar("user_type").default("admin"), // 'admin' | 'reviewer' | 'influencer' | 'creator'
  influencerId: integer("influencer_id"), // references influencers.id for influencer accounts
  emailVerified: boolean("email_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Magic links table for passwordless authentication
export const magicLinks = pgTable("magic_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").unique().notNull(),
  userId: varchar("user_id").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MagicLink = typeof magicLinks.$inferSelect;
export type InsertMagicLink = typeof magicLinks.$inferInsert;
