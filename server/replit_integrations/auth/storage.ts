import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserBySlug(slug: string): Promise<User | undefined>;
  updateUserOrg(id: string, data: Partial<User>): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          userType: userData.userType || "admin",
          emailVerified: userData.emailVerified,
          lastLoginAt: userData.lastLoginAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserBySlug(slug: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.orgSlug, slug));
    return user;
  }

  async updateUserOrg(id: string, data: {
    orgName: string;
    orgSlug: string;
    orgWebsite: string | null;
    orgDescription: string | null;
    isOnboarded: boolean;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        orgName: data.orgName,
        orgSlug: data.orgSlug,
        orgWebsite: data.orgWebsite,
        orgDescription: data.orgDescription,
        isOnboarded: data.isOnboarded,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
