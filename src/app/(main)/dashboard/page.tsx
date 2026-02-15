import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import { BookOpen, Users, Clock, TreePine, BookText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function DashboardPage() {
  const session = await auth();

  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const userName = session!.user?.name || session!.user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="dashboard"
        appName={tCommon("appName")}
        userEmail={session!.user?.email || ""}
        settingsLabel={t("quickActions.settings")}
        signOutLabel="Sign out"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {userName ? t("welcome", { name: userName }) : t("welcomeDefault")}
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            icon={<BookOpen className="w-6 h-6" />}
            title={t("quickActions.newEntry")}
            href="/entries/new"
            color="amber"
          />
          <QuickActionCard
            icon={<Users className="w-6 h-6" />}
            title={t("quickActions.managePeople")}
            href="/people"
            color="blue"
          />
          <QuickActionCard
            icon={<Clock className="w-6 h-6" />}
            title={t("quickActions.viewTimeline")}
            href="/timeline"
            color="green"
          />
          <QuickActionCard
            icon={<BookText className="w-6 h-6" />}
            title={t("quickActions.viewStories")}
            href="/entries"
            color="indigo"
          />
          <QuickActionCard
            icon={<TreePine className="w-6 h-6" />}
            title={t("quickActions.settings")}
            href="/settings"
            color="purple"
          />
        </div>
      </main>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  color: "amber" | "blue" | "green" | "purple" | "indigo";
}) {
  const colorClasses = {
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
    indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
  };

  return (
    <a
      href={href}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${colorClasses[color]}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
    </a>
  );
}
