# Family History App

A private, invite-only web application for preserving and sharing family stories, photos, and memories across generations.

## Features

- **Magic Link Authentication** - Passwordless sign-in via email
- **Invite-Only Access** - Email gating ensures only family members can join
- **Story Management** - Create, edit, and categorize family memories
- **People Profiles** - Track family members with relationships
- **Timeline View** - Chronological display with filters
- **Family Relationships** - Bidirectional parent/child/spouse/sibling tracking

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Turso (distributed SQLite) |
| ORM | Prisma with libSQL adapter |
| Auth | NextAuth v5 + Resend (magic links) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Turso account (free tier available)
- Resend account (free tier: 3K emails/month)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/our-family-history.git
cd our-family-history

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables (see below)

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

```bash
# Database (Turso)
TURSO_DATABASE_URL="libsql://your-database.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# Auth (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="Family History <noreply@yourdomain.com>"
```

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture, data models, design decisions
- **[CHECKLIST.md](./CHECKLIST.md)** - Implementation progress and phase tracking
- **[docs/EMAIL_GATING.md](./docs/EMAIL_GATING.md)** - Email gating (invite-only) system documentation

## Key Concepts

### Email Gating (Invite-Only Access)

The app is private by design. Only approved emails can receive magic links:

1. **Existing users** - Already in the database
2. **Invited users** - Have a valid, unused invitation
3. **First user** - Bootstrap case when database is empty (becomes admin)

See [docs/EMAIL_GATING.md](./docs/EMAIL_GATING.md) for full details.

### User Roles

| Role | Capabilities |
|------|-------------|
| **ADMIN** | Full access + invite family members |
| **MEMBER** | Create/edit entries, manage people |
| **VIEWER** | Read-only access to all content |

### Person vs User

- **Person** - Any family member (living or deceased) who appears in stories
- **User** - Someone with app login access
- Users can link their account to a Person record via Settings

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Public auth routes
│   │   ├── login/        # Sign-in pages
│   │   └── invite/       # Invitation landing
│   ├── (main)/           # Protected routes
│   │   ├── dashboard/
│   │   ├── entries/
│   │   ├── people/
│   │   ├── timeline/
│   │   └── settings/
│   └── api/              # API routes
├── actions/              # Server actions
├── components/           # React components
├── lib/                  # Utilities & config
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Database client
│   ├── email/            # Email templates
│   └── validations/      # Zod schemas
└── proxy.ts              # Route protection
```

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
```

## Deployment

The app is designed for Vercel deployment:

1. Connect your GitHub repo to Vercel
2. Configure environment variables (see ARCHITECTURE.md for scoping details)
3. Deploy automatically on push to main

**Important:** `NEXTAUTH_URL` should only be set for Production environment in Vercel. Preview deployments auto-detect their URL.

## Contributing

This is a private family project. If you're a family member and want to contribute:

1. Ask an admin for repository access
2. Create a feature branch
3. Submit a pull request

## License

Private family project - not for public distribution.
