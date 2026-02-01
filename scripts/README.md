# Database Scripts

Utility scripts for managing the Turso database schema and data.

## Quick Reference

```bash
# Verify database schema is correct
npm run db:verify

# List all users in database
npm run db:check-users

# Clean up orphaned tables (_old, _new)
npm run db:cleanup

# Test Turso connection
npm run db:test
```

## Schema Verification

### `verify-schema.ts`
Checks that all foreign keys point to the correct tables.

**Run after:**
- Any table rebuild operation
- Cloning the repository for the first time
- Before deploying to production

**What it checks:**
- Entry.authorId → User.id (not User_old!)
- Comment.authorId → User.id (not User_old!)
- Comment.entryId → Entry.id
- Foreign keys are enabled
- Identifies orphaned tables

```bash
npm run db:verify
```

## Foreign Key Fixes

### `fix-entry-fk.sql` + `apply-entry-fix.ts`
Rebuilds the Entry table to point foreign keys to the correct User table.

**When to use:** If `npm run db:verify` shows Entry.authorId → User_old

```bash
npx tsx scripts/apply-entry-fix.ts
```

### `fix-comment-fk.sql` + `apply-comment-fix.ts`
Rebuilds the Comment table to point foreign keys to the correct User table.

**When to use:** If `npm run db:verify` shows Comment.authorId → User_old

```bash
npx tsx scripts/apply-comment-fix.ts
```

## Database Inspection

### `check-users.ts`
Lists all users with their IDs, emails, roles, and linked Person profiles.

```bash
npm run db:check-users
```

**Output:**
```
User 1:
  ID: cmkuxzt810000upzadsb41a36
  Email: admin@example.com
  Name: Admin User
  Role: ADMIN
  PersonID: cmkvokv510000bjzapscxs0o7

Total users: 4
```

### `check-entries.ts`
Shows Entry table foreign key constraints.

```bash
npx tsx scripts/check-entries.ts
```

### `check-comment-schema.ts`
Shows Comment table schema and foreign keys.

```bash
npx tsx scripts/check-comment-schema.ts
```

### `check-orphaned-entries.ts`
Finds entries with invalid authorIds (deleted users).

```bash
npx tsx scripts/check-orphaned-entries.ts
```

## Cleanup

### `cleanup-orphaned-tables.ts`
Removes tables ending in `_old` or `_new` left over from migrations.

**Safe to run:** These tables are orphaned data that don't affect the app.

```bash
npm run db:cleanup
```

## Testing

### `test-turso.ts`
Verifies Turso database connection and counts records.

```bash
npm run db:test
```

### `test-resend.ts`
Tests Resend email configuration.

```bash
npx tsx scripts/test-resend.ts
```

## Migration Scripts

### `apply-migration.ts`
Applies SQL migrations to Turso database.

```bash
npx tsx scripts/apply-migration.ts
```

### `migrate-admin-password.ts`
One-time script to set temporary password for admin user.

**Run once during initial setup.**

```bash
npx tsx scripts/migrate-admin-password.ts
```

## Fresh Schema Setup

### `prisma/fresh-schema.sql`
Complete database schema with all correct foreign keys.

**When to use:**
- Setting up a new database from scratch
- After major schema changes
- When foreign key issues are too complex to fix incrementally

**How to use:**
1. Backup your current database (Turso dashboard)
2. Drop all tables (or create new database)
3. Run the fresh schema SQL

## Common Workflows

### After Rebuilding a Table

1. **Rebuild the table** (e.g., User → User_new → User)
2. **Check dependent tables:**
   ```bash
   npm run db:verify
   ```
3. **Fix any broken foreign keys:**
   ```bash
   npx tsx scripts/apply-entry-fix.ts
   npx tsx scripts/apply-comment-fix.ts
   ```
4. **Verify again:**
   ```bash
   npm run db:verify
   ```
5. **Clean up orphaned tables** (optional):
   ```bash
   npm run db:cleanup
   ```

### Before Deploying

```bash
# Verify schema
npm run db:verify

# Check users
npm run db:check-users

# Test database connection
npm run db:test

# Build
npm run build
```

## Important Notes

⚠️ **SQLite Foreign Key Gotcha:**
When you rebuild a table that other tables reference, the foreign keys in those other tables may still point to the old table (e.g., User_old). Always verify and fix dependent tables after rebuilding.

✅ **Prevention:**
Run `npm run db:verify` after any schema changes to catch FK issues early.

📚 **Documentation:**
See `ARCHITECTURE.md` section 10 for detailed explanation of the foreign key synchronization issue.
