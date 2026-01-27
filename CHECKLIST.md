# Family History App - Implementation Checklist

> **Instructions for new sessions:** Read this file and ARCHITECTURE.md to understand the project state and what to work on next. Update checkboxes as items are completed.

---

## Phase 1: Project Setup ✅
**Goal:** Initialize the Next.js project with all dependencies

- [x] Initialize Next.js 14+ with TypeScript, Tailwind, App Router
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  ```
- [x] Install core dependencies
  ```bash
  npm install @prisma/client @libsql/client @prisma/adapter-libsql
  npm install next-auth@beta @auth/prisma-adapter
  npm install resend
  npm install uploadthing @uploadthing/react
  npm install zod react-hook-form @hookform/resolvers
  npm install date-fns lucide-react
  npm install -D prisma
  ```
- [ ] Create `.env.local` from template (see ARCHITECTURE.md) ⏳ *Waiting for Turso/Resend setup*
- [x] Create `.env.example` for documentation
- [x] Update `.gitignore` to include:
  - `.env.local`
  - `prisma/*.db`
  - `.turso/`
- [x] Verify dev server runs: `npm run dev`

**Files created:**
- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `.env.local`
- `.env.example`

---

## Phase 2: Database Setup ✅
**Goal:** Configure Turso database with Prisma schema

- [x] Set up Turso account and create database (via web UI)
- [x] Initialize Prisma
- [x] Write complete schema in `prisma/schema.prisma`
  - User model (with NextAuth relations)
  - Entry model with all fields
  - Person model
  - FamilyRelation model
  - Tag model
  - Media model
  - Comment model
  - Invitation model
- [x] Configure Prisma for Turso/libSQL adapter
- [x] Create `src/lib/prisma.ts` client singleton
- [x] Apply schema to Turso: `npx tsx scripts/apply-migration.ts`
- [x] Generate Prisma client: `npx prisma generate`
- [ ] Create seed script `prisma/seed.ts` with sample data (optional, can do later)
- [x] Test database connection (14 tables created in Turso)

**Files created:**
- `prisma/schema.prisma`
- `prisma.config.ts`
- `prisma/migration.sql`
- `src/lib/prisma.ts`
- `scripts/apply-migration.ts`

---

## Phase 3: Authentication ✅
**Goal:** Set up NextAuth with magic link authentication via Resend

- [x] Set up Resend account and get API key
- [x] Create NextAuth configuration in `src/lib/auth.ts`
  - Configure Resend provider for magic links
  - Set up Prisma adapter
  - Configure session handling
  - Add callbacks for user creation (first user becomes admin)
- [x] Create auth API route `src/app/api/auth/[...nextauth]/route.ts`
- [x] Create login page `src/app/(auth)/login/page.tsx`
- [x] Create check-email page `src/app/(auth)/login/check-email/page.tsx`
- [x] Create error page `src/app/(auth)/login/error/page.tsx`
- [x] Create auth middleware for protected routes
- [x] Create SessionProvider for client components
- [x] Create landing page with sign-in CTA
- [x] Create dashboard page for authenticated users
- [ ] Create invitation system (can add later)
- [ ] Test magic link flow end-to-end ⏳

**Files created:**
- `src/lib/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/check-email/page.tsx`
- `src/app/(auth)/login/error/page.tsx`
- `src/middleware.ts`
- `src/components/providers/SessionProvider.tsx`
- `src/app/page.tsx` (updated)
- `src/app/(main)/dashboard/page.tsx`

---

## Phase 4: Core Layout & UI
**Goal:** Create the app shell and reusable UI components

- [ ] Create root layout with providers `src/app/layout.tsx`
- [ ] Create main app layout `src/app/(main)/layout.tsx`
  - Header with user info
  - Sidebar navigation
  - Responsive design
- [ ] Create UI components in `src/components/ui/`
  - [ ] Button
  - [ ] Card
  - [ ] Input
  - [ ] Textarea
  - [ ] Modal
  - [ ] Avatar
  - [ ] Badge
  - [ ] DatePicker
  - [ ] Select
- [ ] Create layout components in `src/components/layout/`
  - [ ] Header
  - [ ] Sidebar
  - [ ] Navigation
- [ ] Create landing page `src/app/page.tsx`
- [ ] Create dashboard page `src/app/(main)/dashboard/page.tsx`
- [ ] Add global styles and Tailwind customizations

**Files created:**
- `src/app/layout.tsx`
- `src/app/(main)/layout.tsx`
- `src/app/page.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/components/ui/*.tsx`
- `src/components/layout/*.tsx`
- `src/app/globals.css` (updated)

---

## Phase 5: Entry System ✅
**Goal:** Full CRUD for family history entries

- [x] Create Zod validation schemas in `src/lib/validations/entry.ts`
- [x] Create server actions `src/actions/entries.ts`
  - createEntry, updateEntry, deleteEntry, togglePublish
- [x] Create entry components
  - [x] `src/components/entries/EntryCard.tsx` - Card for list display
  - [x] `src/components/entries/EntryForm.tsx` - Create/edit form with useActionState
  - [x] `src/components/entries/PersonSelector.tsx` - Multi-select people to link
  - [x] `src/components/entries/DeleteEntryButton.tsx` - Delete with confirmation
- [x] Create entry pages
  - [x] `src/app/(main)/entries/page.tsx` - List with category filter
  - [x] `src/app/(main)/entries/new/page.tsx` - Create form
  - [x] `src/app/(main)/entries/[id]/page.tsx` - View detail with linked people
  - [x] `src/app/(main)/entries/[id]/edit/page.tsx` - Edit form
- [x] Implement category filtering
- [x] Link people to entries (PersonOnEntry many-to-many)
- [x] Draft/Published status toggle
- [x] Test entry CRUD operations

**MVP Notes:**
- Using textarea for content (rich text editor deferred)
- Media uploads deferred to Phase 6
- Tags and comments deferred to later phases

**Files created:**
- `src/lib/validations/entry.ts`
- `src/actions/entries.ts`
- `src/components/entries/EntryCard.tsx`
- `src/components/entries/EntryForm.tsx`
- `src/components/entries/PersonSelector.tsx`
- `src/components/entries/DeleteEntryButton.tsx`
- `src/app/(main)/entries/page.tsx`
- `src/app/(main)/entries/new/page.tsx`
- `src/app/(main)/entries/[id]/page.tsx`
- `src/app/(main)/entries/[id]/edit/page.tsx`

---

## Phase 6: Photo Uploads
**Goal:** Integrate Uploadthing for media uploads

- [ ] Set up Uploadthing account and get credentials
- [ ] Create Uploadthing configuration `src/lib/uploadthing.ts`
- [ ] Create upload API route `src/app/api/uploadthing/route.ts`
- [ ] Create media components
  - [ ] `src/components/media/MediaUploader.tsx`
  - [ ] `src/components/media/MediaGallery.tsx`
  - [ ] `src/components/media/ImagePreview.tsx`
- [ ] Integrate uploads into EntryForm
- [ ] Add media display to entry detail page
- [ ] Test upload flow

**Files created:**
- `src/lib/uploadthing.ts`
- `src/app/api/uploadthing/route.ts`
- `src/components/media/*.tsx`

---

## Phase 7: People Management ✅
**Goal:** Manage family members who appear in stories

- [x] Create People API routes
  - [x] `src/app/api/people/route.ts`
  - [x] `src/app/api/people/unlinked/route.ts` (for profile linking)
- [x] Create people components
  - [x] `src/components/people/PersonCard.tsx`
  - [x] `src/components/people/PersonForm.tsx`
  - [x] `src/components/people/RelationshipList.tsx`
  - [x] `src/components/people/AddRelationshipDialog.tsx`
  - [x] `src/components/people/DeletePersonButton.tsx`
- [x] Create people pages
  - [x] `src/app/(main)/people/page.tsx` - List all
  - [x] `src/app/(main)/people/new/page.tsx` - Create new person
  - [x] `src/app/(main)/people/[id]/page.tsx` - Profile with relationships
  - [x] `src/app/(main)/people/[id]/edit/page.tsx` - Edit person
- [x] Create server actions `src/actions/people.ts`
- [x] Implement bidirectional relationships (PARENT↔CHILD, SPOUSE↔SPOUSE, SIBLING↔SIBLING)
- [x] Test people CRUD and relationship management
- [ ] Link people to entries in EntryForm (Phase 5)

**Files created:**
- `src/lib/validations/person.ts`
- `src/actions/people.ts`
- `src/app/api/people/route.ts`
- `src/app/api/people/unlinked/route.ts`
- `src/components/people/PersonCard.tsx`
- `src/components/people/PersonForm.tsx`
- `src/components/people/RelationshipList.tsx`
- `src/components/people/AddRelationshipDialog.tsx`
- `src/components/people/DeletePersonButton.tsx`
- `src/app/(main)/people/page.tsx`
- `src/app/(main)/people/new/page.tsx`
- `src/app/(main)/people/[id]/page.tsx`
- `src/app/(main)/people/[id]/edit/page.tsx`

---

## Phase 8: Timeline View
**Goal:** Visual chronological display of family history

- [ ] Install timeline library
  ```bash
  npm install vis-timeline vis-data
  # OR
  npm install react-chrono
  ```
- [ ] Create timeline components
  - [ ] `src/components/timeline/Timeline.tsx` - Main visualization
  - [ ] `src/components/timeline/TimelineEvent.tsx` - Individual event
  - [ ] `src/components/timeline/TimelineFilters.tsx` - Filter controls
- [ ] Create timeline page `src/app/(main)/timeline/page.tsx`
- [ ] Create `src/hooks/useTimeline.ts` for data transformation
- [ ] Implement filtering by:
  - [ ] Date range
  - [ ] Category
  - [ ] Person
  - [ ] Tags
- [ ] Add click-to-view-entry functionality
- [ ] Add zoom and navigation controls
- [ ] Test timeline with various data

**Files created:**
- `src/components/timeline/*.tsx`
- `src/app/(main)/timeline/page.tsx`
- `src/hooks/useTimeline.ts`

---

## Phase 9: Family Tree
**Goal:** Visual family tree with relationship management

- [ ] Create family relation API routes
  - [ ] `src/app/api/relations/route.ts`
- [ ] Install tree visualization library (or build custom with SVG/Canvas)
- [ ] Create tree components
  - [ ] `src/components/tree/FamilyTree.tsx` - Main tree view
  - [ ] `src/components/tree/TreeNode.tsx` - Person node
  - [ ] `src/components/tree/RelationshipEditor.tsx` - Add/edit relations
- [ ] Create tree page `src/app/(main)/tree/page.tsx`
- [ ] Implement relationship management UI
- [ ] Add navigation from tree node to person profile
- [ ] Test tree with sample family data

**Files created:**
- `src/app/api/relations/route.ts`
- `src/components/tree/*.tsx`
- `src/app/(main)/tree/page.tsx`

---

## Phase 10: Comments & Discussion
**Goal:** Allow family members to discuss entries

- [ ] Create comments API routes
  - [ ] `src/app/api/comments/route.ts`
  - [ ] `src/app/api/entries/[id]/comments/route.ts`
- [ ] Create comment components
  - [ ] `src/components/comments/CommentList.tsx`
  - [ ] `src/components/comments/CommentForm.tsx`
  - [ ] `src/components/comments/Comment.tsx`
- [ ] Add comments section to entry detail page
- [ ] Test comment creation and display

**Files created:**
- `src/app/api/comments/route.ts`
- `src/app/api/entries/[id]/comments/route.ts`
- `src/components/comments/*.tsx`

---

## Phase 11: Search
**Goal:** Full-text search across entries

- [ ] Create search API route `src/app/api/search/route.ts`
- [ ] Implement search query logic (Turso FTS or application-level)
- [ ] Create search components
  - [ ] `src/components/search/SearchBar.tsx`
  - [ ] `src/components/search/SearchResults.tsx`
- [ ] Add search to header/navigation
- [ ] Implement search filters (person, date, category)
- [ ] Test search functionality

**Files created:**
- `src/app/api/search/route.ts`
- `src/components/search/*.tsx`

---

## Phase 12: Settings & Admin (Partially Complete)
**Goal:** User settings and admin controls

- [x] Create settings page `src/app/(main)/settings/page.tsx`
  - [x] **User-Person Profile Linking** ← Key decision: users link to a Person in Settings
  - [ ] Profile editing (name, avatar)
  - [ ] Notification preferences
  - [ ] Invite family members (for admins)
- [x] Create profile linking components
  - [x] `src/components/settings/LinkProfileSection.tsx` - Link/create/unlink profile
  - [x] `src/actions/settings.ts` - Server actions for profile linking
- [x] Add Settings link (gear icon) to dashboard header
- [ ] Create admin user management (for admins)
- [ ] Add role-based access controls throughout app
- [ ] Test admin vs member vs viewer permissions

**Decision: User-Person Linking**
> Users can link their account to a Person record in the family tree via Settings.
> This establishes "who they are" in the family, enabling relationship-based features.
> Options: Create new Person profile OR link to existing unlinked Person.

**Cleanup: Removed "Relationship to You" field**
> The text field for "Relationship to You" (e.g., "Great-grandmother") was removed from
> PersonForm and the profile page display. It was redundant since relationships are now
> tracked via the FamilyRelation system and user profile linking.

**Files created:**
- `src/app/(main)/settings/page.tsx`
- `src/components/settings/LinkProfileSection.tsx`
- `src/actions/settings.ts`

**Files modified:**
- `src/app/(main)/dashboard/page.tsx` (added Settings icon in header)

---

## Phase 13: Polish & UX
**Goal:** Production-ready user experience

- [ ] Add loading states (skeletons, spinners)
- [ ] Add error boundaries and error states
- [ ] Add toast notifications for actions
- [ ] Ensure responsive design on all pages
- [ ] Add empty states for lists
- [ ] Improve form validation feedback
- [ ] Add confirmation dialogs for destructive actions
- [ ] Test on mobile devices
- [ ] Performance optimization (lazy loading, image optimization)

---

## Phase 14: Deployment (In Progress)
**Goal:** Deploy to production on Vercel

- [x] Connect GitHub repo to Vercel
- [x] Fix build script for Vercel (`prisma generate && next build`)
- [x] Migrate `middleware.ts` to `proxy.ts` (fixes Edge Runtime 1MB size limit)
- [ ] Configure environment variables in Vercel dashboard
  - [ ] TURSO_DATABASE_URL
  - [ ] TURSO_AUTH_TOKEN
  - [ ] NEXTAUTH_URL (production URL)
  - [ ] NEXTAUTH_SECRET
  - [ ] RESEND_API_KEY
  - [ ] EMAIL_FROM
  - [ ] UPLOADTHING_SECRET (when Phase 6 implemented)
  - [ ] UPLOADTHING_APP_ID (when Phase 6 implemented)
- [ ] Deploy to Vercel successfully
- [ ] Test production deployment:
  - [ ] Magic link login works
  - [ ] Entries can be created
  - [ ] Photos upload successfully
  - [ ] Timeline displays correctly
  - [ ] Family tree renders
- [ ] (Optional) Configure custom domain
- [ ] Invite first family members!

**Build Fixes Applied:**
> 1. Prisma client must be generated during Vercel build. Updated `package.json`:
>    ```json
>    "build": "prisma generate && next build"
>    ```
> 2. Migrated `middleware.ts` → `proxy.ts` to fix Edge Runtime 1MB size limit.
>    The NextAuth + Prisma bundle was 1.3MB, exceeding Vercel's free tier Edge limit.
>    `proxy.ts` runs on Node.js runtime with no size restrictions.

**Files changed:**
- `src/middleware.ts` → `src/proxy.ts` (renamed, same functionality)

---

## Verification Checklist

After each phase, verify:

- [ ] **Auth:** Can login with magic link
- [ ] **Entries:** Can create, view, edit, delete stories
- [ ] **Photos:** Can upload and view images
- [ ] **People:** Can create family members and tag in stories
- [ ] **Timeline:** Entries appear chronologically, filters work
- [ ] **Tree:** Can add relationships, tree displays correctly
- [ ] **Comments:** Can add comments to entries
- [ ] **Search:** Can find entries by keyword
- [ ] **Mobile:** App works on phone/tablet

---

## Current Status

**Last Updated:** 2025-01-27

**Current Phase:** 5 Complete, 7 Complete, 12 Partial, 14 In Progress

**Completed Phases:**
- ✅ Phase 1: Project Setup - Next.js 16 + TypeScript + Tailwind
- ✅ Phase 2: Database Setup - Turso + Prisma with 14 tables
- ✅ Phase 3: Authentication - NextAuth + Resend magic links
- ✅ Phase 5: Entry System - Full CRUD for stories with people linking
- ✅ Phase 7: People Management - Full CRUD + bidirectional relationships
- 🔶 Phase 12: Settings (partial) - User-Person profile linking
- 🔶 Phase 14: Deployment (in progress) - Vercel connected, build script fixed

**Key Decisions Made:**
> **User-Person Linking via Settings**: Users can link their account to a Person
> record in the family tree through `/settings`. This enables relationship-aware
> features and establishes "who you are" in the family.

> **Entry System MVP**: Using textarea for content (rich text editor deferred).
> Entries support 13 categories, date handling with approximate flag, and
> linking multiple people to each story.

> **Date Parsing Fix**: Created `parseDateString()` utility in `src/lib/utils.ts`
> to prevent timezone shift issues. HTML date inputs ("1979-01-15") are parsed
> at noon UTC to display correctly in all timezones.

**What's Working:**
- Magic link authentication (login → email → dashboard)
- People management (create, edit, delete, view profiles)
- Family relationships (add/remove bidirectional PARENT/CHILD/SPOUSE/SIBLING)
- Settings page with profile linking (create new or link to existing Person)
- Entry/story management (create, edit, delete, view stories)
- Category filtering on entries list
- Linking people to stories (PersonOnEntry many-to-many)
- Draft/Published status for entries
- App version footer on all pages
- Timezone-safe date handling
- Route protection via `proxy.ts` (Node.js runtime)

**Next Steps:**
- Complete Phase 14: Configure Vercel environment variables, deploy
- Phase 6: Photo Uploads (Uploadthing integration)
- Phase 8: Timeline View (chronological visualization)

---

## Quick Reference

### Dev Commands
```bash
npm run dev          # Start development server
npx prisma studio    # Open database GUI
npx prisma migrate dev --name [name]  # Create migration
npx prisma generate  # Regenerate client after schema change
```

### Key Files
- Architecture: `ARCHITECTURE.md`
- Database Schema: `prisma/schema.prisma`
- Auth Config: `src/lib/auth.ts`
- Route Protection: `src/proxy.ts`
- Utilities: `src/lib/utils.ts`
- API Routes: `src/app/api/`
- Server Actions: `src/actions/`

### External Dashboards
- Turso: https://turso.tech/app
- Resend: https://resend.com/emails
- Uploadthing: https://uploadthing.com/dashboard
- Vercel: https://vercel.com/dashboard
