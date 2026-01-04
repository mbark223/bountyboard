export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { briefId } = req.query;
  
  if (!briefId) {
    return res.status(400).json({ error: 'briefId is required' });
  }
  
  console.log('[Admin Submissions Mock] Request for briefId:', briefId);
  
  // Return mock data with the structure the client expects
  const mockSubmissions = [
    {
      id: 1,
      videoUrl: 'https://example.com/video1.mp4',
      status: 'RECEIVED',
      submittedAt: new Date().toISOString(),
      creatorId: null,
      creatorName: 'John Doe',
      creatorEmail: 'john@example.com',
      creatorPhone: null,
      creatorHandle: '@johndoe',
      creatorBettingAccount: null,
      message: null,
      videoFileName: 'submission1.mp4',
      videoMimeType: 'video/mp4',
      videoSizeBytes: 1000000,
      payoutStatus: 'NOT_APPLICABLE',
      payoutAmount: null,
      payoutNotes: null,
      reviewedBy: null,
      reviewNotes: null,
      selectedAt: null,
      paidAt: null,
      hasFeedback: 0,
      parentSubmissionId: null,
      submissionVersion: 1,
      allowsResubmission: 1,
      briefId: parseInt(briefId),
      brief: {
        id: parseInt(briefId),
        slug: `brief-${briefId}`,
        title: 'Test Brief',
        orgName: 'Test Org',
        organization: {
          name: 'Test Org',
          slug: 'test-org',
          logoUrl: null,
          website: null,
          description: null
        },
        rewardType: 'CASH',
        rewardAmount: '1000',
        rewardCurrency: 'USD',
        rewardDescription: null,
        deadline: new Date().toISOString(),
        status: 'PUBLISHED',
        maxWinners: 1,
        maxSubmissionsPerCreator: 3
      },
      creator: {
        id: null,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        handle: '@johndoe'
      },
      video: {
        url: 'https://example.com/video1.mp4',
        fileName: 'submission1.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 1000000,
        duration: '0:30',
        thumbnail: '/placeholder-video.jpg'
      }
    }
  ];
  
  res.status(200).json(mockSubmissions);
}