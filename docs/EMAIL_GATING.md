# Email Gating: Invite-Only Access Control

This document describes the email gating system that provides invite-only access to the Family History app.

## Overview

The Family History app is private by design. Only pre-approved emails can receive magic links for authentication. This protects family privacy by ensuring strangers cannot access or contribute to the family archive.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                      EMAIL GATING FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User enters email on /login                                 │
│           │                                                     │
│           ▼                                                     │
│  2. NextAuth signIn callback triggered                          │
│           │                                                     │
│           ▼                                                     │
│  3. Check: Is email approved?                                   │
│           │                                                     │
│     ┌─────┴─────┐                                               │
│     │           │                                               │
│    YES          NO                                              │
│     │           │                                               │
│     ▼           ▼                                               │
│  4a. Send    4b. Redirect to                                    │
│  magic link  /login/not-approved                                │
│     │                                                           │
│     ▼                                                           │
│  5. User clicks link in email                                   │
│     │                                                           │
│     ▼                                                           │
│  6. Session created, user logged in                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Approval Criteria

An email is considered "approved" if ANY of these conditions are true:

1. **Existing User** - The email already exists in the `User` table
2. **Valid Invitation** - An `Invitation` record exists with:
   - Matching email (case-insensitive)
   - `usedAt` is NULL (not yet consumed)
   - `expiresAt` is in the future
3. **Bootstrap Mode** - The database has zero users (first user setup)

## Implementation Details

### 1. SignIn Callback (`src/lib/auth.ts`)

The gating logic lives in NextAuth's `signIn` callback:

```typescript
callbacks: {
  async signIn({ user, account, email }) {
    // Only gate verification requests (before magic link is sent)
    if (account?.provider === "resend" && email?.verificationRequest) {
      const userEmail = user.email?.toLowerCase();
      if (!userEmail) return "/login/not-approved";

      // Allow first user (bootstrap)
      const userCount = await prisma.user.count();
      if (userCount === 0) return true;

      // Allow existing users
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      if (existingUser) return true;

      // Allow valid invitations
      const invitation = await prisma.invitation.findFirst({
        where: {
          email: userEmail,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });
      if (invitation) return true;

      // Not approved
      return "/login/not-approved";
    }
    return true;
  },
}
```

**Key points:**
- `email?.verificationRequest` is `true` only when requesting a magic link (not when clicking it)
- Returning a string redirects to that path instead of sending the email
- Returning `true` allows the magic link to be sent

### 2. CreateUser Event (`src/lib/auth.ts`)

When a new user is created (after clicking the magic link), the invitation is consumed:

```typescript
events: {
  async createUser({ user }) {
    const userEmail = user.email?.toLowerCase();

    // Find and consume invitation
    const invitation = userEmail
      ? await prisma.invitation.findFirst({
          where: { email: userEmail, usedAt: null },
        })
      : null;

    if (invitation) {
      // Set role from invitation and mark as used
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: {
            role: invitation.role,
            invitedById: invitation.invitedById,
          },
        }),
        prisma.invitation.update({
          where: { id: invitation.id },
          data: { usedAt: new Date() },
        }),
      ]);
    } else {
      // First user becomes admin
      const userCount = await prisma.user.count();
      if (userCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    }
  },
}
```

### 3. Invitation Data Model (`prisma/schema.prisma`)

```prisma
model Invitation {
  id          String    @id @default(cuid())
  email       String                          // Recipient email
  token       String    @unique               // URL token for invite link
  role        String    @default("MEMBER")    // ADMIN, MEMBER, VIEWER
  expiresAt   DateTime                        // Expiration timestamp
  usedAt      DateTime?                       // NULL until used
  createdAt   DateTime  @default(now())

  invitedBy   User      @relation(fields: [invitedById], references: [id])
  invitedById String
}
```

## User Flows

### Flow 1: First User (Bootstrap)

```
1. Fresh deployment with empty database
2. Any email can sign in
3. First user automatically becomes ADMIN
4. Admin can then invite family members
```

### Flow 2: Existing User Sign-In

```
1. User enters their registered email
2. signIn callback finds them in User table
3. Magic link sent normally
4. User clicks link → logged in
```

### Flow 3: Invited User Sign-In

```
1. Admin creates invitation from Settings
2. Invitation email sent with unique token link
3. Invitee clicks link → lands on /invite/[token]
4. Token validated, invitee proceeds to /login
5. Email pre-filled, user requests magic link
6. signIn callback finds valid invitation → approved
7. Magic link sent
8. User clicks link → account created
9. createUser event consumes invitation, sets role
```

### Flow 4: Unapproved Email

```
1. Unknown email enters /login
2. signIn callback finds no user, no invitation
3. Redirect to /login/not-approved
4. User sees friendly message explaining invite requirement
```

## Admin Invitation Management

### Location
Settings page (`/settings`) → "Invite Family Members" section (admin only)

### Capabilities

| Action | Description |
|--------|-------------|
| **Create** | Send new invitation to email with selected role |
| **Resend** | Generate new token, extend expiry, send new email |
| **Revoke** | Delete pending invitation (link becomes invalid) |
| **View** | See all invitations grouped by status |

### Invitation Statuses

| Status | Meaning |
|--------|---------|
| **Pending** | Invitation sent, not yet used, not expired |
| **Accepted** | User clicked link and created account |
| **Expired** | Past expiration date, can be resent |

## Files Reference

### Core Gating Logic
| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config with signIn callback and createUser event |

### Invitation System
| File | Purpose |
|------|---------|
| `src/actions/invitations.ts` | Server actions: create, resend, revoke |
| `src/lib/validations/invitation.ts` | Zod schema for form validation |
| `src/lib/email/invitation.ts` | HTML email template using Resend |

### UI Pages
| File | Purpose |
|------|---------|
| `src/app/(auth)/login/not-approved/page.tsx` | Rejection page for unapproved emails |
| `src/app/(auth)/invite/[token]/page.tsx` | Landing page when clicking invite link |
| `src/components/settings/InviteFamilySection.tsx` | Admin UI for managing invitations |

## Edge Cases

### 1. Duplicate Invitations
**Scenario:** Admin tries to invite an email that already has a pending invitation.
**Handling:** Error message shown: "A pending invitation already exists. Use resend to send it again."

### 2. Already Registered Email
**Scenario:** Admin tries to invite an email that's already a user.
**Handling:** Error message shown: "This email is already registered."

### 3. Expired Invitation
**Scenario:** Invitee clicks link after expiration.
**Handling:** `/invite/[token]` page shows "Invitation Expired" with message to request new invitation.

### 4. Used Invitation
**Scenario:** Invitee clicks old link after already creating account.
**Handling:** `/invite/[token]` page shows "Already Accepted" with link to sign in.

### 5. Invalid Token
**Scenario:** Someone guesses or corrupts a token URL.
**Handling:** `/invite/[token]` page shows "Invalid Invitation" message.

### 6. Email Case Sensitivity
**Scenario:** User signs up as `John@Example.com`, later tries `john@example.com`.
**Handling:** All emails normalized to lowercase before checking.

### 7. Resend Extends Expiry
**Scenario:** Admin resends an invitation.
**Handling:** New token generated, expiry extended by 7 days from resend time.

## Security Considerations

### Why Gate at SignIn?

We intercept at the `signIn` callback (before email is sent) rather than after, because:

1. **No Email Leakage** - Unapproved addresses never receive any email
2. **Immediate Feedback** - Users know instantly if they need an invitation
3. **Reduced Attack Surface** - No tokens are generated for unapproved emails
4. **Privacy** - Unknown emails aren't stored in verification token table

### Token Security

- **Random Generation** - 32 bytes of cryptographically random data (64 hex chars)
- **Single Use** - Marked as used immediately upon account creation
- **Time Limited** - 7-day expiration by default
- **Regenerated on Resend** - Old tokens become invalid when admin resends

### Role Assignment

- Roles are set from the invitation, not user input
- Only admins can create invitations
- First user is always ADMIN (bootstrap security)

## Configuration

### Invitation Expiry
Default: 7 days

To change, modify `INVITATION_EXPIRY_DAYS` in `src/actions/invitations.ts`:

```typescript
const INVITATION_EXPIRY_DAYS = 7;
```

### Email Template
Located at `src/lib/email/invitation.ts`

Customize the HTML template for your family's branding.

## Testing the System

### Test 1: First User Bootstrap
1. Clear the database (or use fresh deployment)
2. Go to `/login`, enter any email
3. Verify magic link is sent
4. Click link, verify user created as ADMIN

### Test 2: Rejection Flow
1. Ensure at least one user exists
2. Go to `/login`, enter unknown email
3. Verify redirect to `/login/not-approved`
4. Verify no email was sent

### Test 3: Invitation Flow
1. Log in as admin
2. Go to Settings → Invite Family Members
3. Enter email, select role, send invitation
4. Check email received with invite link
5. Click link, verify landing page shows correct info
6. Proceed to sign in, verify magic link sent
7. Click magic link, verify account created with correct role

### Test 4: Expired Invitation
1. Create invitation
2. Manually set `expiresAt` to past date in database
3. Click invite link
4. Verify "Invitation Expired" message shown

### Test 5: Duplicate Prevention
1. Create invitation for email X
2. Try to create another for email X
3. Verify error message about existing invitation

## Troubleshooting

### "Magic link not sending"
- Check if email is approved (existing user or valid invitation)
- Check Resend API key in environment variables
- Check EMAIL_FROM matches verified domain in Resend

### "Invitation email not received"
- Check spam folder
- Verify Resend domain is configured for production
- Test domain only sends to Resend account owner's email

### "User created without correct role"
- Check invitation wasn't already used (`usedAt` should be NULL)
- Check invitation hasn't expired
- Check email case matches (should be normalized)

### "Admin can't see Invite section"
- Verify user's role is "ADMIN" in database
- Verify using correct account (check Settings → Account → Role)
