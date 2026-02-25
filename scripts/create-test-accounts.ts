import { db } from '../server/db';
import { users, influencers } from '../shared/schema';
import { randomUUID } from 'crypto';

async function createTestAccounts() {
  console.log('🚀 Creating test accounts...\n');

  try {
    // 1. Create Test Admin Account
    console.log('1️⃣ Creating test admin account...');
    const adminId = randomUUID();
    const [admin] = await db.insert(users).values({
      id: adminId,
      email: 'admin@test.com',
      firstName: 'Test',
      lastName: 'Admin',
      userType: 'admin',
      role: 'admin',
      isOnboarded: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('✅ Admin account created:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Type: ${admin.userType}`);
    console.log(`   ID: ${admin.id}\n`);

    // 2. Create Test Influencer Record
    console.log('2️⃣ Creating test influencer...');
    const [influencer] = await db.insert(influencers).values({
      firstName: 'Test',
      lastName: 'Influencer',
      email: 'influencer@test.com',
      phone: '+1 (555) 123-4567',
      instagramHandle: 'testinfluencer',
      tiktokHandle: 'testinfluencer',
      instagramFollowers: 10000,
      status: 'approved',
      idVerified: 1,
      bankVerified: 1,
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('✅ Influencer record created:');
    console.log(`   Email: ${influencer.email}`);
    console.log(`   Name: ${influencer.firstName} ${influencer.lastName}`);
    console.log(`   Instagram: @${influencer.instagramHandle}`);
    console.log(`   Followers: ${influencer.instagramFollowers?.toLocaleString()}`);
    console.log(`   Status: ${influencer.status}`);
    console.log(`   ID: ${influencer.id}\n`);

    // 3. Create User Account for Influencer
    console.log('3️⃣ Creating user account for influencer...');
    const influencerUserId = randomUUID();
    const [influencerUser] = await db.insert(users).values({
      id: influencerUserId,
      email: influencer.email,
      firstName: influencer.firstName,
      lastName: influencer.lastName,
      userType: 'influencer',
      role: 'admin', // Influencers also have 'admin' role for session auth
      influencerId: influencer.id,
      isOnboarded: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    console.log('✅ Influencer user account created:');
    console.log(`   Email: ${influencerUser.email}`);
    console.log(`   Type: ${influencerUser.userType}`);
    console.log(`   Linked to influencer ID: ${influencerUser.influencerId}`);
    console.log(`   ID: ${influencerUser.id}\n`);

    console.log('🎉 Test accounts created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN ACCOUNT:');
    console.log(`  Email: admin@test.com`);
    console.log(`  Access: /admin routes`);
    console.log('');
    console.log('INFLUENCER ACCOUNT:');
    console.log(`  Email: influencer@test.com`);
    console.log(`  Access: /dashboard route`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('💡 Note: Use your application\'s login method');
    console.log('   (Magic Link, OAuth, etc.) to authenticate\n');

  } catch (error: any) {
    if (error.code === '23505') {
      console.error('❌ Error: Accounts already exist with these emails.');
      console.error('   Try deleting existing test accounts first or use different emails.\n');
    } else {
      console.error('❌ Error creating test accounts:', error.message);
      console.error(error);
    }
    process.exit(1);
  }

  process.exit(0);
}

createTestAccounts();
