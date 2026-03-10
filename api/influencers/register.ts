// Public endpoint for influencer self-service registration
import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../_lib/storage.js';
import { z } from 'zod';

// Validation schema for influencer registration
const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  instagramHandle: z
    .string()
    .min(1, 'Instagram handle is required')
    .regex(/^@?[\w.]+$/, 'Invalid Instagram handle'),
  instagramFollowers: z.number().optional(),
  tiktokHandle: z.string().optional(),
  youtubeChannel: z.string().optional(),
  // Banking info optional for now, can be collected later
  bankAccountHolderName: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountType: z.enum(['checking', 'savings']).optional(),
  taxIdNumber: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = registrationSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const data = validationResult.data;

    // Check if email already exists
    const existingInfluencer = await storage.getInfluencerByEmail(data.email);
    if (existingInfluencer) {
      return res.status(400).json({
        error: 'Email already registered',
        message: 'An influencer account with this email already exists',
      });
    }

    // Create influencer with pending status
    const influencer = await storage.createInfluencer({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      instagramHandle: data.instagramHandle.startsWith('@')
        ? data.instagramHandle
        : `@${data.instagramHandle}`,
      instagramFollowers: data.instagramFollowers,
      tiktokHandle: data.tiktokHandle,
      youtubeChannel: data.youtubeChannel,
      bankAccountHolderName: data.bankAccountHolderName,
      bankRoutingNumber: data.bankRoutingNumber,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountType: data.bankAccountType,
      taxIdNumber: data.taxIdNumber,
      status: 'pending',
      idVerified: 0,
      bankVerified: 0,
      notificationPreferences: 'all',
      preferredPaymentMethod: 'bank',
    });

    console.log(`[Registration] New influencer application: ${influencer.email}`);

    // TODO: Send notification to admins about new application
    // TODO: Send confirmation email to influencer

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. You will be notified once approved.',
      influencer: {
        id: influencer.id,
        email: influencer.email,
        firstName: influencer.firstName,
        lastName: influencer.lastName,
        status: influencer.status,
        appliedAt: influencer.appliedAt,
      },
    });
  } catch (error: any) {
    console.error('[Registration] Error:', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
}
