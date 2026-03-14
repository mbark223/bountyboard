// Combined handler for GET and POST requests to /api/briefs
import { getUser } from './_lib/auth.js';
import { storage } from './_lib/storage.js';
import { Pool } from 'pg';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET requests (list briefs)
  if (req.method === 'GET') {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // For admins: return briefs they own
      if (user.userType === 'admin' || user.role === 'admin') {
        const briefs = await storage.getBriefsByOwnerId(user.id);
        console.log(`[Auth] Admin ${user.email} - returning ${briefs.length} owned briefs`);
        return res.status(200).json(briefs);
      }

      // For influencers: return only assigned briefs
      if (user.userType === 'influencer') {
        const influencer = await storage.getInfluencerByEmail(user.email);

        if (!influencer) {
          console.log(`[Auth] Influencer ${user.email} - no influencer record found`);
          return res.status(403).json({ error: 'Influencer profile not found' });
        }

        if (influencer.status !== 'approved') {
          console.log(`[Auth] Influencer ${user.email} - status: ${influencer.status}`);
          return res.status(403).json({
            error: 'Account pending approval',
            status: influencer.status
          });
        }

        const briefs = await storage.getAssignedBriefs(influencer.id);
        console.log(`[Auth] Influencer ${user.email} - returning ${briefs.length} assigned briefs`);
        return res.status(200).json(briefs);
      }

      // Other user types not allowed
      console.log(`[Auth] User ${user.email} - unauthorized userType: ${user.userType}`);
      return res.status(403).json({ error: 'Access denied' });

    } catch (error) {
      console.error('Error fetching briefs:', error);
      res.status(500).json({
        error: 'Failed to fetch briefs',
        message: error.message
      });
    }
  }

  // Handle POST requests (create brief)
  if (req.method === 'POST') {
    let pool;

    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL not configured');
      }

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 1,
        ssl: {
          rejectUnauthorized: false
        }
      });

      const {
        slug,
        title,
        orgName,
        businessLine,
        state,
        overview,
        requirements,
        deliverableRatio,
        deliverableLength,
        deliverableFormat,
        reward,
        deadline,
        status,
        password,
        maxWinners,
        maxSubmissionsPerCreator,
        ownerId,
        // New project management fields
        requester,
        responsible,
        priority,
        finalDeliverable,
        campaignTopic,
        platforms,
        creatorsNeeded
      } = req.body;

      // Validate required fields
      if (!slug || !title || !orgName) {
        return res.status(400).json({ error: 'Missing required fields: slug, title, orgName' });
      }

      console.log('[API] Creating brief with slug:', slug);

      const insertQuery = `
        INSERT INTO briefs (
          slug,
          title,
          org_name,
          business_line,
          state,
          overview,
          requirements,
          deliverable_ratio,
          deliverable_length,
          deliverable_format,
          reward_type,
          reward_amount,
          reward_currency,
          reward_description,
          deadline,
          status,
          password,
          max_winners,
          max_submissions_per_creator,
          owner_id,
          requester,
          responsible,
          priority,
          final_deliverable,
          campaign_topic,
          platforms,
          creators_needed,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW(), NOW()
        ) RETURNING *
      `;

      const values = [
        slug,
        title,
        orgName,
        businessLine || null,
        state || null,
        overview || '',
        requirements || [],
        deliverableRatio || '9:16',
        deliverableLength || '15-30 seconds',
        deliverableFormat || 'Vertical video',
        reward?.type || 'CASH',
        reward?.amount || 0,
        reward?.currency || 'USD',
        reward?.description || null,
        deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status || 'PUBLISHED',
        password || null,
        maxWinners || 1,
        maxSubmissionsPerCreator || 3,
        ownerId || 'demo-user-1', // Default for demo
        requester || null,
        responsible || null,
        priority || 'Medium',
        finalDeliverable || null,
        campaignTopic || null,
        platforms || [],
        creatorsNeeded || 1
      ];

      const result = await pool.query(insertQuery, values);

      // Transform snake_case to camelCase
      const row = result.rows[0];

      const brief = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        orgName: row.org_name,
        businessLine: row.business_line,
        state: row.state,
        overview: row.overview,
        requirements: row.requirements,
        deliverableRatio: row.deliverable_ratio,
        deliverableLength: row.deliverable_length,
        deliverableFormat: row.deliverable_format,
        reward: {
          type: row.reward_type,
          amount: row.reward_amount,
          currency: row.reward_currency,
          description: row.reward_description,
        },
        deadline: row.deadline,
        status: row.status,
        password: row.password,
        maxWinners: row.max_winners,
        maxSubmissionsPerCreator: row.max_submissions_per_creator,
        ownerId: row.owner_id,
        // New project management fields
        requester: row.requester,
        responsible: row.responsible,
        priority: row.priority,
        finalDeliverable: row.final_deliverable,
        campaignTopic: row.campaign_topic,
        platforms: row.platforms,
        creatorsNeeded: row.creators_needed,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      console.log('[API] Brief created successfully:', { id: brief.id, slug: brief.slug });
      res.status(201).json(brief);

    } catch (error) {
      console.error('[API] Error creating brief:', error);
      res.status(500).json({
        error: 'Failed to create brief',
        message: error.message,
        code: error.code,
        detail: error.detail
      });
    } finally {
      if (pool) {
        await pool.end();
      }
    }
  }

  // Method not allowed
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
