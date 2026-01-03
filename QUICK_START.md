# Quick Start Guide - Get Running in 5 Minutes

## Option 1: Use a Free Cloud Database (Recommended)

### Step 1: Get a Free PostgreSQL Database

Choose one of these free services:

#### Supabase (Recommended)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new project (any name)
5. Wait for database to provision (~2 minutes)
6. Go to Settings → Database
7. Copy the "Connection string" (URI)

#### Neon
1. Go to https://neon.tech
2. Sign up with GitHub or email
3. Create a new project
4. Copy the connection string from the dashboard

### Step 2: Update Your Database URL

1. Open `.env` file
2. Replace the DATABASE_URL with your connection string:
```
DATABASE_URL=your_connection_string_here
```

Example Supabase URL:
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Step 3: Set Up Database Tables

```bash
# Install dependencies if you haven't
npm install

# Push the database schema
npm run db:push
```

### Step 4: Populate Test Data

```bash
npm run seed
```

### Step 5: Start the Application

```bash
# In one terminal, start the server
npm run dev

# In another terminal, start the client
npm run dev:client
```

### Step 6: Access the Application

- **Client**: http://localhost:5000
- **Admin Panel**: http://localhost:5000/admin
- **Influencer Portal**: http://localhost:5000/portal

---

## Option 2: Install PostgreSQL Locally (macOS)

### Using Homebrew
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb bountyboard

# Continue with steps 3-6 from Option 1
```

### Using Postgres.app
1. Download from https://postgresapp.com
2. Install and start the app
3. Click "Initialize" to create a new server
4. Use the default DATABASE_URL in .env
5. Continue with steps 3-6 from Option 1

---

## Option 3: Use Docker (if available)

```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d

# Continue with steps 3-6 from Option 1
```

---

## Test Accounts After Seeding

### Admin Access
- Use Replit Auth at `/admin`

### Influencer Portal
- **Approved**: sarah.j@example.com, mike.c@example.com, jess.alva@example.com
- **Pending**: emma.t@example.com

---

## Troubleshooting

### "DATABASE_URL not set" error
- Make sure your .env file has the DATABASE_URL
- Restart your terminal after updating .env

### "Connection refused" error
- Check your database is running
- Verify the connection string is correct
- For cloud services, check if you need to whitelist your IP

### "Relation does not exist" error
- Run `npm run db:push` to create tables

### Port already in use
- Kill existing processes: `lsof -ti:3000 | xargs kill -9`
- Or change the port in the dev script

---

## Need Help?

1. Check the DEMO_GUIDE.md for detailed usage instructions
2. Review the seed script output for test account details
3. Database issues? Try the cloud option - it's the easiest!