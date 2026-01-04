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
  type Influencer,
  type InsertInfluencer,
  type InfluencerInvite,
  type InsertInfluencerInvite,
  users,
  briefs,
  submissions,
  promptTemplates,
  feedback,
  influencers,
  influencerInvites
} from "../../shared/schema";
import { getDb } from "./db";
import { eq, desc } from "drizzle-orm";
import { DatabaseStorage } from "../../server/storage";

// Create a storage instance that uses the Vercel-compatible database connection
class VercelDatabaseStorage extends DatabaseStorage {
  private get db() {
    try {
      return getDb();
    } catch (error) {
      console.error("Database connection error:", error);
      throw new Error("Database service unavailable. Please check configuration.");
    }
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
    // First try to find by slug
    let results = await this.db
      .select({
        brief: briefs,
        user: users,
      })
      .from(briefs)
      .leftJoin(users, eq(briefs.ownerId, users.id))
      .where(eq(briefs.slug, slug));

    // If not found and slug looks like "brief-123", try to find by ID
    if (results.length === 0 && slug.startsWith('brief-')) {
      const id = parseInt(slug.replace('brief-', ''));
      if (!isNaN(id)) {
        results = await this.db
          .select({
            brief: briefs,
            user: users,
          })
          .from(briefs)
          .leftJoin(users, eq(briefs.ownerId, users.id))
          .where(eq(briefs.id, id));
      }
    }

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

  async getBriefById(id: number): Promise<Brief | undefined> {
    const [brief] = await this.db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id));
    return brief || undefined;
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

  async updateSubmissionStatus(id: number, status: string, selectedAt?: Date, allowsResubmission?: boolean, reviewNotes?: string): Promise<Submission> {
    const updateData: any = { status };
    if (selectedAt) {
      updateData.selectedAt = selectedAt;
      if (status === "SELECTED") {
        updateData.payoutStatus = "PENDING";
      }
    }
    // If rejecting, set whether resubmission is allowed
    if (status === "NOT_SELECTED" && allowsResubmission !== undefined) {
      updateData.allowsResubmission = allowsResubmission ? 1 : 0;
    }
    
    // Add review notes if provided
    if (reviewNotes !== undefined) {
      updateData.reviewNotes = reviewNotes;
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

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return submission || undefined;
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

  async getSubmissionWithVersions(submissionId: number): Promise<{ submission: Submission | undefined, versions: Submission[] }> {
    const submission = await this.getSubmissionById(submissionId);
    if (!submission) return { submission: undefined, versions: [] };

    // Get the root submission ID (either parent or current if it's the original)
    const rootId = submission.parentSubmissionId || submission.id;
    
    // Get all versions
    const versions = await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.id, rootId))
      .union(
        this.db
          .select()
          .from(submissions)
          .where(eq(submissions.parentSubmissionId, rootId))
      )
      .orderBy(desc(submissions.submissionVersion));

    return { submission, versions };
  }

  async getLatestSubmissionByEmail(briefId: number, email: string): Promise<Submission | undefined> {
    const results = await this.db
      .select()
      .from(submissions)
      .where(eq(submissions.briefId, briefId))
      .orderBy(desc(submissions.submissionVersion));
    
    // Find the latest version for this email
    const emailSubmissions = results.filter(s => s.creatorEmail.toLowerCase() === email.toLowerCase());
    return emailSubmissions[0] || undefined;
  }

  async createResubmission(originalSubmission: Submission, newSubmissionData: Partial<InsertSubmission>): Promise<Submission> {
    const rootId = originalSubmission.parentSubmissionId || originalSubmission.id;
    const newVersion = (originalSubmission.submissionVersion || 1) + 1;
    
    const resubmissionData = {
      ...newSubmissionData,
      briefId: originalSubmission.briefId,
      creatorId: originalSubmission.creatorId,
      creatorName: originalSubmission.creatorName,
      creatorEmail: originalSubmission.creatorEmail,
      creatorPhone: originalSubmission.creatorPhone,
      creatorHandle: originalSubmission.creatorHandle,
      creatorBettingAccount: originalSubmission.creatorBettingAccount,
      parentSubmissionId: rootId,
      submissionVersion: newVersion,
      status: "RECEIVED" as const,
      payoutStatus: "NOT_APPLICABLE" as const,
    };

    return await this.createSubmission(resubmissionData as InsertSubmission);
  }

  // Influencer methods
  async createInfluencer(data: InsertInfluencer): Promise<Influencer> {
    const [influencer] = await this.db
      .insert(influencers)
      .values(data)
      .returning();
    return influencer;
  }

  async getInfluencerById(id: number): Promise<Influencer | undefined> {
    const [influencer] = await this.db
      .select()
      .from(influencers)
      .where(eq(influencers.id, id));
    return influencer || undefined;
  }

  async getInfluencerByEmail(email: string): Promise<Influencer | undefined> {
    const [influencer] = await this.db
      .select()
      .from(influencers)
      .where(eq(influencers.email, email));
    return influencer || undefined;
  }

  async getAllInfluencers(status?: string): Promise<Influencer[]> {
    if (status) {
      return await this.db
        .select()
        .from(influencers)
        .where(eq(influencers.status, status))
        .orderBy(desc(influencers.appliedAt));
    }
    return await this.db
      .select()
      .from(influencers)
      .orderBy(desc(influencers.appliedAt));
  }

  async updateInfluencerStatus(id: number, status: string, notes?: string): Promise<Influencer> {
    const updateData: any = { status };
    const now = new Date();
    
    if (status === "approved") {
      updateData.approvedAt = now;
    } else if (status === "rejected") {
      updateData.rejectedAt = now;
      if (notes) updateData.rejectionReason = notes;
    }
    
    if (notes && status !== "rejected") {
      updateData.adminNotes = notes;
    }
    
    const [influencer] = await this.db
      .update(influencers)
      .set(updateData)
      .where(eq(influencers.id, id))
      .returning();
    return influencer;
  }

  async updateInfluencer(id: number, data: Partial<InsertInfluencer>): Promise<Influencer> {
    const [influencer] = await this.db
      .update(influencers)
      .set(data)
      .where(eq(influencers.id, id))
      .returning();
    return influencer;
  }

  // Invite methods
  async createInfluencerInvite(data: InsertInfluencerInvite): Promise<InfluencerInvite> {
    const [invite] = await this.db
      .insert(influencerInvites)
      .values(data)
      .returning();
    return invite;
  }

  async getInviteByCode(inviteCode: string): Promise<InfluencerInvite | undefined> {
    const [invite] = await this.db
      .select()
      .from(influencerInvites)
      .where(eq(influencerInvites.inviteCode, inviteCode));
    return invite || undefined;
  }

  async getInvitesByCreator(invitedBy: string): Promise<InfluencerInvite[]> {
    return await this.db
      .select()
      .from(influencerInvites)
      .where(eq(influencerInvites.invitedBy, invitedBy))
      .orderBy(desc(influencerInvites.createdAt));
  }

  async acceptInvite(inviteCode: string, influencerId: number): Promise<InfluencerInvite> {
    const [invite] = await this.db
      .update(influencerInvites)
      .set({ 
        status: "accepted", 
        acceptedAt: new Date(),
        influencerId 
      })
      .where(eq(influencerInvites.inviteCode, inviteCode))
      .returning();
    return invite;
  }

  async expireInvite(id: number): Promise<InfluencerInvite> {
    const [invite] = await this.db
      .update(influencerInvites)
      .set({ status: "expired" })
      .where(eq(influencerInvites.id, id))
      .returning();
    return invite;
  }
}

// Create a wrapped storage instance with error handling
class SafeStorage {
  private storage = new VercelDatabaseStorage();

  async getAllPublishedBriefs() {
    try {
      console.log("[SafeStorage] Getting all published briefs...");
      const briefs = await this.storage.getAllPublishedBriefs();
      console.log(`[SafeStorage] Found ${briefs.length} published briefs`);
      return briefs;
    } catch (error) {
      console.error("[SafeStorage] Error getting published briefs:", error);
      if (!process.env.DATABASE_URL) {
        console.error("[SafeStorage] DATABASE_URL is not set in environment");
        throw new Error("Database configuration missing. Please set DATABASE_URL in Vercel environment variables.");
      }
      throw error;
    }
  }

  async getAllBriefs() {
    try {
      console.log("[SafeStorage] Getting all briefs...");
      const briefs = await this.storage.getAllBriefs();
      console.log(`[SafeStorage] Found ${briefs.length} briefs`);
      return briefs;
    } catch (error) {
      console.error("[SafeStorage] Error getting all briefs:", error);
      if (!process.env.DATABASE_URL) {
        console.error("[SafeStorage] DATABASE_URL is not set in environment");
        throw new Error("Database configuration missing. Please set DATABASE_URL in Vercel environment variables.");
      }
      throw error;
    }
  }

  // Delegate all other methods to the original storage
  async getUser(id: string) { return this.storage.getUser(id); }
  async getUserByEmail(email: string) { return this.storage.getUserByEmail(email); }
  async createUser(user: any) { return this.storage.createUser(user); }
  async updateUser(id: string, updates: any) { return this.storage.updateUser(id, updates); }
  async getBriefBySlug(slug: string) { return this.storage.getBriefBySlug(slug); }
  async getBriefById(id: number) { return this.storage.getBriefById(id); }
  async getBriefsByOwnerId(ownerId: string) { return this.storage.getBriefsByOwnerId(ownerId); }
  async createBrief(brief: any) { return this.storage.createBrief(brief); }
  async updateBriefStatus(id: number, status: string) { return this.storage.updateBriefStatus(id, status); }
  async getSubmissionsByBriefId(briefId: number) { return this.storage.getSubmissionsByBriefId(briefId); }
  async getSubmissionById(id: number) { return this.storage.getSubmissionById(id); }
  async createSubmission(submission: any) { return this.storage.createSubmission(submission); }
  async updateSubmissionStatus(id: number, status: string, selectedAt?: Date, allowsResubmission?: boolean, reviewNotes?: string) { 
    return this.storage.updateSubmissionStatus(id, status, selectedAt, allowsResubmission, reviewNotes); 
  }
  async updateSubmissionPayout(id: number, payoutStatus: string, paidAt?: Date, notes?: string) { 
    return this.storage.updateSubmissionPayout(id, payoutStatus, paidAt, notes); 
  }
  async countSubmissionsByCreatorEmail(briefId: number, email: string) { return this.storage.countSubmissionsByCreatorEmail(briefId, email); }
  async createFeedback(feedback: any) { return this.storage.createFeedback(feedback); }
  async getFeedbackBySubmissionId(submissionId: number) { return this.storage.getFeedbackBySubmissionId(submissionId); }
  async updateFeedback(id: number, comment: string) { return this.storage.updateFeedback(id, comment); }
  async deleteFeedback(id: number) { return this.storage.deleteFeedback(id); }
  async getTemplatesByOwnerId(ownerId: string) { return this.storage.getTemplatesByOwnerId(ownerId); }
  async getTemplateById(id: number) { return this.storage.getTemplateById(id); }
  async createTemplate(template: any) { return this.storage.createTemplate(template); }
  async updateTemplate(id: number, updates: any) { return this.storage.updateTemplate(id, updates); }
  async deleteTemplate(id: number) { return this.storage.deleteTemplate(id); }
  async getInfluencerByEmail(email: string) { return this.storage.getInfluencerByEmail(email); }
  async getInfluencerById(id: number) { return this.storage.getInfluencerById(id); }
  async getInfluencersByStatus(status: string) { return this.storage.getInfluencersByStatus(status); }
  async getAllInfluencers() { return this.storage.getAllInfluencers(); }
  async createInfluencer(influencer: any) { return this.storage.createInfluencer(influencer); }
  async updateInfluencerStatus(id: number, status: string, rejectionReason?: string) { 
    return this.storage.updateInfluencerStatus(id, status, rejectionReason); 
  }
  async updateInfluencerActivity(id: number) { return this.storage.updateInfluencerActivity(id); }
  async getInfluencerSubmissions(email: string) { return this.storage.getInfluencerSubmissions(email); }
  async getInfluencerInviteByEmail(email: string) { return this.storage.getInfluencerInviteByEmail(email); }
  async createInfluencerInvite(invite: any) { return this.storage.createInfluencerInvite(invite); }
  async updateInfluencerInviteStatus(id: number, status: string) { return this.storage.updateInfluencerInviteStatus(id, status); }
  async getAllInfluencerInvites() { return this.storage.getAllInfluencerInvites(); }
}

export const storage = new SafeStorage();