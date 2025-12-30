import { 
  type User, 
  type Brief,
  type InsertBrief,
  type Submission,
  type InsertSubmission,
  type PromptTemplate,
  type InsertPromptTemplate,
  users,
  briefs,
  submissions,
  promptTemplates
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
}

export const storage = new VercelDatabaseStorage();