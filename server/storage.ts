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
    const results = await db
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
}

export const storage = new DatabaseStorage();
