# Video Storage Implementation Guide

## Overview

The BountyBoard platform includes a scalable video storage solution designed to handle large volumes of video submissions from influencers. The implementation uses a provider-based architecture that supports multiple cloud storage services.

## Current Implementation

### Mock Storage Provider
- Used for development and demonstration
- Simulates cloud storage behavior
- No actual file storage (videos are acknowledged but not saved)

## Architecture

### Storage Provider Interface
```typescript
interface VideoStorageProvider {
  generateUploadUrl(params: UploadParams): Promise<UploadUrlResponse>;
  deleteVideo(videoKey: string): Promise<void>;
  getVideoUrl(videoKey: string): string;
}
```

### Upload Flow
1. Client requests upload URL from `/api/videos/upload-url`
2. Server generates pre-signed URL with expiration
3. Client uploads directly to storage provider
4. Client submits video URL with submission data

## Production Implementation

### Recommended: Cloudflare R2
- S3-compatible API
- No egress fees
- Global CDN included
- Cost-effective for video delivery

### Setup Steps
1. Create Cloudflare account and R2 bucket
2. Set environment variables:
   ```env
   VIDEO_STORAGE_PROVIDER=cloudflare-r2
   R2_ACCOUNT_ID=your-account-id
   R2_BUCKET_NAME=bountyboard-videos
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_PUBLIC_URL=https://videos.bountyboard.com
   ```

3. Configure CORS for direct browser uploads:
   ```json
   {
     "AllowedOrigins": ["https://bountyboard.com"],
     "AllowedMethods": ["GET", "PUT", "POST"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3600
   }
   ```

4. Uncomment and implement CloudflareR2Provider in `video-storage.ts`

### Alternative: AWS S3
- Industry standard
- Mature ecosystem
- Higher egress costs
- Implementation similar to R2

### Security Considerations
1. **Pre-signed URLs**: Expire after 30 minutes
2. **File Validation**: Check MIME types and file sizes
3. **Access Control**: Videos should be private by default
4. **Rate Limiting**: Limit upload requests per user

## Cost Optimization

### Storage Tiers
1. **Hot Storage**: Recent submissions (< 30 days)
2. **Cool Storage**: Older submissions (30-90 days)
3. **Archive**: Completed briefs (> 90 days)

### CDN Strategy
- Use CloudFlare CDN for global distribution
- Cache videos at edge locations
- Implement viewer authentication

## Monitoring

### Key Metrics
- Upload success rate
- Average upload time
- Storage usage by brief
- Bandwidth consumption

### Alerts
- Failed uploads
- Storage quota warnings
- Unusual activity patterns

## Migration Path

### From Mock to Production
1. Deploy with mock provider
2. Test upload flows
3. Configure production storage
4. Update environment variables
5. Migrate existing videos (if any)

## API Reference

### Generate Upload URL
```http
POST /api/videos/upload-url
Content-Type: application/json

{
  "fileName": "submission.mp4",
  "fileType": "video/mp4",
  "fileSizeBytes": 104857600,
  "briefId": 1,
  "creatorEmail": "creator@example.com"
}

Response:
{
  "uploadUrl": "https://...",
  "videoKey": "briefs/1/submissions/abc123-submission.mp4",
  "publicUrl": "https://cdn.bountyboard.com/...",
  "expiresAt": "2024-01-01T12:30:00Z"
}
```

### Direct Upload
```http
POST <uploadUrl>
Content-Type: multipart/form-data

[Binary video data]
```

## Best Practices

1. **Client-side compression**: Reduce file sizes before upload
2. **Chunked uploads**: For large files (> 100MB)
3. **Progress tracking**: Show upload progress to users
4. **Retry logic**: Handle network failures gracefully
5. **Thumbnail generation**: Create previews for admin review

## Future Enhancements

1. **Video Processing Pipeline**
   - Transcoding for different qualities
   - Thumbnail generation
   - Content moderation

2. **Analytics Integration**
   - View count tracking
   - Engagement metrics
   - Performance analytics

3. **Advanced Features**
   - Video trimming/editing
   - Watermarking
   - AI-based content analysis