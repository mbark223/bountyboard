ALTER TABLE "briefs" ADD COLUMN "requester" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "responsible" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "priority" text DEFAULT 'Medium';--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "final_deliverable" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "campaign_topic" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "platforms" text[];--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "creators_needed" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "air_inc_campaign_id" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "air_inc_sync_status" text;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "air_inc_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "briefs" ADD COLUMN "air_inc_sync_error" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "finance_approval_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "finance_approved_by" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "finance_approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "finance_approval_notes" text;