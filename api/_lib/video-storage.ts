/**
 * Video Storage Service
 * 
 * This module provides an abstraction layer for video storage,
 * supporting multiple cloud storage providers with a unified interface.
 * 
 * Current implementation uses direct upload to storage provider
 * Future implementations can include:
 * - Cloudflare R2
 * - AWS S3
 * - Google Cloud Storage
 * - Azure Blob Storage
 */

import crypto from 'crypto';

export interface VideoStorageProvider {
  generateUploadUrl(params: UploadParams): Promise<UploadUrlResponse>;
  deleteVideo(videoKey: string): Promise<void>;
  getVideoUrl(videoKey: string): string;
}

export interface UploadParams {
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  briefId: number;
  creatorEmail: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  videoKey: string;
  publicUrl: string;
  expiresAt: Date;
}

/**
 * Mock storage provider for development/demo
 * In production, this should be replaced with actual cloud storage
 */
export class MockStorageProvider implements VideoStorageProvider {
  private readonly baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  async generateUploadUrl(params: UploadParams): Promise<UploadUrlResponse> {
    // Generate a unique key for the video
    const timestamp = Date.now();
    const hash = crypto.createHash('md5')
      .update(`${params.creatorEmail}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    
    const videoKey = `briefs/${params.briefId}/submissions/${hash}-${params.fileName}`;
    const publicUrl = `${this.baseUrl}/api/videos/${videoKey}`;
    
    // In a real implementation, this would generate a pre-signed URL
    // For now, we'll use a mock endpoint
    const uploadToken = crypto.randomBytes(32).toString('hex');
    const uploadUrl = `${this.baseUrl}/api/videos/mock-upload?token=${uploadToken}&key=${encodeURIComponent(videoKey)}`;
    
    return {
      uploadUrl,
      videoKey,
      publicUrl,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
  }

  async deleteVideo(videoKey: string): Promise<void> {
    // In production, this would delete from cloud storage
    console.log(`Would delete video: ${videoKey}`);
  }

  getVideoUrl(videoKey: string): string {
    return `${this.baseUrl}/api/videos/${videoKey}`;
  }
}

/**
 * Cloudflare R2 Storage Provider
 * Uncomment and configure when ready to use
 */
/*
export class CloudflareR2Provider implements VideoStorageProvider {
  private readonly accountId: string;
  private readonly bucketName: string;
  private readonly accessKeyId: string;
  private readonly secretAccessKey: string;
  private readonly publicUrl: string;

  constructor(config: {
    accountId: string;
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    publicUrl: string;
  }) {
    this.accountId = config.accountId;
    this.bucketName = config.bucketName;
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.publicUrl = config.publicUrl;
  }

  async generateUploadUrl(params: UploadParams): Promise<UploadUrlResponse> {
    // Implementation would use AWS SDK v3 with R2 endpoint
    // Generate pre-signed POST URL for direct browser upload
    throw new Error("Cloudflare R2 provider not implemented");
  }

  async deleteVideo(videoKey: string): Promise<void> {
    // Delete object from R2
    throw new Error("Cloudflare R2 provider not implemented");
  }

  getVideoUrl(videoKey: string): string {
    return `${this.publicUrl}/${videoKey}`;
  }
}
*/

/**
 * Factory function to get the appropriate storage provider
 */
export function getVideoStorageProvider(): VideoStorageProvider {
  const provider = process.env.VIDEO_STORAGE_PROVIDER || 'mock';
  
  switch (provider) {
    case 'mock':
      return new MockStorageProvider();
    
    case 'cloudflare-r2':
      // Uncomment when implementing
      /*
      return new CloudflareR2Provider({
        accountId: process.env.R2_ACCOUNT_ID!,
        bucketName: process.env.R2_BUCKET_NAME!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        publicUrl: process.env.R2_PUBLIC_URL!,
      });
      */
      throw new Error("Cloudflare R2 provider not implemented");
    
    default:
      throw new Error(`Unknown video storage provider: ${provider}`);
  }
}

// Export singleton instance
export const videoStorage = getVideoStorageProvider();