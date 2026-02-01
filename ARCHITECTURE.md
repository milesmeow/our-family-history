# Family History App - Architecture

## Overview

A full-featured web application for capturing, preserving, and visualizing family history. Multiple family members can contribute stories, photos, and memories, viewable on an interactive timeline and family tree.

---

## Tech Stack

| Layer | Technology | Why We Chose It |
|-------|------------|-----------------|
| **Framework** | Next.js 14+ (App Router) | Full-stack React, server components, API routes in one project |
| **Database** | Turso | Distributed SQLite, 9GB free tier, portable data format |
| **ORM** | Prisma | Type-safe queries, easy migrations, works with Turso |
| **Auth** | NextAuth.js v5 | Flexible auth with magic link support |
| **Email** | Resend | Modern email API, 3K emails/month free, great DX |
| **File Storage** | Uploadthing | Built for Next.js, simple uploads, free tier |
| **Styling** | Tailwind CSS | Utility-first, consistent design, small bundle |
| **i18n** | next-intl | Native App Router support, ICU message format, ~8KB |
| **Hosting** | Vercel | Free tier, auto-deploys from GitHub, perfect for Next.js |

### Why This Stack?

**Flexibility & Portability**
- Each service is independent and swappable
- SQLite data format = easy backups and exports
- No vendor lock-in

**Cost**
- All services have generous free tiers
- Perfect for a family/personal project

**Developer Experience**
- Type-safe from database to frontend
- Modern tooling with good documentation

---

## Data Model

### Entry (Core - Family Story/Memory)

The central entity - a story, memory, or event in family history.

```
Entry
├── id                 String (cuid)
├── title              String - "Grandma's Immigration Story"
├── content            String - Rich text/markdown content
├── summary            String? - Short excerpt for timeline view
│
├── eventDate          DateTime? - When the event happened
├── eventDateEnd       DateTime? - For events spanning time
├── dateApproximate    Boolean - "Around 1952" vs exact date
├── datePrecision      Enum (DECADE/YEAR/MONTH/DAY)
│
├── category           Enum - STORY, BIRTH, DEATH, WEDDING, MIGRATION, etc.
├── tags               Tag[] - Many-to-many
│
├── location           String? - "Ellis Island, New York"
├── locationLat        Float? - For future map features
├── locationLng        Float?
│
├── author             User - Who wrote this entry
├── peopleInvolved     Person[] - Family members in the story
├── media              Media[] - Photos, documents
├── comments           Comment[]
│
├── createdAt          DateTime
├── updatedAt          DateTime
├── publishedAt        DateTime? - null = draft
```

### Person (Family Member)

Represents a family member who appears in stories (may or may not be an app user).

```
Person
├── id                 String (cuid)
├── firstName          String
├── lastName           String
├── maidenName         String?
├── nickname           String? - "Grandma Rose"
│
├── birthDate          DateTime?
├── deathDate          DateTime?
├── relationship       String? - "Great-grandmother", "Uncle"
├── bio                String?
│
├── entries            Entry[] - Stories they appear in
├── familyRelations    FamilyRelation[] - Parent/child/spouse links
```

### User (App Contributor)

Someone who can log in and contribute to the app.

```
User
├── id                 String (cuid)
├── email              String (unique)
├── name               String
├── nickname           String?
├── avatarUrl          String?
├── role               Enum (ADMIN/MEMBER/VIEWER)
│
├── passwordHash       String? - bcrypt hash (nullable during migration)
├── requirePasswordChange Boolean - Force password change on next login
├── resetToken         String? - Password reset token (32 bytes hex)
├── resetTokenExpiry   DateTime? - Reset token expiration (1 hour)
│
├── entries            Entry[] - Stories they authored (nullable for deleted users)
├── comments           Comment[] - (nullable for deleted users)
├── person             Person? - Link to their Person record
```

**Note on User Deletion:**
When a user is deleted, their entries and comments are preserved with `authorId = null`.
The UI displays "Unknown Author" for orphaned content. See Design Decision #8 below.

### FamilyRelation (Family Tree)

Links Person records to form the family tree.

```
FamilyRelation
├── id                 String (cuid)
├── personId           String - The person
├── relatedPersonId    String - The related person
├── relationType       Enum (PARENT/CHILD/SPOUSE/SIBLING)
```

### Supporting Models

```
Tag
├── id                 String
├── name               String (unique) - "WWII", "Recipes", "Immigration"
├── entries            Entry[]

Media
├── id                 String
├── url                String - Uploadthing URL
├── type               Enum (IMAGE/VIDEO/AUDIO/DOCUMENT)
├── caption            String?
├── dateTaken          DateTime?
├── entry              Entry
├── peopleTagged       Person[]

Comment
├── id                 String
├── content            String
├── author             User
├── entry              Entry
├── createdAt          DateTime
```

---

## Project Structure

```
our-family-history/
├── ARCHITECTURE.md           ← You are here
├── CHECKLIST.md              ← Implementation progress
├── README.md
│
├── messages/
│   ├── en.json               # English translations
│   └── zh-TW.json            # Traditional Chinese translations
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data for dev
│
├── public/
│   └── images/               # Static assets
│
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with providers
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css       # Global styles
│   │   │
│   │   ├── (auth)/           # Public auth routes
│   │   │   ├── login/
│   │   │   │   ├── page.tsx               # Login with email + password
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── error/page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx               # ✅ Request password reset
│   │   │   └── reset-password/[token]/
│   │   │       └── page.tsx               # ✅ Reset password with token
│   │   │
│   │   ├── (main)/           # Protected routes
│   │   │   ├── layout.tsx    # App shell with nav
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── change-password/
│   │   │   │   ├── page.tsx               # ✅ Forced password change
│   │   │   │   └── ChangePasswordForm.tsx
│   │   │   ├── entries/
│   │   │   │   ├── page.tsx          # List entries
│   │   │   │   ├── new/page.tsx      # Create entry
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # View entry
│   │   │   │       └── edit/page.tsx # Edit entry
│   │   │   ├── timeline/page.tsx
│   │   │   ├── people/               # ✅ Implemented
│   │   │   │   ├── page.tsx          # List all family members
│   │   │   │   ├── new/page.tsx      # Create new person
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # View profile + relationships
│   │   │   │       └── edit/page.tsx # Edit person
│   │   │   ├── tree/page.tsx
│   │   │   └── settings/page.tsx     # ✅ Implemented (profile linking)
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── entries/
│   │       │   ├── route.ts          # GET all, POST new
│   │       │   └── [id]/route.ts     # GET, PUT, DELETE one
│   │       ├── people/               # ✅ Implemented
│   │       │   ├── route.ts          # GET people list
│   │       │   └── unlinked/route.ts # GET unlinked people (for profile linking)
│   │       ├── comments/route.ts
│   │       ├── upload/route.ts
│   │       └── invite/route.ts
│   │
│   ├── actions/              # ✅ Server Actions
│   │   ├── entries.ts        # Entry CRUD + people linking
│   │   ├── people.ts         # CRUD + relationships
│   │   ├── settings.ts       # Profile linking
│   │   ├── auth.ts           # ✅ Password operations (createUserWithPassword, changePassword, resetUserPassword, etc.)
│   │   └── users.ts          # ✅ User deletion (admin-only)
│   │
│   ├── components/
│   │   ├── ui/               # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── DatePicker.tsx
│   │   ├── LanguageSwitcher.tsx  # ✅ Bilingual language toggle for home page
│   │   ├── layout/
│   │   │   └── Footer.tsx        # ✅ App version display
│   │   ├── entries/             # ✅ Implemented
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   ├── PersonSelector.tsx
│   │   │   └── DeleteEntryButton.tsx
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── TimelineEvent.tsx
│   │   │   └── TimelineFilters.tsx
│   │   ├── people/               # ✅ Implemented
│   │   │   ├── PersonCard.tsx
│   │   │   ├── PersonForm.tsx
│   │   │   ├── RelationshipList.tsx
│   │   │   ├── AddRelationshipDialog.tsx
│   │   │   └── DeletePersonButton.tsx
│   │   ├── settings/             # ✅ Implemented
│   │   │   ├── LinkProfileSection.tsx
│   │   │   ├── LanguageSelector.tsx     # ✅ Language switcher
│   │   │   └── ManageMembersSection.tsx # ✅ Admin user deletion
│   │   ├── tree/
│   │   │   ├── FamilyTree.tsx
│   │   │   └── TreeNode.tsx
│   │   └── media/
│   │       ├── MediaUploader.tsx
│   │       └── MediaGallery.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts         # Database client singleton
│   │   ├── auth.ts           # NextAuth configuration (Credentials provider + JWT)
│   │   ├── uploadthing.ts    # Uploadthing config
│   │   ├── utils.ts          # Helper functions (parseDateString for timezone-safe dates)
│   │   ├── email/            # ✅ Email templates
│   │   │   ├── new-account.ts       # ✅ Temporary password email
│   │   │   ├── password-reset.ts    # ✅ Reset token email
│   │   │   └── password-changed.ts  # ✅ Confirmation email
│   │   └── validations/      # ✅ Zod schemas
│   │       ├── person.ts     # Person + relationship validation
│   │       ├── entry.ts      # Entry validation + category constants
│   │       └── auth.ts       # ✅ Password validation schemas (login, changePassword, resetPassword)
│   │
│   ├── hooks/
│   │   ├── useEntries.ts
│   │   ├── usePeople.ts
│   │   └── useTimeline.ts
│   │
│   ├── types/
│   │   ├── index.ts          # Shared TypeScript types
│   │   └── next-auth.d.ts    # ✅ NextAuth type extensions (User, Session, JWT)
│   │
│   ├── i18n/
│   │   ├── config.ts         # Locale configuration (en, zh-TW)
│   │   ├── request.ts        # Server-side locale detection
│   │   └── client.ts         # Client-side locale switching
│   │
│   └── proxy.ts              # ✅ Route protection (Node.js runtime)
│
├── scripts/
│   ├── apply-migration.ts         # Apply SQL migrations to Turso
│   ├── migrate-admin-password.ts  # ✅ Set temp password for admin (one-time)
│   ├── test-turso.ts              # Test Turso database connection
│   └── test-resend.ts             # Test Resend email configuration
│
├── docs/
│   └── PASSWORD_AUTH_MIGRATION.md # ✅ Complete password auth migration docs
│
├── .env.local                # Local environment (gitignored)
├── .env.example              # Template for env vars
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```bash
# === Database (Turso) ===
TURSO_DATABASE_URL="libsql://your-database-name.turso.io"
TURSO_AUTH_TOKEN="your-auth-token"

# === Auth (NextAuth) ===
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# === Email (Resend) ===
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM="Family History <login@yourdomain.com>"

# === File Upload (Uploadthing) ===
UPLOADTHING_SECRET="sk_live_xxxxxxxxxx"
UPLOADTHING_APP_ID="your-app-id"
```

---

## External Service Setup

### 1. Turso (Database)
1. Sign up at https://turso.tech
2. Create a database: `turso db create family-history`
3. Get credentials: `turso db tokens create family-history`
4. Copy URL and token to `.env.local`

### 2. Resend (Email)

**Local Development:**
1. Sign up at https://resend.com
2. Create API key in dashboard
3. Copy API key to `.env.local`
4. Use `EMAIL_FROM="Family History <onboarding@resend.dev>"` for testing
   - Note: The test domain only sends to your Resend-registered email address

**Production Deployment (Required for multiple users):**

To send magic link emails to other family members, you must verify a custom domain:

1. Go to https://resend.com/domains → **Add Domain**
2. Enter a subdomain (recommended): `mail.yourdomain.com` or `contact.yourdomain.com`
   - Using a subdomain keeps transactional emails separate from your personal email
3. Resend will show you DNS records to add. Typically:
   | Type | Name | Purpose |
   |------|------|---------|
   | TXT | `resend._domainkey.subdomain` | DKIM (email signing) |
   | MX | `send.subdomain` | Bounce handling |
   | TXT | `send.subdomain` | SPF (sender authorization) |
   | TXT | `_dmarc.subdomain` | DMARC policy (optional) |
4. Add these records in your DNS provider (Squarespace, Cloudflare, etc.)
5. Return to Resend and click **Verify DNS**
   - DNS propagation can take 5 minutes to 48 hours
6. Once verified, update `EMAIL_FROM` in Vercel to use your domain:
   ```
   EMAIL_FROM="Family History <noreply@mail.yourdomain.com>"
   ```

**Testing Your Setup:**
```bash
# Test Resend API key validity
npx tsx scripts/test-resend.ts

# Send a test email (to your registered email only with test domain)
npx tsx scripts/test-resend.ts your-email@example.com
```

### 3. Uploadthing (File Storage)
1. Sign up at https://uploadthing.com
2. Create a new app
3. Copy secret and app ID to `.env.local`

### 4. Vercel (Hosting)
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard (see scoping table below)
3. Deploy automatically on push to main

**Environment Variable Scoping:**

Vercel has three environments: Production, Preview (branch/PR deploys), and Development.
Most variables should be available in all environments, but `NEXTAUTH_URL` is special:

| Variable | Scope | Value | Notes |
|----------|-------|-------|-------|
| `TURSO_DATABASE_URL` | All | `libsql://your-db.turso.io` | Same DB for all deploys |
| `TURSO_AUTH_TOKEN` | All | Your Turso token | Same credentials everywhere |
| `NEXTAUTH_SECRET` | All | `openssl rand -base64 32` | Must be consistent for sessions |
| `RESEND_API_KEY` | All | Your Resend key | Same email service |
| `EMAIL_FROM` | All | `Name <email@domain.com>` | Your verified domain |
| `NEXTAUTH_URL` | **Production only** | `https://your-app.vercel.app` | See note below |

**Why `NEXTAUTH_URL` is Production-only:**
- Preview deployments get dynamic URLs (e.g., `app-git-branch-user.vercel.app`)
- If `NEXTAUTH_URL` is set in Preview, magic link callbacks point to the wrong URL
- NextAuth v5 automatically uses Vercel's `VERCEL_URL` when `NEXTAUTH_URL` is not set
- By scoping to Production only, preview deploys auto-detect their correct callback URL

To configure in Vercel: Variable → Edit → Uncheck "Preview" and "Development" → Keep only "Production"

**Required: `trustHost: true` in NextAuth config:**
For NextAuth to auto-detect the URL from the request's Host header (when `NEXTAUTH_URL`
is not set), you must enable `trustHost: true` in `src/lib/auth.ts`. Without this,
NextAuth throws a "Configuration" error on preview deployments.

**Vercel Deployment Protection & Magic Links:**
Vercel's "Deployment Protection" feature can block magic link authentication on preview
deployments. When enabled, Vercel requires visitors to authenticate via Vercel SSO before
accessing the preview URL. This intercepts the magic link callback URL, preventing
NextAuth from receiving the authentication token.

Symptoms:
- User clicks magic link → briefly sees "Authenticating" → redirected to `vercel.com/login`
- The callback URL never reaches your app

Solutions:
1. **Disable for previews**: Vercel Dashboard → Settings → Deployment Protection →
   Turn off "Standard Protection" for Preview deployments
2. **Test on production**: Magic links work normally on production URLs since they're
   typically not protected
3. **Bypass for auth routes**: Some Vercel plans allow bypassing protection for specific
   paths (e.g., `/api/auth/*`), but this requires configuration

For development/testing, Option 1 or 2 is recommended. For a family app with limited
users, disabling preview protection is usually fine.

**Prisma + Vercel Caching Note:**
Vercel caches `node_modules` between deployments for faster builds. This can cause
issues with Prisma because the generated client lives in `node_modules/.prisma/client`.
To ensure the client is always properly generated, we use a `postinstall` script
instead of generating in the `build` script:
```json
"postinstall": "prisma generate",
"build": "next build"
```
This runs `prisma generate` right after `npm install`, before Vercel caches the modules.

---

## Database Schema Changes

When you need to modify the database (add fields, new tables, etc.), follow this workflow:

### Step 1: Edit the Schema

Open `prisma/schema.prisma` and make your changes:

```prisma
// Example: Adding a "featured" field to Entry
model Entry {
  id        String   @id @default(cuid())
  title     String
  content   String
  featured  Boolean  @default(false)  // ← New field
  // ... rest of fields
}
```

### Step 2: Generate New Migration SQL

```bash
# Generate SQL that describes the changes
npx prisma migrate diff \
  --from-empty \
  --to-schema prisma/schema.prisma \
  --script \
  | grep -v "dotenv" \
  | grep -v "Loaded Prisma" \
  > prisma/migration.sql
```

**Note:** The `grep -v` filters remove console output that would corrupt the SQL file.

### Step 3: Apply to Turso

```bash
npx tsx scripts/apply-migration.ts
```

The script will:
- Skip tables/indexes that already exist
- Create new tables and indexes
- Report success/failure for each statement

### Step 4: Regenerate Prisma Client

```bash
npx prisma generate
```

This updates the TypeScript types so your IDE knows about the new fields.

### Step 5: Update Local Dev Database

```bash
npx prisma db push
```

This syncs your local `prisma/dev.db` with the schema.

---

### Quick Reference Commands

```bash
# Full workflow (copy-paste friendly)
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script | grep -v "dotenv" | grep -v "Loaded Prisma" > prisma/migration.sql
npx tsx scripts/apply-migration.ts
npx prisma generate
npx prisma db push
```

### Viewing Your Database

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio

# View tables in Turso (if CLI installed)
turso db shell family-history
```

### Important Notes

1. **The migration script is additive** - it won't delete existing data when adding new fields
2. **For destructive changes** (removing columns, renaming tables), you may need to write custom SQL
3. **Always test locally first** - use `npx prisma db push` with local SQLite before applying to Turso
4. **Backup before major changes** - Turso dashboard lets you create database snapshots

---

## Authentication Flow

**Current Implementation:** Password-based authentication (migrated 2026-01-31)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD LOGIN FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User visits /login                                          │
│           │                                                     │
│           ▼                                                     │
│  2. Enters email + password                                     │
│           │                                                     │
│           ▼                                                     │
│  3. NextAuth Credentials provider validates password            │
│     - Finds user by email                                       │
│     - Compares password with bcrypt hash                        │
│           │                                                     │
│           ▼                                                     │
│  4. JWT session created with user data                          │
│     (id, email, role, requirePasswordChange)                    │
│           │                                                     │
│           ▼                                                     │
│  5. User redirected to /change-password                         │
│           │                                                     │
│           ▼                                                     │
│  6a. If requirePasswordChange=true:                             │
│      → Shows change password form                               │
│      → User sets new permanent password                         │
│      → Sets requirePasswordChange=false                         │
│      → Redirects to /dashboard                                  │
│                                                                 │
│  6b. If requirePasswordChange=false:                            │
│      → Auto-redirects to /dashboard (already logged in!)        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  NEW ACCOUNT CREATION FLOW                      │
│                   (Admin creates accounts)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin creates account (via migration script or future UI)   │
│           │                                                     │
│           ▼                                                     │
│  2. System generates temporary password (16 chars random)       │
│           │                                                     │
│           ▼                                                     │
│  3. Password hashed with bcrypt (10 rounds)                     │
│           │                                                     │
│           ▼                                                     │
│  4. User record created with:                                   │
│     - passwordHash                                              │
│     - requirePasswordChange = true                              │
│           │                                                     │
│           ▼                                                     │
│  5. Resend sends email with temporary password                  │
│     Subject: "Your Family History account has been created"     │
│           │                                                     │
│           ▼                                                     │
│  6. User clicks login link in email                             │
│           │                                                     │
│           ▼                                                     │
│  7. User logs in with email + temp password                     │
│     (follows PASSWORD LOGIN FLOW above, forced to change)       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   FORGOT PASSWORD FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User clicks "Forgot Password?" on login page                │
│           │                                                     │
│           ▼                                                     │
│  2. Enters email address                                        │
│           │                                                     │
│           ▼                                                     │
│  3. System generates reset token (32 bytes random hex)          │
│           │                                                     │
│           ▼                                                     │
│  4. User record updated with:                                   │
│     - resetToken (hashed)                                       │
│     - resetTokenExpiry (1 hour from now)                        │
│           │                                                     │
│           ▼                                                     │
│  5. Resend sends email with reset link                          │
│     Link: https://app.vercel.app/reset-password/[token]         │
│           │                                                     │
│           ▼                                                     │
│  6. User clicks link (within 1 hour)                            │
│           │                                                     │
│           ▼                                                     │
│  7. Token validated (not expired, matches hash)                 │
│           │                                                     │
│           ▼                                                     │
│  8. User enters new password                                    │
│           │                                                     │
│           ▼                                                     │
│  9. Password updated, reset token cleared                       │
│           │                                                     │
│           ▼                                                     │
│ 10. User redirected to /login with success message              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### 1. Entry Date Handling
Family stories often have imprecise dates ("sometime in the 1950s"). The schema supports:
- **datePrecision**: DECADE, YEAR, MONTH, DAY
- **dateApproximate**: Boolean for "around" dates
- **eventDateEnd**: For events spanning time periods

### 2. Person vs User
- **Person**: Any family member mentioned in stories (alive or deceased)
- **User**: Someone with app access who can contribute
- A User can optionally link to their Person record

**User-Person Linking (via Settings):**
Users link their account to a Person record through `/settings`, not during person creation.
This was chosen because:
1. Separation of concerns - creating family members is distinct from account linking
2. Flexibility - users might want to browse/add people before linking themselves
3. One-to-one integrity - each User can link to at most one Person (enforced by unique constraint)

The linking flow in Settings offers two options:
- **Create new**: Fill out a simplified Person form (just for yourself)
- **Link existing**: Select from People not already linked to another User

**Note:** The `relationship` field on Person (e.g., "Great-grandmother") was removed from the UI
as it's redundant - relationships are now tracked via `FamilyRelation` and user profile linking.

### 3. Category System
Pre-defined categories help with filtering and timeline display:
- STORY, BIRTH, DEATH, WEDDING, GRADUATION
- MIGRATION, MILITARY, CAREER, TRADITION
- RECIPE, PHOTO_MEMORY, DOCUMENT, OTHER

### 4. Family Tree Approach
Using a `FamilyRelation` join table allows flexible relationship modeling:
- Bidirectional relationships (parent ↔ child)
- Multiple relationship types
- Easy tree traversal queries

### 5. Proxy vs Middleware (Next.js 16)
Next.js 16 deprecates `middleware.ts` in favor of `proxy.ts`. We migrated for two reasons:
1. **Edge Runtime Size Limit**: The `middleware.ts` file ran on Edge Runtime with a 1MB size limit (Vercel free tier). Our NextAuth + Prisma bundle was 1.3MB, exceeding the limit.
2. **Node.js Runtime**: `proxy.ts` runs on Node.js runtime with no size restrictions, solving the deployment blocker.

The functionality is identical - route protection, auth checks, and redirects - but the runtime changed from Edge to Node.js.

### 6. Password Authentication (Migrated 2026-01-31)
Switched from magic link authentication to password-based authentication for better usability and control.

**Implementation:**
- NextAuth v5 with Credentials provider (email + password)
- JWT session strategy (required for Credentials provider)
- bcrypt password hashing with 10 rounds (industry standard)
- Temporary passwords: 16 chars cryptographically random via `crypto.randomBytes()`
- Password complexity requirements: min 8 chars, uppercase, lowercase, number

**Why password-based instead of magic links?**
- **Usability**: Magic links were confusing to users and unreliable (email delays, spam filters)
- **Control**: Admins create accounts directly rather than sending invitations
- **Simplicity**: No invitation system to manage (reduced code complexity)
- **Familiarity**: Users understand email + password authentication

**Session Management:**
- Sessions use JWT tokens (not database sessions) as required by Credentials provider
- Session includes: `id`, `email`, `name`, `role`, `requirePasswordChange`
- JWT callback refreshes user data from database on each request to keep `requirePasswordChange` flag current
- All sessions invalidated on password change (via database transaction)

**Temporary Password Flow:**
1. Admin creates account (currently via migration script, UI to be added)
2. System generates 16-char random password using `crypto.randomBytes()`
3. Password hashed with bcrypt (10 rounds), `requirePasswordChange=true` set
4. Email sent to user with temporary password prominently displayed
5. User logs in → automatically redirected to `/change-password`
6. Change password page checks `requirePasswordChange` flag:
   - If `true`: shows password change form (required)
   - If `false`: redirects to dashboard
7. After changing password, `requirePasswordChange` set to `false`, user can access app

**Password Reset Flow:**
1. User clicks "Forgot Password?" on login page
2. System generates 32-byte random hex token with 1-hour expiry
3. Token stored in `resetToken` field (user record), expiry in `resetTokenExpiry`
4. Email sent with reset link: `/reset-password/[token]`
5. User clicks link → token validated (not expired, matches hash)
6. User enters new password → password updated, reset token cleared
7. User redirected to login with success message

**Security Features:**
- Passwords never stored in plaintext (bcrypt hashing)
- Generic error messages to prevent email enumeration ("Invalid email or password")
- Reset tokens expire after 1 hour
- Session invalidation on password change prevents session fixation
- Password complexity enforced via Zod validation

**Migration from Magic Links:**
- Removed: Resend provider, PrismaAdapter, email gating system, invitation system
- Added: Credentials provider, JWT sessions, password fields in User model
- Migration script created for existing admin account (sets temp password)
- See `docs/PASSWORD_AUTH_MIGRATION.md` for complete migration documentation

---

### 7. Internationalization (i18n)
The app supports multiple languages using `next-intl`:

**Supported Languages:**
- English (en) - default
- Traditional Chinese (zh-TW) - 繁體中文

**Technical Implementation:**
- Cookie-based locale detection (no database storage required)
- Server components use `getTranslations()` for server-side translation
- Client components use `useTranslations()` hook
- Translation files in `messages/en.json` and `messages/zh-TW.json`
- Locale stored in `NEXT_LOCALE` cookie, persisted for 1 year
- Language selector in Settings page updates cookie and refreshes
- Bilingual LanguageSwitcher on home page and dashboard shows "English | 繁體中文" for discoverability

**File Structure:**
```
src/i18n/
├── config.ts     # Locale configuration + LOCALE_COOKIE_NAME constant
├── request.ts    # Server-side locale detection (reads cookie)
└── client.ts     # Client-side useLocale() hook for switching

messages/
├── en.json       # ~200 translation strings organized by namespace
└── zh-TW.json    # Traditional Chinese translations
```

**Usage Patterns:**

Server Components:
```typescript
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("namespace");
  return <h1>{t("title")}</h1>;
}
```

Client Components:
```typescript
"use client";
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("namespace");
  return <button>{t("label")}</button>;
}
```

ICU Message Format (pluralization):
```json
{
  "results": {
    "showing": "Showing {count, plural, one {# entry} other {# entries}}"
  }
}
```

**Important: Client/Server Boundary**
Shared constants like `LOCALE_COOKIE_NAME` must be defined in `config.ts` (not `request.ts`) because `request.ts` imports `next/headers` which is server-only. Client components importing from a server-only file will cause build errors.

**Why Traditional Chinese (zh-TW)?**
Traditional Chinese is preferred for family history/genealogical content as it preserves historical character forms. It's used in Taiwan, Hong Kong, and Macau.

**Font Support:**
Added Noto Sans TC (Traditional Chinese) font for proper Chinese character rendering.

---

### 8. User Deletion (Content Preservation)

When admins delete a user, their content is preserved to maintain family history integrity:

**Strategy: Preserve Content, Remove Attribution**
- Entries and Comments have `authorId` set to `null` (via Prisma's `onDelete: SetNull`)
- The UI displays "Unknown Author" (English) or "未知作者" (Chinese) for orphaned content
- The user's Person profile (if linked) is unlinked but NOT deleted, keeping them in the family tree
- Sessions and Accounts are cascade-deleted (user can no longer log in)

**Access Control:**
- Only admins can delete users
- The last admin cannot be deleted (prevents orphaning the family)
- Admins can delete themselves (if not the last admin) - they'll be signed out

**Implementation:**
```typescript
// src/actions/users.ts - deleteUser action
await prisma.$transaction(async (tx) => {
  // 1. Unlink Person profile (keeps Person in family tree)
  if (targetUser.personId) {
    await tx.user.update({ where: { id: userId }, data: { personId: null } });
  }
  // 2. Delete user (cascades sessions/accounts, sets null on entries/comments)
  await tx.user.delete({ where: { id: userId } });
});
```

**Schema (nullable foreign keys):**
```prisma
model Entry {
  author    User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)
  authorId  String? // Nullable to preserve entries when user deleted
}

model Comment {
  author    User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)
  authorId  String? // Nullable to preserve comments when user deleted
}

model Invitation {
  invitedBy   User?   @relation(fields: [invitedById], references: [id], onDelete: SetNull)
  invitedById String? // Nullable to preserve invitation records
}
```

**Why preserve content?**
In a family history app, entries represent irreplaceable memories and stories contributed over time.
Deleting a user account shouldn't erase their contributions to the family archive.

---

### 9. Turso Schema Migrations (SQLite Limitations)

SQLite (which Turso uses) has limited `ALTER TABLE` support:
- Cannot `DROP COLUMN` when foreign keys reference the table
- Cannot `DROP CONSTRAINT` directly
- `PRAGMA foreign_keys=OFF` may not persist across queries in Turso GUI

**Workaround: Table Rebuild Pattern**

When you need to remove a column or constraint, rebuild the table:

```sql
-- Step 1: Create new table without the unwanted column
CREATE TABLE TableName_new (
  -- ... all columns EXCEPT the one to remove
);

-- Step 2: Copy data
INSERT INTO TableName_new SELECT col1, col2, ... FROM TableName;

-- Step 3: Rename tables (avoids FK issues vs DROP)
ALTER TABLE TableName RENAME TO TableName_old;
ALTER TABLE TableName_new RENAME TO TableName;

-- Step 4: Optionally drop old table later (may fail if FKs reference it)
-- DROP TABLE TableName_old;
```

**Note:** If `DROP TABLE TableName_old` fails due to FK constraints, you can leave it.
The `_old` table won't affect your app - it's just orphaned data.

---

### 10. Foreign Key Synchronization (Critical for Table Rebuilds)

**Problem:** When you rebuild a table (like User), foreign keys in OTHER tables may still point to the old table.

**Example Issue Fixed (2026-01-31):**
When we rebuilt the `User` table to remove `invitedById`, the `Entry` table's foreign key was still pointing to `User_old.id` instead of `User.id`. This caused `FOREIGN KEY constraint failed` errors when creating entries, even though all validation checks passed.

**Root Cause:**
SQLite foreign key constraints are embedded in the table schema. When you rebuild `User` → `User_new` → `User`, the Entry table's FK definition doesn't automatically update.

**How to Detect:**
```bash
# Check which tables foreign keys point to
npx tsx scripts/check-entries.ts

# Look for output like:
# Foreign keys on Entry table:
#   - Column: authorId -> User_old.id  ❌ BAD!
#   - Column: authorId -> User.id      ✅ GOOD!
```

**How to Fix:**
When you rebuild a table that other tables reference, you MUST also rebuild those tables:

1. **Identify dependent tables:**
   - Check `schema.prisma` for all models with foreign keys to the rebuilt table
   - In our case: `Entry`, `Comment`, `Account`, `Session` all reference `User`

2. **Rebuild each dependent table:**
   ```bash
   # Use the table rebuild pattern (see section 9)
   # Example: scripts/fix-entry-fk.sql
   ```

3. **Verify the fix:**
   ```bash
   npx tsx scripts/check-entries.ts
   # Should show: authorId -> User.id (not User_old.id)
   ```

**Prevention:**
- When using the table rebuild pattern, document which tables have FKs to the table being rebuilt
- After rebuilding a table, check all dependent tables' foreign keys
- Use `prisma/fresh-schema.sql` for clean database setup from scratch
- See comment in `schema.prisma` Entry model (line 116) for reminder

**Files:**
- `scripts/fix-entry-fk.sql` - Example fix for Entry table FK
- `scripts/apply-entry-fix.ts` - Script to apply FK fix
- `prisma/fresh-schema.sql` - Clean schema from scratch (correct FKs guaranteed)

---

## Future Extensibility

1. **Map View**: Location fields support geographic visualization
2. **AI Features**: Content structure supports summarization/generation
3. **Export**: Can generate PDF books, GEDCOM files, static sites
4. **Mobile App**: API-first design enables React Native app
5. **Collaboration**: Comment system can expand to suggestions/edits
