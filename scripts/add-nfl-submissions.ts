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

  // First, find the NFL Playoffs brief
  const briefs = await db.select().from(schema.briefs);
  
  // Find the NFL Playoffs brief
  const nflBrief = briefs.find(b => b.title.includes('NFL Playoffs'));
  
  if (!nflBrief) {
    console.error('NFL Playoffs brief not found!');
    console.log('Available briefs:', briefs.map(b => b.title));
    await client.end();
    return;
  }
  console.log(`Found NFL Playoffs brief with ID: ${nflBrief.id}`);

  // Create some test creator users if they don't exist
  const creators = [
    { 
      username: 'sportsfan_mike', 
      email: 'mike@example.com',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: 'CREATOR' as const
    },
    { 
      username: 'betting_queen', 
      email: 'sarah@example.com',
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'CREATOR' as const
    },
    { 
      username: 'nfl_insider', 
      email: 'tom@example.com',
      firstName: 'Tom',
      lastName: 'Brady',
      role: 'CREATOR' as const
    },
    { 
      username: 'gridiron_guru', 
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
      role: 'CREATOR' as const
    }
  ];

  const creatorIds = [];
  for (const creator of creators) {
    const existing = await db.select().from(schema.users);
    const existingUser = existing.find(u => u.username === creator.username);
    
    if (existingUser) {
      creatorIds.push(existingUser.id);
    } else {
      const [newUser] = await db.insert(schema.users).values({
        ...creator,
        isOnboarded: true,
      }).returning();
      creatorIds.push(newUser.id);
    }
  }

  // Create submissions with different statuses
  const submissions = [
    {
      briefId: nflBrief.id,
      userId: creatorIds[0],
      creatorName: 'Mike Johnson',
      creatorEmail: 'mike@example.com',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'PENDING' as const,
      submittedAt: new Date(),
    },
    {
      briefId: nflBrief.id,
      userId: creatorIds[1],
      creatorName: 'Sarah Williams',
      creatorEmail: 'sarah@example.com',
      videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      status: 'APPROVED' as const,
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      briefId: nflBrief.id,
      userId: creatorIds[2],
      creatorName: 'Tom Brady',
      creatorEmail: 'tom@example.com',
      videoUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      status: 'REJECTED' as const,
      feedback: 'Video does not mention Hard Rock Bet enough. Please ensure you follow the brief requirements and highlight our betting features.',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      briefId: nflBrief.id,
      userId: creatorIds[3],
      creatorName: 'Alex Smith',
      creatorEmail: 'alex@example.com',
      videoUrl: 'https://www.tiktok.com/@nfl/video/7234567890123456789',
      status: 'PENDING' as const,
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  ];

  for (const submission of submissions) {
    await db.insert(schema.submissions).values(submission);
  }

  console.log(`Added ${submissions.length} submissions to NFL Playoffs brief`);
  console.log('Submissions added successfully!');

  await client.end();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});