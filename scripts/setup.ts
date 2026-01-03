#!/usr/bin/env tsx
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function print(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader(message: string) {
  console.log('\n' + '='.repeat(50));
  print(message, colors.bright + colors.cyan);
  console.log('='.repeat(50) + '\n');
}

async function checkPrerequisites() {
  printHeader('Checking Prerequisites');
  
  // Check Node.js version
  const nodeVersion = process.version;
  print(`✓ Node.js ${nodeVersion} detected`, colors.green);
  
  // Check if npm is installed
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    print(`✓ npm ${npmVersion} detected`, colors.green);
  } catch {
    print('✗ npm not found', colors.red);
    process.exit(1);
  }
  
  // Check if .env exists
  const envPath = path.join(rootDir, '.env');
  const envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    print('! No .env file found, will create one', colors.yellow);
  } else {
    print('✓ .env file exists', colors.green);
  }
  
  return { envExists, envPath };
}

async function setupDatabase() {
  printHeader('Database Setup');
  
  print('Choose your database option:', colors.bright);
  print('1. Supabase (Recommended - Free hosted PostgreSQL)');
  print('2. Neon (Alternative free hosted PostgreSQL)');
  print('3. Local PostgreSQL (Requires local installation)');
  print('4. Docker PostgreSQL (Requires Docker)');
  print('5. Skip (I\'ll set it up manually)');
  
  const choice = await question('\nYour choice (1-5): ');
  
  let databaseUrl = '';
  
  switch (choice) {
    case '1':
      print('\n📦 Setting up Supabase...', colors.cyan);
      print('\nTo get your Supabase connection string:');
      print('1. Go to https://supabase.com and create an account/project');
      print('2. In your project dashboard, go to Settings → Database');
      print('3. Copy the "Connection string" URI\n');
      
      databaseUrl = await question('Paste your Supabase connection string: ');
      break;
      
    case '2':
      print('\n📦 Setting up Neon...', colors.cyan);
      print('\nTo get your Neon connection string:');
      print('1. Go to https://neon.tech and create an account/project');
      print('2. Copy the connection string from your dashboard\n');
      
      databaseUrl = await question('Paste your Neon connection string: ');
      break;
      
    case '3':
      print('\n💻 Local PostgreSQL selected', colors.cyan);
      const localDb = await question('Database name (default: bountyboard): ') || 'bountyboard';
      const localUser = await question('Username (default: postgres): ') || 'postgres';
      const localPass = await question('Password (default: postgres): ') || 'postgres';
      const localHost = await question('Host (default: localhost): ') || 'localhost';
      const localPort = await question('Port (default: 5432): ') || '5432';
      
      databaseUrl = `postgresql://${localUser}:${localPass}@${localHost}:${localPort}/${localDb}`;
      break;
      
    case '4':
      print('\n🐳 Docker PostgreSQL selected', colors.cyan);
      print('Creating docker-compose.yml...');
      
      const dockerCompose = `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: bountyboard-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bountyboard
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`;
      
      fs.writeFileSync(path.join(rootDir, 'docker-compose.yml'), dockerCompose);
      print('✓ docker-compose.yml created', colors.green);
      
      print('\nStarting Docker container...');
      try {
        execSync('docker-compose up -d', { cwd: rootDir });
        print('✓ PostgreSQL container started', colors.green);
        databaseUrl = 'postgresql://postgres:postgres@localhost:5432/bountyboard';
        
        // Wait for container to be ready
        print('Waiting for database to be ready...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        print('✗ Failed to start Docker container', colors.red);
        print('Please ensure Docker is installed and running', colors.yellow);
        process.exit(1);
      }
      break;
      
    case '5':
      print('\nSkipping database setup. Please set DATABASE_URL in your .env file manually.', colors.yellow);
      return null;
      
    default:
      print('Invalid choice', colors.red);
      return setupDatabase();
  }
  
  return databaseUrl;
}

async function createEnvFile(envPath: string, databaseUrl: string | null) {
  printHeader('Environment Configuration');
  
  const envContent: string[] = [];
  
  if (databaseUrl) {
    envContent.push(`DATABASE_URL=${databaseUrl}`);
  }
  
  // Add other environment variables
  envContent.push('');
  envContent.push('# Authentication (dummy values for development)');
  envContent.push('REPLIT_CLIENT_ID=dummy');
  envContent.push('REPLIT_CLIENT_SECRET=dummy');
  envContent.push('');
  envContent.push('# Video Storage');
  envContent.push('VIDEO_STORAGE_PROVIDER=mock');
  
  const finalContent = envContent.join('\n') + '\n';
  
  fs.writeFileSync(envPath, finalContent);
  print(`✓ Created .env file at ${envPath}`, colors.green);
}

async function runMigrations(skipOnError: boolean = false) {
  printHeader('Running Database Migrations');
  
  try {
    print('Creating database tables...', colors.cyan);
    execSync('npm run db:push', { cwd: rootDir, stdio: 'inherit' });
    print('\n✓ Database migrations completed', colors.green);
    return true;
  } catch (error) {
    if (skipOnError) {
      print('\n⚠ Database migrations skipped', colors.yellow);
      return false;
    } else {
      print('\n✗ Database migrations failed', colors.red);
      print('Please check your database connection and try again', colors.yellow);
      process.exit(1);
    }
  }
}

async function seedDatabase() {
  const shouldSeed = await question('\nWould you like to populate the database with demo data? (y/n): ');
  
  if (shouldSeed.toLowerCase() === 'y') {
    try {
      print('\n🌱 Seeding database with demo data...', colors.cyan);
      execSync('npm run seed', { cwd: rootDir, stdio: 'inherit' });
      print('\n✓ Database seeded successfully', colors.green);
    } catch (error) {
      print('\n✗ Database seeding failed', colors.red);
      print('You can run "npm run seed" manually later', colors.yellow);
    }
  }
}

async function installDependencies() {
  printHeader('Installing Dependencies');
  
  try {
    print('Installing npm packages...', colors.cyan);
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    print('\n✓ Dependencies installed', colors.green);
  } catch (error) {
    print('\n✗ Failed to install dependencies', colors.red);
    process.exit(1);
  }
}

async function showNextSteps(databaseUrl: string | null) {
  printHeader('Setup Complete! 🎉');
  
  print('Next steps:', colors.bright);
  print('\n1. Start the development server:');
  print('   npm run dev', colors.cyan);
  
  print('\n2. Start the client (in a new terminal):');
  print('   npm run dev:client', colors.cyan);
  
  print('\n3. Access the application:');
  print('   - Client: http://localhost:5000', colors.cyan);
  print('   - Admin: http://localhost:5000/admin', colors.cyan);
  print('   - API: http://localhost:3000', colors.cyan);
  
  if (!databaseUrl) {
    print('\n⚠ Remember to set DATABASE_URL in your .env file', colors.yellow);
  }
  
  print('\n📚 For deployment instructions, see DEPLOYMENT.md', colors.bright);
  print('💡 For demo guide, see DEMO_GUIDE.md', colors.bright);
}

async function main() {
  print('🚀 Brief Bounty Builder Setup Wizard', colors.bright + colors.cyan);
  
  try {
    // Check prerequisites
    const { envExists, envPath } = await checkPrerequisites();
    
    // Install dependencies first
    await installDependencies();
    
    // Setup database
    let databaseUrl = null;
    if (!envExists) {
      databaseUrl = await setupDatabase();
      
      // Create .env file
      if (databaseUrl || !envExists) {
        await createEnvFile(envPath, databaseUrl);
      }
    } else {
      const overwrite = await question('\n.env file already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() === 'y') {
        databaseUrl = await setupDatabase();
        await createEnvFile(envPath, databaseUrl);
      }
    }
    
    // Run migrations if database is configured
    if (databaseUrl || envExists) {
      const migrationSuccess = await runMigrations(!databaseUrl);
      
      // Seed database if migrations succeeded
      if (migrationSuccess) {
        await seedDatabase();
      }
    }
    
    // Show next steps
    await showNextSteps(databaseUrl);
    
  } catch (error) {
    print('\n✗ Setup failed', colors.red);
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main();