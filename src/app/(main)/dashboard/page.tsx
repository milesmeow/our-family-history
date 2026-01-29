import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Users, Clock, TreePine, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  const userName = session.user?.name || session.user?.email?.split("@")[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">{tCommon("appName")}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
              <Link
                href="/settings"
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={t("quickActions.settings")}
              >
                <Settings className="w-5 h-5" />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

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
  color: "amber" | "blue" | "green" | "purple";
}) {
  const colorClasses = {
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 group-hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
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
