import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../shared/schema.js';

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL!,
  });

  await client.connect();
  const db = drizzle(client, { schema });

  console.log('Adding NFL Playoffs submissions...');

  // Create submissions directly
  const submissions = [
    {
      briefId: 3, // NFL Playoffs brief ID
      userId: 1, // Demo user
      creatorName: 'Mike Johnson',
      creatorEmail: 'mike@example.com',
      creatorUsername: '@sportsfan_mike',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'PENDING' as const,
      submittedAt: new Date(),
    },
    {
      briefId: 3,
      userId: 1,
      creatorName: 'Sarah Williams',
      creatorEmail: 'sarah@example.com',
      creatorUsername: '@betting_queen',
      videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      status: 'APPROVED' as const,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      briefId: 3,
      userId: 1,
      creatorName: 'Tom Brady',
      creatorEmail: 'tom@example.com',
      creatorUsername: '@nfl_insider',
      videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      status: 'REJECTED' as const,
      feedback: 'Video does not mention Hard Rock Bet enough. Please ensure you follow the brief requirements and highlight our betting features.',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      briefId: 3,
      userId: 1,
      creatorName: 'Alex Smith',
      creatorEmail: 'alex@example.com',
      creatorUsername: '@gridiron_guru',
      videoUrl: 'https://www.tiktok.com/@nfl/video/7234567890123456789',
      status: 'PENDING' as const,
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  ];

  for (const submission of submissions) {
    try {
      await db.insert(schema.submissions).values(submission);
      console.log(`Added submission from ${submission.creatorName}`);
    } catch (error) {
      console.log(`Skipping ${submission.creatorName} - may already exist`);
    }
  }

  console.log('NFL Playoffs submissions added successfully!');
  await client.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});