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
  users,
  briefs,
  submissions,
  promptTemplates,
  feedback,
  influencers
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface BriefWithOrg extends Brief {
  organization: {
    name: string;
    slug: string | null;
    logoUrl: string | null;
    website: string | null;
    description: string | null;
  };
}

export type {
  User,
  Brief,
  InsertBrief,
  Submission,
  InsertSubmission,
  PromptTemplate,
  InsertPromptTemplate,
  Feedback,
  InsertFeedback,
  Influencer,
  InsertInfluencer
};

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  
  getAllPublishedBriefs(): Promise<BriefWithOrg[]>;
  getAllBriefs(): Promise<Brief[]>;
  getBriefBySlug(slug: string): Promise<BriefWithOrg | undefined>;
  getBriefById(id: number): Promise<Brief | undefined>;
  getBriefsByOwnerId(ownerId: string): Promise<Brief[]>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBriefStatus(id: number, status: string): Promise<Brief>;
  
  getSubmissionsByBriefId(briefId: number): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionStatus(id: number, status: string, selectedAt?: Date, allowsResubmission?: boolean, reviewNotes?: string): Promise<Submission>;
  updateSubmissionPayout(id: number, payoutStatus: string, paidAt?: Date, notes?: string): Promise<Submission>;
  countSubmissionsByCreatorEmail(briefId: number, email: string): Promise<number>;
  
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackBySubmissionId(submissionId: number): Promise<Feedback[]>;
  updateFeedback(id: number, comment: string): Promise<Feedback>;
  deleteFeedback(id: number): Promise<void>;
  
  getTemplatesByOwnerId(ownerId: string): Promise<PromptTemplate[]>;
  getTemplateById(id: number): Promise<PromptTemplate | undefined>;
  createTemplate(template: InsertPromptTemplate): Promise<PromptTemplate>;
  updateTemplate(id: number, updates: Partial<InsertPromptTemplate>): Promise<PromptTemplate>;
  deleteTemplate(id: number): Promise<void>;
  
  getInfluencerByEmail(email: string): Promise<Influencer | undefined>;
  getInfluencerById(id: number): Promise<Influencer | undefined>;
  getInfluencersByStatus(status: string): Promise<Influencer[]>;
  getAllInfluencers(): Promise<Influencer[]>;
  createInfluencer(influencer: InsertInfluencer): Promise<Influencer>;
  updateInfluencerStatus(id: number, status: string, rejectionReason?: string): Promise<Influencer>;
  updateInfluencerActivity(id: number): Promise<void>;
  getInfluencerSubmissions(email: string): Promise<Submission[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllPublishedBriefs(): Promise<BriefWithOrg[]> {
    const results = await db
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

  async getAllBriefs(): Promise<Brief[]> {
    return await db
      .select()
      .from(briefs)
      .orderBy(desc(briefs.createdAt));
  }

  async getBriefBySlug(slug: string): Promise<BriefWithOrg | undefined> {
    // First try to find by slug
    let results = await db
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
        results = await db
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
    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id));
    return brief || undefined;
  }

  async getBriefsByOwnerId(ownerId: string): Promise<Brief[]> {
    return await db
      .select()
      .from(briefs)
      .where(eq(briefs.ownerId, ownerId))
      .orderBy(desc(briefs.createdAt));
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const [brief] = await db
      .insert(briefs)
      .values(insertBrief)
      .returning();
    return brief;
  }

  async updateBriefStatus(id: number, status: string): Promise<Brief> {
    const [brief] = await db
      .update(briefs)
      .set({ status, updatedAt: new Date() })
      .where(eq(briefs.id, id))
      .returning();
    return brief;
  }

  async getSubmissionsByBriefId(briefId: number): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.briefId, briefId))
      .orderBy(desc(submissions.submittedAt));
  }

  async getSubmissionById(id: number): Promise<Submission | undefined> {
    const [submission] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, id));
    return submission || undefined;
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db
      .insert(submissions)
      .values(insertSubmission)
      .returning();
    return submission;
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
    
    const [submission] = await db
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
    
    const [submission] = await db
      .update(submissions)
      .set(updateData)
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }

  async countSubmissionsByCreatorEmail(briefId: number, email: string): Promise<number> {
    const results = await db
      .select()
      .from(submissions)
      .where(eq(submissions.briefId, briefId));
    
    return results.filter(s => s.creatorEmail.toLowerCase() === email.toLowerCase()).length;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [fb] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return fb;
  }

  async getFeedbackBySubmissionId(submissionId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.submissionId, submissionId))
      .orderBy(desc(feedback.createdAt));
  }

  async updateFeedback(id: number, comment: string): Promise<Feedback> {
    const [fb] = await db
      .update(feedback)
      .set({ comment, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return fb;
  }

  async deleteFeedback(id: number): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id));
  }

  async getTemplatesByOwnerId(ownerId: string): Promise<PromptTemplate[]> {
    return await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.ownerId, ownerId))
      .orderBy(desc(promptTemplates.updatedAt));
  }

  async getTemplateById(id: number): Promise<PromptTemplate | undefined> {
    const [template] = await db
      .select()
      .from(promptTemplates)
      .where(eq(promptTemplates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertPromptTemplate): Promise<PromptTemplate> {
    const [created] = await db
      .insert(promptTemplates)
      .values(template)
      .returning();
    return created;
  }

  async updateTemplate(id: number, data: Partial<InsertPromptTemplate>): Promise<PromptTemplate> {
    const [updated] = await db
      .update(promptTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(promptTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(promptTemplates).where(eq(promptTemplates.id, id));
  }

  async getInfluencerByEmail(email: string): Promise<Influencer | undefined> {
    const [influencer] = await db
      .select()
      .from(influencers)
      .where(eq(influencers.email, email));
    return influencer || undefined;
  }

  async getInfluencerById(id: number): Promise<Influencer | undefined> {
    const [influencer] = await db
      .select()
      .from(influencers)
      .where(eq(influencers.id, id));
    return influencer || undefined;
  }

  async getInfluencersByStatus(status: string): Promise<Influencer[]> {
    return await db
      .select()
      .from(influencers)
      .where(eq(influencers.status, status))
      .orderBy(desc(influencers.appliedAt));
  }

  async getAllInfluencers(): Promise<Influencer[]> {
    return await db
      .select()
      .from(influencers)
      .orderBy(desc(influencers.appliedAt));
  }

  async createInfluencer(insertInfluencer: InsertInfluencer): Promise<Influencer> {
    const [influencer] = await db
      .insert(influencers)
      .values(insertInfluencer)
      .returning();
    return influencer;
  }

  async updateInfluencerStatus(id: number, status: string, rejectionReason?: string): Promise<Influencer> {
    const updateData: any = { status };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date();
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }
    
    const [influencer] = await db
      .update(influencers)
      .set(updateData)
      .where(eq(influencers.id, id))
      .returning();
    return influencer;
  }

  async updateInfluencerActivity(id: number): Promise<void> {
    await db
      .update(influencers)
      .set({ lastActiveAt: new Date() })
      .where(eq(influencers.id, id));
  }

  async getInfluencerSubmissions(email: string): Promise<Submission[]> {
    return await db
      .select()
      .from(submissions)
      .where(eq(submissions.creatorEmail, email))
      .orderBy(desc(submissions.submittedAt));
  }
}

// Create storage instance based on database availability
import { MockStorage } from "./mock-storage";

function createStorage(): IStorage {
  if (!db) {
    console.warn("Using MockStorage - data will not persist");
    return new MockStorage();
  }
  return new DatabaseStorage();
}

export const storage: IStorage = createStorage();
