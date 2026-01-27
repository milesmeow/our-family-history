# Claude Code Instructions

> Instructions for Claude when working on this project.

## Project Context

This is a **Family History App** - a full-stack Next.js application for preserving family stories, photos, and memories. Multiple family members can contribute and view content on a timeline and family tree.

**Key Documentation:**
- `ARCHITECTURE.md` - Tech stack, data models, project structure, design decisions
- `CHECKLIST.md` - Implementation progress, phase tracking, what's complete/pending

## Critical Rule: Always Update Documentation

**After completing any feature work, you MUST update the documentation:**

### 1. Update CHECKLIST.md
- Mark completed items with `[x]`
- Add any new files created to the "Files created" section
- Update the "Current Status" section at the bottom with:
  - New completed phases
  - What's currently working
  - Any key decisions made
  - Suggested next steps

### 2. Update ARCHITECTURE.md (when applicable)
- Add new design decisions to "Key Design Decisions" section
- Update "Project Structure" when adding new directories or significant files
- Document any architectural patterns introduced

### 3. When to Update
- After completing a feature or phase
- After making architectural decisions
- After adding new routes, components, or server actions
- Before ending a session (summarize what was done)

## Tech Stack Quick Reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Turso (distributed SQLite) |
| ORM | Prisma with @prisma/adapter-libsql |
| Auth | NextAuth v5 + Resend (magic links) |
| Styling | Tailwind CSS |
| Icons | Lucide React |

## Code Patterns

### Server Actions
- Location: `src/actions/*.ts`
- Use `"use server"` directive
- Return `ActionResult` type: `{ success: true } | { success: false; error: string }`
- Always check `await auth()` for authorization
- Use `revalidatePath()` after mutations
- Place `redirect()` OUTSIDE try-catch blocks (it throws NEXT_REDIRECT internally)

### Form Handling
- Use React 19's `useActionState` hook
- Server actions need signature: `(prevState: ActionResult | null, formData: FormData)`
- Validate with Zod schemas from `src/lib/validations/`

### Database
- Prisma client singleton: `src/lib/prisma.ts`
- Adapter must be created inside singleton function (concurrency fix)
- Use transactions for multi-step operations: `prisma.$transaction()`

### API Routes
- Location: `src/app/api/*/route.ts`
- Always check session: `const session = await auth()`
- Return `NextResponse.json()` with appropriate status codes

## Current State (Auto-Updated)

See `CHECKLIST.md` → "Current Status" section for the latest progress.

## Session Start Checklist

When starting a new session:
1. Read `CHECKLIST.md` to understand current progress
2. Check "Current Status" for what's working and what's next
3. Read relevant sections of `ARCHITECTURE.md` for context on the area you're working on

## Session End Checklist

Before ending a session:
1. Update `CHECKLIST.md` with completed work
2. Update `ARCHITECTURE.md` if architectural decisions were made
3. Ensure the build passes: `npm run build`
4. Summarize what was accomplished for the user
