import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const t = await getTranslations("auth.error");
  const params = await searchParams;
  const errorCode = params.error || "Default";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-4">
            {t("description")}
          </p>

          {/* Error code for debugging */}
          {errorCode !== "Default" && (
            <p className="text-xs text-gray-400 mb-6">
              Error code: {errorCode}
            </p>
          )}

          {/* Try again */}
          <Link
            href="/login"
            className="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            {t("tryAgain")}
          </Link>
        </div>
      </div>
    </div>
  );
}
