# Brief Bounty Builder

A platform connecting brands with content creators for authentic video campaigns. Manage briefs, review submissions, and streamline influencer collaborations.

## 🚀 Quick Start

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmbark223%2Fbountyboard&env=DATABASE_URL&envDescription=PostgreSQL%20connection%20string&envLink=https%3A%2F%2Fgithub.com%2Fmbark223%2Fbountyboard%23environment-variables)

### Local Setup (5 minutes)

```bash
# Clone and setup
git clone https://github.com/mbark223/bountyboard.git
cd bountyboard

# Run interactive setup
npm run setup
```

The setup wizard will guide you through:
- Database configuration (Supabase, Neon, Local, or Docker)
- Environment setup
- Running migrations
- Optional demo data

## 🎯 Features

### For Brands/Admins
- **Brief Management**: Create and manage video campaign briefs
- **Submission Review**: Review, approve, and provide feedback on submissions
- **Influencer Vetting**: Approve and manage content creators
- **Payment Tracking**: Track bounties and payouts
- **Analytics Dashboard**: Monitor campaign performance

### For Influencers
- **Easy Access**: Simple email-based portal access
- **Brief Discovery**: Browse available opportunities
- **Video Submission**: Drag-and-drop video uploads
- **Feedback System**: Receive constructive feedback
- **Payment Status**: Track earnings and payouts

## 🛠 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL
- **ORM**: Drizzle ORM
- **Deployment**: Vercel, Railway, Render
- **Storage**: Mock storage (production: S3, R2, etc.)

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL database (local or cloud)
- npm or yarn

## 🔧 Development

### Environment Variables

Create a `.env` file:

```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional
REPLIT_CLIENT_ID=dummy
REPLIT_CLIENT_SECRET=dummy
VIDEO_STORAGE_PROVIDER=mock
```

### Commands

```bash
# Install dependencies
npm install

# Run setup wizard
npm run setup

# Check environment
npm run health

# Development
npm run dev          # Start server (port 3000)
npm run dev:client   # Start client (port 5000)

# Database
npm run db:push      # Run migrations
npm run seed         # Seed demo data

# Production
npm run build        # Build for production
npm start            # Start production server
```

## 🌐 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options
- **Vercel**: One-click deploy with automatic builds
- **Railway**: Full-stack hosting with PostgreSQL
- **Render**: Free tier with auto-sleep
- **Fly.io**: Global edge deployment

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Platform-specific deployment instructions
- [Demo Guide](DEMO_GUIDE.md) - Step-by-step demo walkthrough
- [API Reference](docs/API.md) - API endpoints documentation

## 🎭 Demo Mode

Run without a database for testing:
- Don't set `DATABASE_URL` in `.env`
- Uses in-memory mock storage
- Perfect for demos and development

## 🧪 Testing

### Test Accounts (after seeding)

**Admin Access**
- Navigate to `/admin`
- Use Replit Auth

**Influencer Portal**
- Approved: `sarah.j@example.com`, `mike.c@example.com`
- Pending: `emma.t@example.com`

### Test Flows

1. **Admin Flow**
   - Create briefs
   - Review submissions
   - Manage influencers

2. **Influencer Flow**
   - Apply as influencer
   - Browse briefs
   - Submit videos
   - Track status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/mbark223/bountyboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mbark223/bountyboard/discussions)

## 🙏 Acknowledgments

Built with modern web technologies and best practices for scalability and maintainability.