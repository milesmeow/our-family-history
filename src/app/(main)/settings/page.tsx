import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { LinkProfileSection } from "@/components/settings/LinkProfileSection";
import { InviteFamilySection, type InvitationWithStatus } from "@/components/settings/InviteFamilySection";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user with their linked person
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      person: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch invitations if user is admin
  let initialInvitations: InvitationWithStatus[] = [];
  if (user.role === "ADMIN") {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: {
          select: { name: true, email: true },
        },
      },
    });

    const now = new Date();
    initialInvitations = invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      createdAt: inv.createdAt,
      expiresAt: inv.expiresAt,
      usedAt: inv.usedAt,
      invitedBy: inv.invitedBy,
      status: inv.usedAt
        ? ("accepted" as const)
        : inv.expiresAt < now
          ? ("expired" as const)
          : ("pending" as const),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/dashboard"
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <label className="text-sm text-gray-500">Name</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <p className="text-gray-900 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        </section>

        {/* Profile Linking */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LinkProfileSection linkedPerson={user.person} />
        </section>

        {/* Invite Family Members (Admin only) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <InviteFamilySection initialInvitations={initialInvitations} />
          </section>
        )}
      </main>
    </div>
  );
}
