import Link from "next/link";
import { Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CheckEmailPage() {
  const t = await getTranslations("auth.checkEmail");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-amber-600" />
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("description")}
          </p>

          {/* Spam notice */}
          <p className="text-sm text-gray-500 mb-6">
            {t("spam")}
          </p>

          {/* Back link */}
          <Link
            href="/login"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            ← {t("tryAgain")}
          </Link>
        </div>
      </div>
    </div>
  );
}
