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
├── entries            Entry[] - Stories they authored
├── comments           Comment[]
├── person             Person? - Link to their Person record
```

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

Invitation
├── id                 String
├── email              String
├── token              String (unique)
├── role               Enum (ADMIN/MEMBER/VIEWER)
├── expiresAt          DateTime
├── usedAt             DateTime?
├── invitedBy          User
```

---

## Project Structure

```
our-family-history/
├── ARCHITECTURE.md           ← You are here
├── CHECKLIST.md              ← Implementation progress
├── README.md
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
│   │   │   ├── login/page.tsx
│   │   │   └── invite/[token]/page.tsx
│   │   │
│   │   ├── (main)/           # Protected routes
│   │   │   ├── layout.tsx    # App shell with nav
│   │   │   ├── dashboard/page.tsx
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
│   │   └── settings.ts       # Profile linking
│   │
│   ├── components/
│   │   ├── ui/               # Reusable primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── DatePicker.tsx
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
│   │   │   └── LinkProfileSection.tsx
│   │   ├── tree/
│   │   │   ├── FamilyTree.tsx
│   │   │   └── TreeNode.tsx
│   │   └── media/
│   │       ├── MediaUploader.tsx
│   │       └── MediaGallery.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts         # Database client singleton
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── uploadthing.ts    # Uploadthing config
│   │   ├── utils.ts          # Helper functions (parseDateString for timezone-safe dates)
│   │   └── validations/      # ✅ Zod schemas
│   │       ├── person.ts     # Person + relationship validation
│   │       └── entry.ts      # Entry validation + category constants
│   │
│   ├── hooks/
│   │   ├── useEntries.ts
│   │   ├── usePeople.ts
│   │   └── useTimeline.ts
│   │
│   ├── types/
│   │   └── index.ts          # Shared TypeScript types
│   │
│   └── proxy.ts              # ✅ Route protection (Node.js runtime)
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
2. Add environment variables in Vercel dashboard:
   - `TURSO_DATABASE_URL` - Your Turso database URL
   - `TURSO_AUTH_TOKEN` - Your Turso auth token
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `RESEND_API_KEY` - Your Resend API key
   - `EMAIL_FROM` - Your verified sending address
3. Deploy automatically on push to main

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

```
┌─────────────────────────────────────────────────────────────────┐
│                        MAGIC LINK FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User visits /login                                          │
│           │                                                     │
│           ▼                                                     │
│  2. Enters email address                                        │
│           │                                                     │
│           ▼                                                     │
│  3. NextAuth generates one-time token                           │
│           │                                                     │
│           ▼                                                     │
│  4. Resend sends email with magic link                          │
│     Link: https://app.vercel.app/api/auth/callback/resend?...   │
│           │                                                     │
│           ▼                                                     │
│  5. User clicks link in email                                   │
│           │                                                     │
│           ▼                                                     │
│  6. NextAuth verifies token, creates session                    │
│           │                                                     │
│           ▼                                                     │
│  7. User redirected to /dashboard (logged in!)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      INVITATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Admin visits /settings → Invite Family                      │
│           │                                                     │
│           ▼                                                     │
│  2. Enters family member's email + role (member/viewer)         │
│           │                                                     │
│           ▼                                                     │
│  3. System creates Invitation record with token                 │
│           │                                                     │
│           ▼                                                     │
│  4. Resend sends invitation email                               │
│     Link: https://app.vercel.app/invite/[token]                 │
│           │                                                     │
│           ▼                                                     │
│  5. Family member clicks link                                   │
│           │                                                     │
│           ▼                                                     │
│  6. Token validated, User created, logged in                    │
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

---

## Future Extensibility

1. **Map View**: Location fields support geographic visualization
2. **AI Features**: Content structure supports summarization/generation
3. **Export**: Can generate PDF books, GEDCOM files, static sites
4. **Mobile App**: API-first design enables React Native app
5. **Collaboration**: Comment system can expand to suggestions/edits
