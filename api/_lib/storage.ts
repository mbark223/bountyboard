import { 
  type User, 
  type Brief,
  type InsertBrief,
  type Submission,
  type InsertSubmission,
  type PromptTemplate,
  type InsertPromptTemplate,
  type Feedback,
  type InsertFeedback,
  users,
  briefs,
  submissions,
  promptTemplates,
  feedback
} from "../../shared/schema";
import { getDb } from "./db";
import { eq, desc } from "drizzle-orm";
import { DatabaseStorage } from "../../server/storage";

// Create a storage instance that uses the Vercel-compatible database connection
class VercelDatabaseStorage extends DatabaseStorage {
  private get db() {
    return getDb();
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllPublishedBriefs() {
    const results = await this.db
      .select({
        brief: briefs,
        user: users,
      })
      .from(briefs)
      .leftJoin(users, eq(briefs.ownerId, users.id))
      .where(eq(briefs.status, "PUBLISHED"))
      .orderBy(desc(briefs.createdAt));

    return results.map((r) => ({
      ...r.brief,
      organization: {
        name: r.user?.orgName || r.brief.orgName,
        slug: r.user?.orgSlug || null,
        logoUrl: r.user?.orgLogoUrl || null,
        website: r.user?.orgWebsite || null,
        description: r.user?.orgDescription || null,
      },
    }));
  }

  async getBriefBySlug(slug: string) {
    const results = await this.db
      .select({
        brief: briefs,
        user: users,
      })
      .from(briefs)
      .leftJoin(users, eq(briefs.ownerId, users.id))
      .where(eq(briefs.slug, slug));

    if (results.length === 0) return undefined;

    const r = results[0];
    return {
      ...r.brief,
      organization: {
        name: r.user?.orgName || r.brief.orgName,
        slug: r.user?.orgSlug || null,
        logoUrl: r.user?.orgLogoUrl || null,
        website: r.user?.orgWebsite || null,
        description: r.user?.orgDescription || null,
      },
    };
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const [brief] = await this.db
      .insert(briefs)
      .values(insertBrief)
      .returning();
    return brief;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await this.db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async countSubmissionsByCreatorEmail(briefId: number, email: string): Promise<number> {
    const results = await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.briefId, briefId));
    
    return results.filter(s => s.creatorEmail.toLowerCase() === email.toLowerCase()).length;
  }

  async getSubmissionsByBriefId(briefId: number): Promise<Submission[]> {
    return await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.briefId, briefId))
      .orderBy(desc(submissions.submittedAt));
  }

  async updateSubmissionStatus(id: number, status: string, selectedAt?: Date): Promise<Submission> {
    const updateData: any = { status };
    if (selectedAt) {
      updateData.selectedAt = selectedAt;
      if (status === "SELECTED") {
        updateData.payoutStatus = "PENDING";
      }
    }
    
    const [submission] = await this.db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async updateSubmissionPayout(id: number, payoutStatus: string, paidAt?: Date, notes?: string): Promise<Submission> {
    const updateData: any = { payoutStatus };
    if (paidAt) updateData.paidAt = paidAt;
    if (notes) updateData.payoutNotes = notes;
    
    const [submission] = await this.db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async getTemplatesByOwnerId(ownerId: string): Promise<PromptTemplate[]> {
    return await this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.ownerId, ownerId))
      .orderBy(desc(promptTemplates.updatedAt));
  }

  async getTemplateById(id: number): Promise<PromptTemplate | undefined> {
    const [template] = await this.db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertPromptTemplate): Promise<PromptTemplate> {
    const [created] = await this.db
      .insert(promptTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateTemplate(id: number, data: Partial<InsertPromptTemplate>): Promise<PromptTemplate> {
    const [updated] = await this.db
      .update(promptTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await this.db.delete(promptTemplates).where(eq(promptTemplates.id, id));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await this.db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    
    // Update submission to indicate it has feedback
    await this.db
      .update(submissions)
      .set({ hasFeedback: 1 })
      .where(eq(submissions.id, insertFeedback.submissionId));
    
    return newFeedback;
  }

  async getFeedbackBySubmissionId(submissionId: number): Promise<Feedback[]> {
    return await this.db
      .select()
      .from(feedback)
      .where(eq(feedback.submissionId, submissionId))
      .orderBy(desc(feedback.createdAt));
  }

  async updateFeedback(id: number, comment: string): Promise<Feedback> {
    const [updated] = await this.db
      .update(feedback)
      .set({ comment, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updated;
  }

  async deleteFeedback(id: number): Promise<void> {
    // Get the submission ID before deleting
    const [feedbackToDelete] = await this.db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id));
    
    if (feedbackToDelete) {
      await this.db.delete(feedback).where(eq(feedback.id, id));
      
      // Check if submission still has other feedback
      const remainingFeedback = await this.db
        .select()
        .from(feedback)
        .where(eq(feedback.submissionId, feedbackToDelete.submissionId));
      
      if (remainingFeedback.length === 0) {
        // No more feedback, update submission
        await this.db
          .update(submissions)
          .set({ hasFeedback: 0 })
          .where(eq(submissions.id, feedbackToDelete.submissionId));
      }
    }
  }

  async markFeedbackAsRead(submissionId: number): Promise<void> {
    await this.db
      .update(feedback)
      .set({ isRead: 1 })
      .where(eq(feedback.submissionId, submissionId));
  }
}

export const storage = new VercelDatabaseStorage();