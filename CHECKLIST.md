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

## Phase 3: Authentication
**Goal:** Set up NextAuth with magic link authentication via Resend

- [ ] Set up Resend account and get API key
- [ ] Create NextAuth configuration in `src/lib/auth.ts`
  - Configure Resend provider for magic links
  - Set up Prisma adapter
  - Configure session handling
  - Add callbacks for user creation
- [ ] Create auth API route `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Create login page `src/app/(auth)/login/page.tsx`
- [ ] Create auth middleware for protected routes
- [ ] Create invitation system
  - API route `src/app/api/invite/route.ts`
  - Invite page `src/app/(auth)/invite/[token]/page.tsx`
- [ ] Test magic link flow end-to-end
- [ ] Test invitation flow

**Files created:**
- `src/lib/auth.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/invite/[token]/page.tsx`
- `src/app/api/invite/route.ts`
- `src/middleware.ts`

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

## Phase 5: Entry System
**Goal:** Full CRUD for family history entries

- [ ] Create Entry API routes
  - [ ] `src/app/api/entries/route.ts` - GET all, POST new
  - [ ] `src/app/api/entries/[id]/route.ts` - GET, PUT, DELETE one
- [ ] Create Zod validation schemas in `src/lib/validations.ts`
- [ ] Create entry components
  - [ ] `src/components/entries/EntryCard.tsx`
  - [ ] `src/components/entries/EntryList.tsx`
  - [ ] `src/components/entries/EntryForm.tsx`
  - [ ] `src/components/entries/RichTextEditor.tsx` (use Tiptap or similar)
- [ ] Create entry pages
  - [ ] `src/app/(main)/entries/page.tsx` - List with filters
  - [ ] `src/app/(main)/entries/new/page.tsx` - Create form
  - [ ] `src/app/(main)/entries/[id]/page.tsx` - View detail
  - [ ] `src/app/(main)/entries/[id]/edit/page.tsx` - Edit form
- [ ] Create `src/hooks/useEntries.ts` for data fetching
- [ ] Implement filtering and sorting
- [ ] Test entry CRUD operations

**Files created:**
- `src/app/api/entries/route.ts`
- `src/app/api/entries/[id]/route.ts`
- `src/lib/validations.ts`
- `src/components/entries/*.tsx`
- `src/app/(main)/entries/**/*.tsx`
- `src/hooks/useEntries.ts`

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

## Phase 7: People Management
**Goal:** Manage family members who appear in stories

- [ ] Create People API routes
  - [ ] `src/app/api/people/route.ts`
  - [ ] `src/app/api/people/[id]/route.ts`
- [ ] Create people components
  - [ ] `src/components/people/PersonCard.tsx`
  - [ ] `src/components/people/PersonForm.tsx`
  - [ ] `src/components/people/PersonSelector.tsx` (for entry form)
  - [ ] `src/components/people/PersonList.tsx`
- [ ] Create people pages
  - [ ] `src/app/(main)/people/page.tsx` - List all
  - [ ] `src/app/(main)/people/[id]/page.tsx` - Profile with related entries
- [ ] Create `src/hooks/usePeople.ts`
- [ ] Link people to entries in EntryForm
- [ ] Test people management

**Files created:**
- `src/app/api/people/route.ts`
- `src/app/api/people/[id]/route.ts`
- `src/components/people/*.tsx`
- `src/app/(main)/people/**/*.tsx`
- `src/hooks/usePeople.ts`

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

## Phase 12: Settings & Admin
**Goal:** User settings and admin controls

- [ ] Create settings page `src/app/(main)/settings/page.tsx`
  - [ ] Profile editing
  - [ ] Notification preferences
  - [ ] Invite family members (for admins)
- [ ] Create admin user management (for admins)
- [ ] Add role-based access controls throughout app
- [ ] Test admin vs member vs viewer permissions

**Files created:**
- `src/app/(main)/settings/page.tsx`
- `src/components/settings/*.tsx`

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

## Phase 14: Deployment
**Goal:** Deploy to production on Vercel

- [ ] Ensure all environment variables documented
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel dashboard
  - [ ] TURSO_DATABASE_URL
  - [ ] TURSO_AUTH_TOKEN
  - [ ] NEXTAUTH_URL (production URL)
  - [ ] NEXTAUTH_SECRET
  - [ ] RESEND_API_KEY
  - [ ] EMAIL_FROM
  - [ ] UPLOADTHING_SECRET
  - [ ] UPLOADTHING_APP_ID
- [ ] Deploy to Vercel
- [ ] Test production deployment:
  - [ ] Magic link login works
  - [ ] Entries can be created
  - [ ] Photos upload successfully
  - [ ] Timeline displays correctly
  - [ ] Family tree renders
- [ ] (Optional) Configure custom domain
- [ ] Invite first family members!

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

**Last Updated:** 2025-01-25

**Current Phase:** 3 - Authentication (Ready to Start)

**Notes:**
- Phase 1 complete: Next.js 16 + TypeScript + Tailwind + all dependencies
- Phase 2 complete: Turso database with 14 tables, Prisma client configured
- Next: Set up Resend account and configure NextAuth with magic links

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
- API Routes: `src/app/api/`

### External Dashboards
- Turso: https://turso.tech/app
- Resend: https://resend.com/emails
- Uploadthing: https://uploadthing.com/dashboard
- Vercel: https://vercel.com/dashboard
