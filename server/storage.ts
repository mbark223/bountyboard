import { 
  type User, 
  type InsertUser,
  type Brief,
  type InsertBrief,
  type Submission,
  type InsertSubmission,
  users,
  briefs,
  submissions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Brief methods
  getAllPublishedBriefs(): Promise<Brief[]>;
  getBriefBySlug(slug: string): Promise<Brief | undefined>;
  getBriefById(id: number): Promise<Brief | undefined>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBriefStatus(id: number, status: string): Promise<Brief>;
  
  // Submission methods
  getSubmissionsByBriefId(briefId: number): Promise<Submission[]>;
  getSubmissionById(id: number): Promise<Submission | undefined>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmissionStatus(id: number, status: string, selectedAt?: Date): Promise<Submission>;
  updateSubmissionPayout(id: number, payoutStatus: string, paidAt?: Date, notes?: string): Promise<Submission>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Brief methods
  async getAllPublishedBriefs(): Promise<Brief[]> {
    return await db
      .select()
      .from(briefs)
      .where(eq(briefs.status, "PUBLISHED"))
      .orderBy(desc(briefs.createdAt));
  }

  async getBriefBySlug(slug: string): Promise<Brief | undefined> {
    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.slug, slug));
    return brief || undefined;
  }

  async getBriefById(id: number): Promise<Brief | undefined> {
    const [brief] = await db
      .select()
      .from(briefs)
      .where(eq(briefs.id, id));
    return brief || undefined;
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

  // Submission methods
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

  async updateSubmissionStatus(id: number, status: string, selectedAt?: Date): Promise<Submission> {
    const updateData: any = { status };
    if (selectedAt) {
      updateData.selectedAt = selectedAt;
      // If selected, set payout to pending
      if (status === "SELECTED") {
        updateData.payoutStatus = "PENDING";
      }
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
}

export const storage = new DatabaseStorage();
