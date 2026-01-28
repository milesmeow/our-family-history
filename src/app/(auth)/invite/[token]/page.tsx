import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Mail, Clock, CheckCircle, XCircle, Users } from "lucide-react";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Find the invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      invitedBy: {
        select: { name: true },
      },
    },
  });

  // No invitation found
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </h1>
            <p className="text-gray-600 mb-6">
              This invitation link is not valid. It may have been revoked or the
              link is incorrect.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invitation already used
  if (invitation.usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Already Accepted
            </h1>
            <p className="text-gray-600 mb-6">
              This invitation has already been used. If you&apos;ve created your
              account, you can sign in below.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invitation expired
  if (invitation.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitation Expired
            </h1>
            <p className="text-gray-600 mb-6">
              This invitation has expired. Please ask a family member to send you
              a new invitation.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Valid invitation - show welcome page
  const inviterName = invitation.invitedBy?.name || "A family member";
  const roleText =
    invitation.role === "ADMIN"
      ? "an administrator"
      : invitation.role === "VIEWER"
        ? "a viewer"
        : "a family member";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-amber-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re Invited!
          </h1>
          <p className="text-gray-600 mb-6">
            {inviterName} has invited you to join our family history as{" "}
            {roleText}.
          </p>

          {/* Email badge */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-6">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span className="font-medium">{invitation.email}</span>
            </div>
          </div>

          {/* What to expect */}
          <div className="text-left bg-amber-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              What you&apos;ll be able to do:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• View family stories and photos</li>
              <li>• Explore the family tree</li>
              {invitation.role !== "VIEWER" && (
                <li>• Add your own memories and stories</li>
              )}
              {invitation.role === "ADMIN" && (
                <li>• Invite other family members</li>
              )}
            </ul>
          </div>

          {/* CTA */}
          <Link
            href={`/login?email=${encodeURIComponent(invitation.email)}`}
            className="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            Continue to Sign In
          </Link>

          <p className="mt-4 text-xs text-gray-500">
            You&apos;ll receive a magic link at the email above
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Preserving memories for generations to come
        </p>
      </div>
    </div>
  );
}
