import type { User, Brief, Influencer } from "../shared/schema.js";
import type { IStorage } from "./storage.js";

export interface PermissionContext {
  user: User;
  influencer?: Influencer;
}

/**
 * Check if user can view a specific brief
 */
export async function canViewBrief(
  context: PermissionContext,
  briefId: number,
  storage: any
): Promise<boolean> {
  const { user, influencer } = context;

  // Admins can view all briefs they own
  if (user.userType === 'admin' || user.role === 'admin') {
    const brief = await storage.getBriefById(briefId);
    return brief && brief.ownerId === user.id;
  }

  // Influencers can only view assigned briefs
  if (user.userType === 'influencer' && influencer && influencer.status === 'approved') {
    const assignment = await storage.getBriefAssignment(briefId, influencer.id);
    return !!assignment;
  }

  return false;
}

/**
 * Check if user can submit to a brief
 */
export async function canSubmitToBrief(
  context: PermissionContext,
  briefId: number,
  storage: any
): Promise<boolean> {
  const { user, influencer } = context;

  // Only approved influencers with assignments can submit
  if (user.userType === 'influencer' && influencer && influencer.status === 'approved') {
    const assignment = await storage.getBriefAssignment(briefId, influencer.id);
    return !!assignment;
  }

  return false;
}

/**
 * Check if user can manage briefs (create, edit, delete)
 */
export function canManageBriefs(context: PermissionContext): boolean {
  const { user } = context;
  return user.userType === 'admin' || user.role === 'admin';
}

/**
 * Check if user can manage influencers (approve, reject, assign)
 */
export function canManageInfluencers(context: PermissionContext): boolean {
  const { user } = context;
  return user.userType === 'admin' || user.role === 'admin';
}

/**
 * Check if user owns a specific brief
 */
export async function ownsBrief(
  user: User,
  briefId: number,
  storage: any
): Promise<boolean> {
  const brief = await storage.getBriefById(briefId);
  return brief && brief.ownerId === user.id;
}

/**
 * Check if user can view submissions for a brief
 */
export async function canViewSubmissions(
  context: PermissionContext,
  briefId: number,
  storage: any
): Promise<boolean> {
  const { user } = context;

  // Admins can view submissions for briefs they own
  if (user.userType === 'admin' || user.role === 'admin') {
    return await ownsBrief(user, briefId, storage);
  }

  return false;
}

/**
 * Check if user can manage submissions (select winners, update status)
 */
export async function canManageSubmissions(
  context: PermissionContext,
  briefId: number,
  storage: any
): Promise<boolean> {
  const { user } = context;

  // Admins can manage submissions for briefs they own
  if (user.userType === 'admin' || user.role === 'admin') {
    return await ownsBrief(user, briefId, storage);
  }

  return false;
}
