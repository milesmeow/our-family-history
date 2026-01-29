import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen, Users, Clock, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function HomePage() {
  const session = await auth();

  // Redirect logged-in users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  const t = await getTranslations("landing");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">{tCommon("appName")}</h1>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("heroTitle")}
            <span className="text-amber-600"> {t("heroTitleHighlight")}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("heroDescription")}
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-amber-600/25"
          >
            {t("getStarted")}
          </Link>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title={t("features.captureStories.title")}
            description={t("features.captureStories.description")}
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title={t("features.collaborate.title")}
            description={t("features.collaborate.description")}
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title={t("features.timeline.title")}
            description={t("features.timeline.description")}
          />
          <FeatureCard
            icon={<Heart className="w-6 h-6" />}
            title={t("features.preserve.title")}
            description={t("features.preserve.description")}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600">
        <p>{t("footer")}</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-sm">
      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
