# Bounty Board

## Overview

A creative brief and bounty submission portal for Hard Rock Bet. The platform enables HR/admin users to create creative briefs with bounty rewards, while influencers can submit video content for potential rewards. The system tracks submissions, allows admins to select winners, and manually manages payout status with audit trails.

**Core workflow:**
1. Admins create and publish creative briefs with bounty details
2. Influencers view published briefs and submit video content
3. Admins review submissions and select winners
4. Payout tracking is handled manually with status updates

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui with Radix primitives
- **Styling**: Tailwind CSS v4 with custom theme (dark mode, gold/amber accent colors)
- **Build Tool**: Vite with custom plugins for Replit integration
- **Fonts**: Bebas Neue (headings), Inter (body text)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with tsx for development
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Authentication**: Replit Auth via OpenID Connect with session-based auth
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for validation
- **Schema Location**: `shared/schema.ts` for shared types between client/server
- **Migrations**: Drizzle Kit with `db:push` command

### Key Data Models
- **Users**: Admin accounts with organization/brand details, onboarding state
- **Briefs**: Creative briefs with reward details, deliverable specs, deadlines
- **Submissions**: Video submissions linked to briefs with status tracking
- **Sessions**: Authentication session storage

### Authentication Flow
- Replit Auth integration with OIDC
- Protected routes use `isAuthenticated` middleware
- New users go through onboarding to set up organization details
- Session persists for 7 days

### Build & Deployment
- Development: `npm run dev` starts Express server with Vite middleware
- Production: `npm run build` creates bundled output in `dist/`
- Client builds to `dist/public/`, server bundles to `dist/index.cjs`

## External Dependencies

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Connection pooling with pg Pool

### Authentication
- Replit OIDC provider (`ISSUER_URL` defaults to `https://replit.com/oidc`)
- Requires `SESSION_SECRET` and `REPL_ID` environment variables

### Third-Party Services
- No external payment processing (manual payout tracking)
- No external file storage (video URLs are stored as references)

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `connect-pg-simple`: Session management
- `openid-client` / `passport`: Authentication
- `@tanstack/react-query`: Client-side data fetching
- `zod` / `drizzle-zod`: Schema validation
- `framer-motion`: Animations on landing page