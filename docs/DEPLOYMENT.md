# Deployment Guide

This guide covers deploying Brief Bounty Builder to various platforms.

## Quick Deploy Options

### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmbark223%2Fbountyboard&env=DATABASE_URL,REPLIT_CLIENT_ID,REPLIT_CLIENT_SECRET&envDescription=Database%20connection%20string%20and%20auth%20credentials&envLink=https%3A%2F%2Fgithub.com%2Fmbark223%2Fbountyboard%23environment-variables)

### Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/bountyboard?referralCode=mbark223)

### Deploy to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mbark223/bountyboard)

## Prerequisites

1. **Database**: PostgreSQL database (local or cloud)
2. **Node.js**: Version 18.0.0 or higher
3. **Environment Variables**: See configuration section

## Local Setup

### 1. Quick Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/mbark223/bountyboard.git
cd bountyboard

# Run interactive setup
npm run setup
```

The setup wizard will:
- Check prerequisites
- Help configure your database
- Create `.env` file
- Run migrations
- Optionally seed demo data

### 2. Manual Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Run database migrations
npm run db:push

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

## Database Options

### Cloud Providers (Free Tiers)

#### Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string

#### Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

#### Vercel Postgres
1. In Vercel dashboard, go to Storage
2. Create Postgres database
3. Connection string auto-added to env vars

### Local Options

#### PostgreSQL
```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15
createdb bountyboard

# Ubuntu/Debian
sudo apt install postgresql
sudo -u postgres createdb bountyboard
```

#### Docker
```bash
# Using included docker-compose
docker-compose up -d
```

## Environment Variables

Create a `.env` file with:

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional (defaults shown)
REPLIT_CLIENT_ID=dummy
REPLIT_CLIENT_SECRET=dummy
VIDEO_STORAGE_PROVIDER=mock
```

## Platform-Specific Deployment

### Vercel

1. **Connect GitHub Repository**
   - Fork/clone this repository
   - Import to Vercel from GitHub

2. **Configure Environment Variables**
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add other optional variables

3. **Deploy**
   - Vercel automatically builds and deploys
   - Visit your deployment URL

### Railway

1. **Click Deploy Button** or manually:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and init
   railway login
   railway init
   
   # Add PostgreSQL
   railway add postgresql
   
   # Deploy
   railway up
   ```

2. **Environment Variables**
   - Railway auto-configures PostgreSQL
   - Add additional vars in dashboard

### Render

1. **Web Service Setup**
   - New → Web Service
   - Connect GitHub repo
   - Build Command: `npm run build`
   - Start Command: `npm start`

2. **Database Setup**
   - New → PostgreSQL
   - Copy internal connection string
   - Add as `DATABASE_URL` env var

### Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Deploy**
   ```bash
   fly launch
   fly postgres create
   fly postgres attach
   fly deploy
   ```

## Post-Deployment

### 1. Run Migrations

After deployment, run migrations:

```bash
# Locally with production DATABASE_URL
export DATABASE_URL="your-production-url"
npm run db:push

# Or use platform CLI
railway run npm run db:push
```

### 2. Seed Initial Data (Optional)

```bash
npm run seed
```

### 3. Health Check

```bash
# Check deployment health
npm run health
```

## Demo Mode

The app can run without a database in "demo mode":
- Data stored in memory (not persistent)
- Warning banner displayed
- Good for testing/demos

To enable: Don't set `DATABASE_URL` or set it to empty.

## Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall/security groups

**"Relation does not exist"**
- Run `npm run db:push`
- Check migration logs

**"Build failed on Vercel"**
- Check build logs
- Ensure all env vars are set
- Try building locally first

### Platform Limits

- **Vercel**: 10s function timeout (Free)
- **Railway**: $5 free credits/month
- **Render**: Spins down after 15min inactivity (Free)
- **Fly.io**: 3 shared VMs free

## Production Checklist

- [ ] Set strong database password
- [ ] Enable SSL for database connections
- [ ] Configure proper CORS origins
- [ ] Set up monitoring (e.g., Sentry)
- [ ] Configure backups
- [ ] Set up custom domain
- [ ] Enable CDN for assets
- [ ] Configure rate limiting

## Support

- **Documentation**: See README.md
- **Demo Guide**: See DEMO_GUIDE.md
- **Issues**: [GitHub Issues](https://github.com/mbark223/bountyboard/issues)