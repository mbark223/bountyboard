#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pg from 'pg';

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

function print(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function printHeader(message: string) {
  console.log('\n' + '='.repeat(50));
  print(message, colors.bright + colors.cyan);
  console.log('='.repeat(50) + '\n');
}

async function checkEnvFile(): Promise<boolean> {
  printHeader('Environment File Check');
  
  const envPath = path.join(rootDir, '.env');
  const envExamplePath = path.join(rootDir, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    print('✗ .env file not found', colors.red);
    print(`  Run 'npm run setup' to create one`, colors.yellow);
    return false;
  }
  
  print('✓ .env file exists', colors.green);
  
  // Load environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars: Record<string, string> = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  // Check required variables
  const requiredVars = ['DATABASE_URL'];
  const missingVars = requiredVars.filter(v => !envVars[v]);
  
  if (missingVars.length > 0) {
    print('\n✗ Missing required environment variables:', colors.red);
    missingVars.forEach(v => print(`  - ${v}`, colors.red));
    return false;
  }
  
  print('✓ All required environment variables present', colors.green);
  
  return true;
}

async function checkDatabaseConnection(): Promise<boolean> {
  printHeader('Database Connection Check');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    print('✗ DATABASE_URL not set', colors.red);
    return false;
  }
  
  // Parse and display connection info (hide password)
  try {
    const url = new URL(databaseUrl);
    print(`Database: ${url.hostname}${url.pathname}`, colors.cyan);
    print(`User: ${url.username}`, colors.cyan);
  } catch (error) {
    print('✗ Invalid DATABASE_URL format', colors.red);
    return false;
  }
  
  // Test connection
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    print('\nTesting connection...', colors.yellow);
    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT NOW()');
    client.release();
    
    print('✓ Database connection successful', colors.green);
    print(`  Server time: ${result.rows[0].now}`, colors.cyan);
    
    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('briefs', 'submissions', 'influencers', 'feedback')
    `);
    
    if (tableCheck.rows.length === 0) {
      print('\n⚠ No tables found', colors.yellow);
      print(`  Run 'npm run db:push' to create tables`, colors.yellow);
    } else {
      print('\n✓ Database tables found:', colors.green);
      tableCheck.rows.forEach(row => {
        print(`  - ${row.table_name}`, colors.cyan);
      });
    }
    
    await pool.end();
    return true;
    
  } catch (error: any) {
    print('✗ Database connection failed', colors.red);
    print(`  Error: ${error.message}`, colors.red);
    
    if (error.code === 'ECONNREFUSED') {
      print('\n  Possible solutions:', colors.yellow);
      print('  - Check if database server is running', colors.yellow);
      print('  - Verify host and port in connection string', colors.yellow);
    } else if (error.code === '28P01') {
      print('\n  Authentication failed. Check your password.', colors.yellow);
    }
    
    await pool.end();
    return false;
  }
}

async function checkNodeVersion(): Promise<boolean> {
  printHeader('System Requirements');
  
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (major < 18) {
    print(`✗ Node.js ${nodeVersion} is too old`, colors.red);
    print('  Required: Node.js 18.0.0 or higher', colors.yellow);
    return false;
  }
  
  print(`✓ Node.js ${nodeVersion}`, colors.green);
  
  // Check npm
  try {
    const { execSync } = await import('child_process');
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    print(`✓ npm ${npmVersion}`, colors.green);
  } catch {
    print('✗ npm not found', colors.red);
    return false;
  }
  
  return true;
}

async function checkDependencies(): Promise<boolean> {
  printHeader('Dependencies Check');
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    print('✗ node_modules not found', colors.red);
    print(`  Run 'npm install' to install dependencies`, colors.yellow);
    return false;
  }
  
  print('✓ node_modules exists', colors.green);
  
  // Check for key dependencies
  const keyDeps = ['express', 'drizzle-orm', 'react', 'vite'];
  const missingDeps = keyDeps.filter(dep => 
    !fs.existsSync(path.join(nodeModulesPath, dep))
  );
  
  if (missingDeps.length > 0) {
    print('\n✗ Missing key dependencies:', colors.red);
    missingDeps.forEach(dep => print(`  - ${dep}`, colors.red));
    print(`\n  Run 'npm install' to fix`, colors.yellow);
    return false;
  }
  
  print('✓ All key dependencies installed', colors.green);
  return true;
}

async function main() {
  print('🔍 Brief Bounty Builder Environment Check', colors.bright + colors.cyan);
  
  let allPassed = true;
  
  // Check Node version
  if (!await checkNodeVersion()) {
    allPassed = false;
  }
  
  // Check dependencies
  if (!await checkDependencies()) {
    allPassed = false;
  }
  
  // Check environment file
  if (!await checkEnvFile()) {
    allPassed = false;
  } else {
    // Only check database if env file is valid
    // Load env vars
    const envPath = path.join(rootDir, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    if (!await checkDatabaseConnection()) {
      allPassed = false;
    }
  }
  
  // Summary
  printHeader('Summary');
  
  if (allPassed) {
    print('✓ All checks passed!', colors.bright + colors.green);
    print('\nYour environment is ready. You can run:', colors.cyan);
    print('  npm run dev      - Start the server', colors.cyan);
    print('  npm run dev:client - Start the client', colors.cyan);
  } else {
    print('✗ Some checks failed', colors.bright + colors.red);
    print('\nPlease fix the issues above and run this check again.', colors.yellow);
    print('You can run "npm run setup" for guided setup.', colors.yellow);
    process.exit(1);
  }
}

// Run the check
main().catch(error => {
  print('\n✗ Environment check failed', colors.red);
  console.error(error);
  process.exit(1);
});