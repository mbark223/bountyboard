// Admin endpoint for managing brief assignments
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getUser, requireAdmin } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check authentication and admin role
    const user = await getUser(req);
    requireAdmin(user);

    // GET - List all assignments for a brief
    if (req.method === 'GET') {
      const { briefId } = req.query;

      if (!briefId || typeof briefId !== 'string') {
        return res.status(400).json({ error: 'briefId parameter is required' });
      }

      const briefIdNum = parseInt(briefId);
      if (isNaN(briefIdNum)) {
        return res.status(400).json({ error: 'Invalid briefId' });
      }

      // Verify brief ownership
      const brief = await storage.getBriefById(briefIdNum);
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      if (brief.ownerId !== user.id) {
        return res.status(403).json({ error: 'You do not own this brief' });
      }

      // Get assignments
      const assignments = await storage.getBriefAssignments(briefIdNum);

      // Enrich with influencer details
      const enrichedAssignments = await Promise.all(
        assignments.map(async (assignment) => {
          const influencer = await storage.getInfluencerById(assignment.influencerId);
          return {
            ...assignment,
            influencer: influencer
              ? {
                  id: influencer.id,
                  firstName: influencer.firstName,
                  lastName: influencer.lastName,
                  email: influencer.email,
                  instagramHandle: influencer.instagramHandle,
                  instagramFollowers: influencer.instagramFollowers,
                  status: influencer.status,
                }
              : null,
          };
        })
      );

      console.log(`[Admin] ${user.email} - listed ${enrichedAssignments.length} assignments for brief ${briefIdNum}`);
      return res.status(200).json(enrichedAssignments);
    }

    // POST - Assign influencer to brief
    if (req.method === 'POST') {
      const { briefId, influencerId } = req.body;

      if (!briefId || !influencerId) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['briefId', 'influencerId'],
        });
      }

      // Verify brief ownership
      const brief = await storage.getBriefById(briefId);
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      if (brief.ownerId !== user.id) {
        return res.status(403).json({ error: 'You do not own this brief' });
      }

      // Verify influencer exists and is approved
      const influencer = await storage.getInfluencerById(influencerId);
      if (!influencer) {
        return res.status(404).json({ error: 'Influencer not found' });
      }

      if (influencer.status !== 'approved') {
        return res.status(400).json({
          error: 'Influencer must be approved before assignment',
          influencerStatus: influencer.status,
        });
      }

      // Check if already assigned
      const existing = await storage.getBriefAssignment(briefId, influencerId);
      if (existing) {
        return res.status(400).json({ error: 'Influencer is already assigned to this brief' });
      }

      // Create assignment
      const assignment = await storage.createBriefAssignment({
        briefId,
        influencerId,
        assignedBy: user.id,
        status: 'assigned',
      });

      console.log(`[Admin] ${user.email} - assigned influencer ${influencer.email} to brief ${brief.title}`);
      return res.status(201).json(assignment);
    }

    // DELETE - Remove influencer assignment
    if (req.method === 'DELETE') {
      const { briefId, influencerId } = req.body;

      if (!briefId || !influencerId) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['briefId', 'influencerId'],
        });
      }

      // Verify brief ownership
      const brief = await storage.getBriefById(briefId);
      if (!brief) {
        return res.status(404).json({ error: 'Brief not found' });
      }

      if (brief.ownerId !== user.id) {
        return res.status(403).json({ error: 'You do not own this brief' });
      }

      // Check if assignment exists
      const existing = await storage.getBriefAssignment(briefId, influencerId);
      if (!existing) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Delete assignment
      await storage.deleteBriefAssignment(briefId, influencerId);

      const influencer = await storage.getInfluencerById(influencerId);
      console.log(`[Admin] ${user.email} - removed influencer ${influencer?.email} from brief ${brief.title}`);
      return res.status(200).json({ success: true, message: 'Assignment removed' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Admin] Error managing brief assignments:', error);

    if (error.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Failed to manage brief assignments',
      message: error.message,
    });
  }
}
