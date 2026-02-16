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
**Goal:** Password-based authentication with admin account creation

**Migration completed:** 2026-01-31 - Switched from magic links to password authentication

- [x] Set up Resend account and get API key (still used for password emails)
- [x] Create NextAuth configuration in `src/lib/auth.ts`
  - Configured Credentials provider for password authentication
  - JWT session strategy (required for Credentials provider)
  - Session callback includes user role and requirePasswordChange flag
  - JWT callback refreshes user data from database on each request
- [x] Create auth API route `src/app/api/auth/[...nextauth]/route.ts`
- [x] Create login page with password field `src/app/(auth)/login/page.tsx`
- [x] Create forgot password page `src/app/(auth)/forgot-password/page.tsx`
- [x] Create reset password page `src/app/(auth)/reset-password/[token]/page.tsx`
- [x] Create forced password change page `src/app/(main)/change-password/page.tsx`
- [x] Create error page `src/app/(auth)/login/error/page.tsx`
- [x] Create auth middleware for protected routes
- [x] Create SessionProvider for client components
- [x] Create landing page with sign-in CTA
- [x] Create dashboard page for authenticated users
- [x] Password authentication features
  - [x] bcrypt password hashing (10 rounds)
  - [x] Temporary password generation (16 chars)
  - [x] Password complexity validation (8+ chars, uppercase, lowercase, number)
  - [x] Password reset tokens (32 bytes random hex, 1-hour expiry)
  - [x] Session invalidation on password change
  - [x] Forced password change for new/reset accounts
- [x] Email templates
  - [x] New account with temporary password
  - [x] Password reset with token link
  - [x] Password changed confirmation
- [x] Admin migration script to set temporary password
- [x] Test complete authentication flow (login, change password, dashboard)

**Files created:**
- `src/lib/auth.ts` (updated - Credentials provider, JWT sessions)
- `src/types/next-auth.d.ts` (NEW - extend NextAuth types)
- `src/lib/validations/auth.ts` (NEW - password validation schemas)
- `src/actions/auth.ts` (NEW - password operations: createUserWithPassword, changePassword, resetUserPassword, etc.)
- `src/lib/email/new-account.ts` (NEW - temporary password email)
- `src/lib/email/password-reset.ts` (NEW - reset token email)
- `src/lib/email/password-changed.ts` (NEW - confirmation email)
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/(auth)/login/page.tsx` (updated - password field)
- `src/app/(auth)/login/LoginForm.tsx` (updated - credentials login)
- `src/app/(auth)/forgot-password/page.tsx` (NEW)
- `src/app/(auth)/reset-password/[token]/page.tsx` (NEW)
- `src/app/(main)/change-password/page.tsx` (NEW - forced password change)
- `src/app/(main)/change-password/ChangePasswordForm.tsx` (NEW)
- `src/app/(auth)/login/error/page.tsx`
- `src/middleware.ts` (later renamed to `src/proxy.ts`)
- `src/components/providers/SessionProvider.tsx`
- `src/app/page.tsx` (updated)
- `src/app/(main)/dashboard/page.tsx`
- `scripts/migrate-admin-password.ts` (NEW - admin password migration)
- `docs/PASSWORD_AUTH_MIGRATION.md` (NEW - comprehensive migration documentation)

**Files deprecated (invitation system removed):**
- `src/app/(auth)/login/check-email/page.tsx` (magic link flow)
- `src/app/(auth)/login/not-approved/page.tsx` (email gating)
- `src/app/(auth)/invite/[token]/page.tsx` (invitation landing)
- `src/lib/validations/invitation.ts` (invitation validation)
- `src/lib/email/invitation.ts` (invitation email)
- `src/actions/invitations.ts` (invitation CRUD)
- `src/components/settings/InviteFamilySection.tsx` (admin invitation UI)

---

## Phase 4: Core Layout & UI ✅
**Goal:** Create the app shell and reusable UI components

- [x] Create root layout with providers `src/app/layout.tsx`
- [x] Create main app layout `src/app/(main)/layout.tsx`
  - Auth-only shell (redirects unauthenticated users to /login)
  - Per-page headers via shared `PageHeader` component
  - No sidebar (card-based navigation on dashboard instead)
- [x] Create UI components in `src/components/ui/`
  - [x] Button (6 variants: primary, brand, danger, ghost, success, icon)
  - [x] Card (with interactive and padding options)
  - [x] Modal (with Escape key and backdrop click to close)
  - [x] Badge (sm/md sizes, 13 color options)
  - [x] Alert (error, success, info variants)
- [x] Create layout components in `src/components/layout/`
  - [x] PageHeader (dashboard variant + subpage variant with back button, title, actions)
  - [x] Footer (app version display)
- [x] Create landing page `src/app/page.tsx`
- [x] Create dashboard page `src/app/(main)/dashboard/page.tsx`
- [x] Add global styles and Tailwind customizations

**Design Decision: PageHeader over Shared Layout Header**
> Next.js App Router layouts cannot receive per-page props. Since each page needs
> different back links, titles, and action buttons, the header is rendered by each
> page via a shared `PageHeader` component rather than in the layout. The layout
> handles only auth gating. This is the recommended App Router pattern.

**Design Decision: No Sidebar Navigation**
> Instead of a traditional sidebar, the app uses card-based navigation on the
> dashboard (5 quick-action cards). Sub-pages use back arrows to navigate up.
> This is simpler for a family app with a shallow page hierarchy.

**Files created:**
- `src/app/layout.tsx`
- `src/app/(main)/layout.tsx` (auth shell)
- `src/app/page.tsx`
- `src/app/(main)/dashboard/page.tsx`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Alert.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/index.ts` (barrel exports)
- `src/components/layout/PageHeader.tsx` (shared header: dashboard + subpage variants)
- `src/components/layout/Footer.tsx`
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

## Phase 5b: Rich Text Editor
**Goal:** Replace plain textarea with Tiptap WYSIWYG editor for entry stories

- [ ] Install Tiptap packages (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/pm`)
- [ ] Create `src/components/entries/RichTextEditor.tsx` — Tiptap editor with toolbar
  - Bold, italic, headings (H2, H3), bullet list, ordered list, blockquote, links
  - Styled toolbar matching existing Tailwind design
  - Hidden input carries HTML content into form's FormData
- [ ] Replace `<textarea>` in `EntryForm.tsx` with `RichTextEditor`
- [ ] Update entry detail page to render HTML content safely (sanitized with DOMPurify)
- [ ] Update timeline/entry card to handle HTML in summaries (strip tags for preview)
- [ ] Add translation keys for toolbar labels (English + Traditional Chinese)
- [ ] Handle backward compatibility with existing plain-text entries
- [ ] Test with English and Chinese content

**Design Decisions:**
> **Tiptap over Novel**: Tiptap is headless (no opinionated UI), giving full control over toolbar
> styling to match the existing Tailwind design. Novel provides a Notion-like experience but
> is harder to customize.
>
> **HTML storage**: Content stored as HTML string in the existing `content` column. No schema
> changes needed. Simpler than Tiptap's JSON document format and easier to render on the
> detail page.
>
> **DOMPurify for sanitization**: Even though users are trusted (invite-only app), sanitizing
> HTML before rendering prevents accidental XSS from pasted content.

---

## Phase 5c: Location Map on Entry Detail Page
**Goal:** Show a Google Maps embed on entry detail pages when a location is set

- [ ] Add Google Maps embed to entry detail page (uses existing `location`, `locationLat`, `locationLng` fields)
- [ ] Add location input with optional geocoding to EntryForm (or keep as manual text + coordinates)
- [ ] Test with various locations

**Notes:**
> The Entry model already has `location String?`, `locationLat Float?`, and `locationLng Float?`
> fields in the Prisma schema. These are not currently surfaced in the UI. This phase wires
> them up with a static Google Maps embed on the entry detail page.

---

## Phase 6: Photo Uploads (Partially Complete)
**Goal:** Integrate Uploadthing for media uploads

### Step 1: Person Avatar Uploads ✅
- [x] Set up Uploadthing account and get credentials
- [x] Create Uploadthing configuration `src/lib/uploadthing.ts`
- [x] Create upload API route `src/app/api/uploadthing/route.ts`
- [x] Create `src/components/people/AvatarUploader.tsx` — reusable avatar upload component
- [x] Integrate avatar upload into PersonForm (appears above name fields)
- [x] Update `createPerson` and `updatePerson` server actions to handle `avatarUrl`
- [x] Add translation keys for photo upload UI (English + Traditional Chinese)
- [x] Test upload flow (upload, preview, remove, save)

### Step 2: Entry Media Uploads (Pending)
- [ ] Create media components
  - [ ] `src/components/media/MediaUploader.tsx`
  - [ ] `src/components/media/MediaGallery.tsx`
  - [ ] `src/components/media/ImagePreview.tsx`
- [ ] Integrate uploads into EntryForm
- [ ] Add media display to entry detail page
- [ ] Test entry media upload flow

**Files created:**
- `src/lib/uploadthing.ts` — Uploadthing file router with `avatarUploader` endpoint (4MB image limit, auth middleware)
- `src/app/api/uploadthing/route.ts` — Next.js API route handler for Uploadthing
- `src/components/people/AvatarUploader.tsx` — Client component with upload preview, loading state, error handling

**Files modified:**
- `src/actions/people.ts` — Added `avatarUrl` to `rawData` in `createPerson` and `updatePerson`
- `src/components/people/PersonForm.tsx` — Integrated `AvatarUploader` at top of form
- `messages/en.json` — Added `people.form.photoLabel`, `uploadPhoto`, `removePhoto`, `uploading`
- `messages/zh-TW.json` — Same keys in Traditional Chinese

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

## Phase 8: Timeline View ✅
**Goal:** Visual chronological display of family history

**Design Decision:** Build custom vertical timeline with Tailwind CSS (no external library).
Architecture supports future timeline styles (horizontal, year-grouped cards).

### Step 1: Date Utilities
- [x] Add `formatEventDate()` helper to `src/lib/utils.ts`
  - Handles date precision (DECADE → "1950s", YEAR → "1952", MONTH → "May 1952", DAY → "May 15, 1952")
  - Handles approximate dates (`~` prefix)
- [x] Add `getEventYear()` helper for year grouping

### Step 2: Timeline Page
- [x] Create `src/app/(main)/timeline/page.tsx`
  - Server component with data fetching
  - Query entries ordered by `eventDate ASC`
  - Filter by URL params: `?category=BIRTH&personId=abc&startDate=1950-01-01&endDate=2000-12-31`
  - Handle entries without dates (show in "Undated" section)
  - Only show published entries

### Step 3: Timeline Event Component
- [x] Create `src/components/timeline/TimelineEvent.tsx`
  - Event card with category badge (with category-specific colors)
  - Title (linked to entry detail)
  - Summary or truncated content
  - Date with precision-aware formatting
  - People involved
  - Connector dot to timeline line (color matches category)

### Step 4: Vertical Timeline Renderer
- [x] Create `src/components/timeline/VerticalTimeline.tsx`
  - Central vertical line
  - Year markers when year changes
  - Events alternate left/right on desktop
  - Events stack on right on mobile
  - Responsive breakpoint at `md:`

### Step 5: Timeline Filters
- [x] Create `src/components/timeline/TimelineFilters.tsx` (client component)
  - Category dropdown (13 categories)
  - Person selector (fetches from `/api/people`)
  - Date range picker (start/end)
  - Updates URL params with `useRouter`
  - Collapsible with filter count badge
  - Quick-remove filter chips when collapsed

### Step 6: Polish & Edge Cases
- [x] Empty state when no entries match filters
- [x] Loading state (Suspense fallback)
- [x] "Undated" section for entries without eventDate
- [x] Mobile responsive design
- [x] Navigation link already exists on dashboard

**Verification Checklist:**
- [x] Entries display in chronological order (oldest first)
- [x] Year markers appear when year changes
- [x] Approximate dates show `~` prefix
- [x] Category filter works
- [x] Person filter shows only entries with that person
- [x] Date range filter works
- [x] Clicking event goes to entry detail
- [x] Filters persist in URL (shareable links)
- [x] Responsive: mobile stacks, desktop alternates

**Files created:**
- `src/lib/utils.ts` (modified - added formatEventDate, getEventYear)
- `src/app/(main)/timeline/page.tsx`
- `src/components/timeline/TimelineFilters.tsx`
- `src/components/timeline/VerticalTimeline.tsx`
- `src/components/timeline/TimelineEvent.tsx`

**Architecture Notes:**
> The timeline uses a pluggable renderer pattern. `VerticalTimeline` can be swapped
> with `HorizontalTimeline` or `YearGroupedCards` in the future without changing
> the data fetching or filter logic in the page component.

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

## Phase 12: Settings & Admin (Mostly Complete)
**Goal:** User settings and admin controls

- [x] Create settings page `src/app/(main)/settings/page.tsx`
  - [x] **User-Person Profile Linking** ← Key decision: users link to a Person in Settings
  - [ ] Profile editing (name, avatar)
  - [ ] Notification preferences
  - [x] **Invite family members (for admins)** ✅ Email gating system
- [x] Create profile linking components
  - [x] `src/components/settings/LinkProfileSection.tsx` - Link/create/unlink profile
  - [x] `src/actions/settings.ts` - Server actions for profile linking
- [x] **Create invitation system (email gating)**
  - [x] `src/components/settings/InviteFamilySection.tsx` - Admin invitation management UI
  - [x] `src/actions/invitations.ts` - Create/resend/revoke invitations
  - [x] `src/lib/email/invitation.ts` - Invitation email template
  - [x] `src/lib/validations/invitation.ts` - Zod validation schema
  - [x] `src/app/(auth)/invite/[token]/page.tsx` - Invitation landing page
  - [x] `src/app/(auth)/login/not-approved/page.tsx` - Rejection page for unapproved emails
- [x] Add Settings link (gear icon) to dashboard header
- [x] Create admin user management (for admins)
  - [x] `src/actions/users.ts` - deleteUser action (admin-only)
  - [x] `src/components/settings/ManageMembersSection.tsx` - User list with delete
  - [x] Last admin protection (cannot delete sole admin)
  - [x] Person profile unlinking before deletion (preserves family tree)
  - [x] Content preservation (entries/comments show "Unknown Author")
- [x] Add role-based access controls throughout app
  - [x] **Admin permissions for entries** - Admins can edit/delete any entry (not just their own)
  - [x] **Admin permissions for people** - Admins can edit/delete any person
  - [x] **VIEWER role security fix** - Block VIEWERs from editing people (critical vulnerability patched)
  - [x] **UI permission checks** - Edit/delete buttons show based on role and ownership
  - [x] **Direct URL protection** - Edit pages redirect unauthorized users
  - [x] **Translation support** - Added `errors.common.viewerReadOnly` error message
- [x] Test admin vs member vs viewer permissions

**Decision: User-Person Linking**
> Users can link their account to a Person record in the family tree via Settings.
> This establishes "who they are" in the family, enabling relationship-based features.
> Options: Create new Person profile OR link to existing unlinked Person.

**Decision: Email Gating (Invite-Only Access)**
> The app is invite-only to protect family privacy. An email is "approved" if:
> 1. It already exists as a User in the database, OR
> 2. It has a valid (non-expired, unused) Invitation record, OR
> 3. The database has zero users (first user bootstrap)
>
> Gating happens in the NextAuth `signIn` callback BEFORE the magic link is sent.
> This prevents strangers from even receiving authentication emails.

**Decision: User Deletion (Content Preservation)**
> When a user is deleted, their entries and comments are preserved to maintain family
> history. The `authorId` field is set to NULL (via Prisma's `onDelete: SetNull`),
> and the UI displays "Unknown Author" for orphaned content. The user's Person profile
> (if linked) is unlinked but not deleted, keeping them in the family tree.
> Only admins can delete users, and the last admin cannot be deleted.

**Cleanup: Removed User.invitedById field**
> The `invitedById` field on User (tracking "who invited this user") was removed.
> It was set during user creation but never displayed or used in the UI.
> The `Invitation` model still tracks who sent each invite - that's used in the admin UI.
> Removing this simplified the schema and eliminated a foreign key constraint that
> complicated user deletion. Required table rebuild in Turso (see ARCHITECTURE.md §9).

**Cleanup: Removed "Relationship to You" field**
> The text field for "Relationship to You" (e.g., "Great-grandmother") was removed from
> PersonForm and the profile page display. It was redundant since relationships are now
> tracked via the FamilyRelation system and user profile linking.

**Admin Role Permissions (2026-02-01)**
> Implemented comprehensive role-based authorization allowing ADMINs to edit all content
> while maintaining MEMBER/VIEWER restrictions. Also fixed a **critical security vulnerability**
> where VIEWERs could edit people due to missing role checks.

**Authorization Model:**
- **ADMIN**: Full access - can edit/delete any entry, person, or relationship
- **MEMBER**: Can edit own entries, can edit all people (collaborative family tree model)
- **VIEWER**: Read-only access - cannot create or edit anything

**Entry Module Changes:**
- `updateEntry`, `deleteEntry`, `togglePublish` now allow admin bypass using pattern:
  ```typescript
  if (session.user.role !== "ADMIN" && existingEntry.authorId !== session.user.id)
  ```
- Admins can edit "orphaned" entries (no author) for data cleanup
- UI: Entry detail/edit pages show edit buttons for admins even if not the author

**People Module Changes (SECURITY FIX):**
- **Before**: All authenticated users (including VIEWERs) could create/edit/delete people - NO role checks existed!
- **After**: All 5 people actions now block VIEWER role:
  - `createPerson`, `updatePerson`, `deletePerson`, `addRelationship`, `removeRelationship`
- Collaborative model: MEMBERs can edit all people (family history is shared, not individually owned)
- UI: People detail/edit pages hide edit buttons from VIEWERs

**Implementation Pattern:**
- **Inline role checks** (no helper functions) - more explicit and easier to audit
- **Server-side enforcement** in actions - UI buttons are convenience, not security
- **Direct URL protection** - Edit pages redirect unauthorized users
- **Consistent error messages** - `errors.common.viewerReadOnly` translated to English/Chinese

**Why collaborative model for people?**
> Unlike entries (personal stories with individual authorship), people are shared family
> entities. Multiple family members may have information about the same person (e.g., one
> adds birthdate, another adds biography). Only VIEWERs are restricted from editing.

**Files created:**
- `src/app/(main)/settings/page.tsx`
- `src/components/settings/LinkProfileSection.tsx`
- `src/components/settings/InviteFamilySection.tsx`
- `src/components/settings/ManageMembersSection.tsx` ← Admin user management UI
- `src/actions/settings.ts`
- `src/actions/invitations.ts`
- `src/actions/users.ts` ← User deletion action
- `src/lib/validations/invitation.ts`
- `src/lib/email/invitation.ts`
- `src/app/(auth)/login/not-approved/page.tsx`
- `src/app/(auth)/invite/[token]/page.tsx`

**Files modified:**
- `src/app/(main)/dashboard/page.tsx` (added Settings icon in header)
- `src/lib/auth.ts` (added signIn callback + updated createUser event, removed invitedById setting)
- `prisma/schema.prisma` (made authorId nullable on Entry/Comment/Invitation, removed invitedById from User)
- `src/app/(main)/entries/[id]/page.tsx` (handle null author gracefully, admin permission check)
- `src/app/(main)/entries/[id]/edit/page.tsx` (admin bypass for edit page access)
- `src/app/(main)/people/[id]/page.tsx` (hide edit buttons from VIEWERs)
- `src/app/(main)/people/[id]/edit/page.tsx` (redirect VIEWERs from edit page)
- `src/actions/entries.ts` (admin bypass for updateEntry, deleteEntry, togglePublish)
- `src/actions/people.ts` (VIEWER role blocks on all 5 functions - SECURITY FIX)
- `messages/en.json` (added entries.card.unknownAuthor, errors.common.viewerReadOnly)
- `messages/zh-TW.json` (added entries.card.unknownAuthor, errors.common.viewerReadOnly)

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

## Phase 14: Deployment (Ready)
**Goal:** Deploy to production on Vercel

- [x] Connect GitHub repo to Vercel
- [x] Fix build script for Vercel (`prisma generate && next build`)
- [x] Migrate `middleware.ts` to `proxy.ts` (fixes Edge Runtime 1MB size limit)
- [x] Configure environment variables in Vercel dashboard
  - [x] TURSO_DATABASE_URL (all environments)
  - [x] TURSO_AUTH_TOKEN (all environments)
  - [x] NEXTAUTH_URL (**Production only** - uncheck Preview/Development)
  - [x] NEXTAUTH_SECRET (all environments)
  - [x] RESEND_API_KEY (all environments)
  - [x] EMAIL_FROM (all environments)
  - [x] UPLOADTHING_TOKEN (Phase 6 — single token for Uploadthing v7)
  > **Important:** `NEXTAUTH_URL` must be scoped to Production only!
  > Preview deployments need to auto-detect their URL via Vercel's `VERCEL_URL`.
  > The NextAuth config uses `trustHost: true` to enable automatic URL detection for preview builds.
- [ ] Set up custom email domain in Resend (required for multiple users)
  - [ ] Add subdomain in Resend (e.g., `mail.yourdomain.com`)
  - [ ] Add DNS records (DKIM, MX, SPF, DMARC) in domain provider
  - [ ] Verify domain in Resend dashboard
  - [ ] Update EMAIL_FROM in Vercel to use verified domain
- [ ] Deploy to Vercel successfully
- [ ] Test production deployment:
  - [ ] Magic link login works
  - [ ] Entries can be created
  - [ ] Photos upload successfully
  - [ ] Timeline displays correctly
  - [ ] Family tree renders

> **Note:** Magic link testing on Preview deployments may fail if Vercel's
> "Deployment Protection" is enabled. The protection intercepts callback URLs
> and redirects to Vercel login. Either disable protection for previews
> (Settings → Deployment Protection) or test on Production where it's not enabled.
- [ ] (Optional) Configure custom domain
- [ ] Invite first family members!

**Build Fixes Applied:**
> 1. **Prisma client generation moved to `postinstall`** (not `build` script).
>    Vercel caches `node_modules` between deployments. If `prisma generate` runs
>    in the `build` script, the generated client in `node_modules/.prisma/client`
>    may be stale or missing due to caching. Moving it to `postinstall` ensures
>    the client is generated right after `npm install`, before caching occurs.
>    ```json
>    "postinstall": "prisma generate",
>    "build": "next build"
>    ```
>    Error this fixed: `Module not found: Can't resolve '.prisma/client/default'`
>
> 2. Migrated `middleware.ts` → `proxy.ts` to fix Edge Runtime 1MB size limit.
>    The NextAuth + Prisma bundle was 1.3MB, exceeding Vercel's free tier Edge limit.
>    `proxy.ts` runs on Node.js runtime with no size restrictions.

**Files changed:**
- `src/middleware.ts` → `src/proxy.ts` (renamed, same functionality)

**Files created:**
- `scripts/test-turso.ts` - Verify Turso database connection
- `scripts/test-resend.ts` - Verify Resend email configuration

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

## Phase 15: Internationalization (i18n) ✅ Mostly Complete
**Goal:** Multi-language support with English and Traditional Chinese

### Infrastructure Setup ✅
- [x] Install `next-intl` package
- [x] Create `src/i18n/config.ts` with locale configuration
- [x] Create `src/i18n/request.ts` for server-side locale detection
- [x] Create `src/i18n/client.ts` for client-side locale switching
- [x] Create `messages/en.json` with all UI strings
- [x] Create `messages/zh-TW.json` with Chinese translations
- [x] Update `next.config.ts` with next-intl plugin
- [x] Update `src/app/layout.tsx` with NextIntlClientProvider
- [x] Add Noto Sans TC (Traditional Chinese) font

### Core Pages ✅
- [x] Landing page (`src/app/page.tsx`)
- [x] Login page (`src/app/(auth)/login/page.tsx`)
- [x] Login form (`src/app/(auth)/login/LoginForm.tsx`)
- [x] Check email page
- [x] Not approved page
- [x] Error page
- [x] Dashboard page
- [x] Footer component
- [ ] Invite page

### Entry System ✅
- [x] Entry form component
- [x] Entry cards and list pages
- [x] Entry detail page
- [x] Delete entry button
- [x] Category labels
- [ ] Server action error messages

### People System ✅
- [x] Person form component
- [x] Person cards and list pages
- [x] Person detail page
- [x] Edit person page
- [x] Delete person button
- [x] Relationship types and dialog
- [x] Add relationship dialog

### Timeline & Settings ✅
- [x] Timeline page with translations
- [x] Timeline filters with all labels translated
- [x] Results summary with pluralization
- [x] Settings page with language selector
- [x] Account info translations
- [x] Link profile section translations
- [x] Invitation system translations (all strings)

### Validation & Polish ✅
- [x] Server actions use `getTranslations()` for error messages
- [x] All error messages in `errors.*` namespace
- [x] Validation errors use `validation.required` pattern
- [ ] Test date formatting with both locales (manual QA)
- [ ] Final QA in both languages (manual QA)

**Design Decisions:**
> **Cookie-based locale storage**: User's language preference is stored in a cookie
> (not in the database) for simplicity. Users can switch languages anytime from
> the Settings page; preference persists for 1 year via cookie.
>
> **Traditional Chinese (zh-TW)**: Chosen over Simplified Chinese because it
> preserves historical character forms, which is more appropriate for
> family history and genealogical content.
>
> **Client/Server Boundary**: Shared constants like `LOCALE_COOKIE_NAME` must live
> in a neutral config file (`src/i18n/config.ts`), not in server-only files like
> `request.ts`. This prevents "next/headers" import errors in client components.

**Implementation Patterns:**
> **Server Components** use `getTranslations()` from `next-intl/server`:
> ```typescript
> const t = await getTranslations("namespace");
> return <h1>{t("key")}</h1>;
> ```
>
> **Client Components** use `useTranslations()` hook from `next-intl`:
> ```typescript
> const t = useTranslations("namespace");
> return <button>{t("label")}</button>;
> ```
>
> **ICU Message Format** for pluralization and variables:
> ```json
> "showing": "Showing {count, plural, one {# entry} other {# entries}}"
> ```
> In Chinese, pluralization is simpler: `"顯示 {count} 筆記錄"`
>
> **Locale-aware date formatting** uses the current locale:
> ```typescript
> new Date(date).toLocaleDateString(locale === "zh-TW" ? "zh-TW" : "en-US", options);
> ```

**Files created:**
- `messages/en.json` (comprehensive translation file with ~200 strings)
- `messages/zh-TW.json` (Traditional Chinese translations)
- `src/i18n/config.ts` (locale configuration + cookie name constant)
- `src/i18n/request.ts` (server-side locale detection from cookie)
- `src/i18n/client.ts` (client-side locale switching hook)
- `src/components/settings/LanguageSelector.tsx` (language dropdown component)
- `src/components/LanguageSwitcher.tsx` (bilingual switcher for home page header)

**Files modified:**
- `next.config.ts` (added next-intl plugin)
- `src/app/layout.tsx` (added NextIntlClientProvider, Chinese font, dynamic lang)
- `src/app/page.tsx` (added translations)
- `src/app/(auth)/login/*` (added translations to all auth pages)
- `src/app/(main)/dashboard/page.tsx` (added translations + LanguageSwitcher)
- `src/app/(main)/entries/*` (added translations to all entry pages)
- `src/app/(main)/people/*` (added translations to all people pages)
- `src/app/(main)/timeline/page.tsx` (added translations)
- `src/app/(main)/settings/page.tsx` (added translations + LanguageSelector)
- `src/components/layout/Footer.tsx` (added translations)
- `src/components/entries/EntryCard.tsx` (converted to client component with translations)
- `src/components/entries/EntryForm.tsx` (added translations)
- `src/components/entries/DeleteEntryButton.tsx` (added translations)
- `src/components/people/PersonCard.tsx` (converted to client component with translations)
- `src/components/people/PersonForm.tsx` (added translations)
- `src/components/people/DeletePersonButton.tsx` (added translations)
- `src/components/people/RelationshipList.tsx` (added translations)
- `src/components/people/AddRelationshipDialog.tsx` (added translations)
- `src/components/timeline/TimelineFilters.tsx` (added translations)
- `src/components/settings/LinkProfileSection.tsx` (added translations)
- `src/components/settings/InviteFamilySection.tsx` (added translations)

---

## Current Status

**Last Updated:** 2026-02-15

**Current Phase:** 4 Complete, 5 Complete, 6 Partially Complete, 7 Complete, 8 Complete, 12 Complete, 14 In Progress, 15 Mostly Complete

**Completed Phases:**
- ✅ Phase 1: Project Setup - Next.js 16 + TypeScript + Tailwind
- ✅ Phase 2: Database Setup - Turso + Prisma with password auth fields
- ✅ Phase 3: Authentication - **Password-based auth** (migrated from magic links)
- ✅ Phase 4: Core Layout & UI - Shared layout, PageHeader, UI component library (Button, Card, Badge, Alert, Modal)
- ✅ Phase 5: Entry System - Full CRUD for stories with people linking
- ✅ Phase 7: People Management - Full CRUD + bidirectional relationships
- ✅ Phase 8: Timeline View - Chronological display with filters
- ✅ Phase 12: Settings & Admin - User-Person profile linking + **role-based permissions**
- 🔶 Phase 6: Photo Uploads (partially complete) - Person avatar uploads via Uploadthing
- 🔶 Phase 14: Deployment (in progress) - Vercel connected, build script fixed
- ✅ Phase 15: i18n (mostly complete) - English + Traditional Chinese for all UI pages

**Key Decisions Made:**
> **Password Authentication (2026-01-31)**: Switched from magic links to password-based
> authentication. Admins create accounts directly and system generates temporary passwords
> (16 chars random) sent via email. Users must change temp password on first login.
> JWT sessions used (required for Credentials provider). Session invalidated on password change.

> **User-Person Linking via Settings**: Users can link their account to a Person
> record in the family tree through `/settings`. This enables relationship-aware
> features and establishes "who you are" in the family.

> **Entry System MVP**: Using textarea for content (rich text editor deferred).
> Entries support 13 categories, date handling with approximate flag, and
> linking multiple people to each story.

> **Date Parsing Fix**: Created `parseDateString()` utility in `src/lib/utils.ts`
> to prevent timezone shift issues. HTML date inputs ("1979-01-15") are parsed
> at noon UTC to display correctly in all timezones.

> **Timeline Architecture**: The timeline uses a pluggable renderer pattern.
> `VerticalTimeline` can be swapped with `HorizontalTimeline` or `YearGroupedCards`
> in the future without changing the data fetching or filter logic.

> **Admin Role Permissions (2026-02-01)**: Implemented comprehensive role-based authorization.
> ADMINs can edit/delete any entry or person (bypassing ownership checks). MEMBERs can edit their
> own entries and all people (collaborative model). VIEWERs have read-only access. Fixed critical
> security vulnerability where VIEWERs could edit people due to missing role checks.

**What's Working:**
- **Password authentication (login → change password → dashboard)**
  - Login with email + password
  - Forced password change for temporary passwords
  - Forgot password / reset flow (email with token link, 1-hour expiry)
  - Password complexity validation (8+ chars, uppercase, lowercase, number)
  - bcrypt password hashing (10 rounds)
  - Session invalidation on password change
  - Admin can reset user passwords (generates new temp password)
- **Admin user management**
  - Admins can view all users in Settings → Manage Members
  - Admins can delete users (preserves their entries/comments as "Unknown Author")
  - Last admin protection prevents orphaning the family
  - User's Person profile is preserved in family tree when deleted
- **Role-based permissions (ADMIN/MEMBER/VIEWER)**
  - Admins can edit/delete ANY entry (not just their own)
  - Admins can edit/delete ANY person
  - Members can edit own entries, can edit all people (collaborative family model)
  - Viewers blocked from all editing operations (read-only access)
  - Security fix: VIEWERs can no longer edit people (vulnerability patched)
  - UI shows edit/delete buttons only when authorized
  - Direct URL navigation to edit pages redirects unauthorized users
- **Dashboard quick actions (5 navigation cards)**
  - New Entry, Manage People, View Timeline, View Stories (→ /entries), Settings
  - Card-based navigation with color-coded icons (BookOpen, Users, Clock, BookText, TreePine)
  - Responsive grid layout (1 col mobile → 2 col tablet → 4 col desktop with wrap)
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
- **Timeline view with:**
  - Vertical timeline with year markers
  - Category, person, and date range filtering
  - URL-based filters (shareable links)
  - Responsive design (alternating on desktop, stacked on mobile)
  - Category-specific color coding
  - Undated entries section
- **Internationalization (i18n) with:**
  - English and Traditional Chinese (zh-TW) support
  - Cookie-based locale persistence (1 year)
  - All pages translated: landing, auth, dashboard, entries, people, timeline, settings, password flows
  - Language selector in Settings page
  - Bilingual language switcher on home page and dashboard (shows "English | 繁體中文" for discoverability)
  - Noto Sans TC font for Chinese characters
  - ICU message format for pluralization and variable interpolation

**Next Steps:**
- Phase 5b: Rich Text Editor (Tiptap integration for entry stories)
- Phase 5c: Location Map on entry detail page (use existing location fields)
- Phase 6 Step 2: Entry media uploads (integrate MediaUploader into EntryForm, add MediaGallery to entry detail page)
- Phase 14: Vercel deployment ready (environment variables already configured)
- Phase 9: Family Tree visualization (interactive graph/tree view - different from chronological timeline)
- Optional: Create admin UI for account creation in Settings (currently via migration script only)

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
