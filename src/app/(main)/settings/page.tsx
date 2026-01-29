import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { LinkProfileSection } from "@/components/settings/LinkProfileSection";
import { InviteFamilySection, type InvitationWithStatus } from "@/components/settings/InviteFamilySection";
import { ManageMembersSection, type UserForManagement } from "@/components/settings/ManageMembersSection";
import { LanguageSelector } from "@/components/settings/LanguageSelector";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

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

  // Fetch invitations and users if user is admin
  let initialInvitations: InvitationWithStatus[] = [];
  let allUsers: UserForManagement[] = [];

  if (user.role === "ADMIN") {
    // Fetch invitations
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

    // Fetch all users for member management
    const users = await prisma.user.findMany({
      orderBy: [
        { role: "asc" }, // ADMINs first
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    allUsers = users;
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
              <span className="sr-only">{tCommon("back")}</span>
            </Link>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("account.title")}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500">{t("account.email")}</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <label className="text-sm text-gray-500">{t("account.name")}</label>
                <p className="text-gray-900">{user.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-500">{t("account.role")}</label>
              <p className="text-gray-900">{t(`invitations.roles.${user.role}`)}</p>
            </div>
          </div>
        </section>

        {/* Language Selection */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <LanguageSelector />
        </section>

        {/* Profile Linking */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <LinkProfileSection linkedPerson={user.person} />
        </section>

        {/* Invite Family Members (Admin only) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <InviteFamilySection initialInvitations={initialInvitations} />
          </section>
        )}

        {/* Manage Members (Admin only) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ManageMembersSection users={allUsers} currentUserId={session.user.id} />
          </section>
        )}
      </main>
    </div>
  );
}
