CREATE TABLE "brief_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"brief_id" integer NOT NULL,
	"influencer_id" integer NOT NULL,
	"assigned_by" text NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"viewed_at" timestamp,
	"status" text DEFAULT 'assigned' NOT NULL,
	CONSTRAINT "brief_assignments_brief_id_influencer_id_unique" UNIQUE("brief_id","influencer_id")
);
--> statement-breakpoint
CREATE TABLE "briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"org_name" text NOT NULL,
	"business_line" text DEFAULT 'Sportsbook' NOT NULL,
	"state" text DEFAULT 'Florida' NOT NULL,
	"overview" text NOT NULL,
	"requirements" text[] NOT NULL,
	"deliverable_ratio" text NOT NULL,
	"deliverable_length" text NOT NULL,
	"deliverable_format" text NOT NULL,
	"reward_type" text NOT NULL,
	"reward_amount" text NOT NULL,
	"reward_currency" text DEFAULT 'USD',
	"reward_description" text,
	"deadline" timestamp NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"password" text,
	"max_winners" integer DEFAULT 1,
	"max_submissions_per_creator" integer DEFAULT 3,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "briefs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"author_id" text NOT NULL,
	"author_name" text NOT NULL,
	"comment" text NOT NULL,
	"requires_action" integer DEFAULT 0,
	"is_read" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "influencer_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"invite_code" text NOT NULL,
	"invited_by" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"influencer_id" integer,
	CONSTRAINT "influencer_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "influencers" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"profile_image_url" text,
	"instagram_handle" text NOT NULL,
	"instagram_followers" integer,
	"instagram_verified" integer DEFAULT 0,
	"tiktok_handle" text,
	"youtube_channel" text,
	"bank_account_holder_name" text,
	"bank_routing_number" text,
	"bank_account_number" text,
	"bank_account_type" text,
	"tax_id_number" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"id_verified" integer DEFAULT 0,
	"bank_verified" integer DEFAULT 0,
	"admin_notes" text,
	"rejection_reason" text,
	"applied_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"rejected_at" timestamp,
	"last_active_at" timestamp,
	"notification_preferences" text DEFAULT 'all',
	"preferred_payment_method" text DEFAULT 'bank',
	CONSTRAINT "influencers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"name" text NOT NULL,
	"overview" text,
	"requirements" text[],
	"deliverable_ratio" text,
	"deliverable_length" text,
	"deliverable_format" text,
	"reward_type" text,
	"reward_amount" text,
	"reward_currency" text,
	"reward_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"brief_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"invited_by" text NOT NULL,
	"can_select" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"brief_id" integer NOT NULL,
	"creator_id" text,
	"creator_name" text NOT NULL,
	"creator_email" text NOT NULL,
	"creator_phone" text,
	"creator_handle" text NOT NULL,
	"creator_betting_account" text,
	"message" text,
	"video_url" text NOT NULL,
	"video_file_name" text NOT NULL,
	"video_mime_type" text NOT NULL,
	"video_size_bytes" integer NOT NULL,
	"status" text DEFAULT 'RECEIVED' NOT NULL,
	"payout_status" text DEFAULT 'NOT_APPLICABLE' NOT NULL,
	"payout_amount" numeric,
	"payout_notes" text,
	"reviewed_by" text,
	"review_notes" text,
	"selected_at" timestamp,
	"paid_at" timestamp,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"has_feedback" integer DEFAULT 0,
	"parent_submission_id" integer,
	"submission_version" integer DEFAULT 1,
	"allows_resubmission" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "magic_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"token" varchar NOT NULL,
	"user_id" varchar,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "magic_links_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"org_name" varchar,
	"org_slug" varchar,
	"org_logo_url" text,
	"org_website" text,
	"org_description" text,
	"is_onboarded" boolean DEFAULT false,
	"role" varchar DEFAULT 'admin',
	"user_type" varchar DEFAULT 'admin',
	"influencer_id" integer,
	"email_verified" boolean DEFAULT false,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_org_slug_unique" UNIQUE("org_slug")
);
--> statement-breakpoint
ALTER TABLE "brief_assignments" ADD CONSTRAINT "brief_assignments_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brief_assignments" ADD CONSTRAINT "brief_assignments_influencer_id_influencers_id_fk" FOREIGN KEY ("influencer_id") REFERENCES "public"."influencers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviewers" ADD CONSTRAINT "reviewers_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_brief_id_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."briefs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "magic_links" ADD CONSTRAINT "magic_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_brief_assignments_brief_id" ON "brief_assignments" USING btree ("brief_id");--> statement-breakpoint
CREATE INDEX "idx_brief_assignments_influencer_id" ON "brief_assignments" USING btree ("influencer_id");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");