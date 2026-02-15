import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LinkProfileSection } from "@/components/settings/LinkProfileSection";
import { ManageMembersSection, type UserForManagement } from "@/components/settings/ManageMembersSection";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { CreateAccountSection } from "@/components/settings/CreateAccountSection";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function SettingsPage() {
  const session = await auth();

  const t = await getTranslations("settings");
  const tCommon = await getTranslations("common");

  // Fetch user with their linked person
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      person: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch users if user is admin
  let allUsers: UserForManagement[] = [];

  if (user.role === "ADMIN") {
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
      <PageHeader
        variant="subpage"
        backHref="/dashboard"
        backLabel={tCommon("back")}
        title={t("title")}
        maxWidth="3xl"
      />

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
              <p className="text-gray-900">{t(`createAccount.roles.${user.role}`)}</p>
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

        {/* Create Account (Admin only) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <CreateAccountSection />
          </section>
        )}

        {/* Manage Members (Admin only) */}
        {user.role === "ADMIN" && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ManageMembersSection users={allUsers} currentUserId={session!.user!.id} />
          </section>
        )}
      </main>
    </div>
  );
}
