import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("auth.forgotPassword");
  return {
    title: t("title"),
  };
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Family History
          </h1>
          <p className="text-amber-800/70 text-sm">家族歷史</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100">
          <Suspense fallback={<div>Loading...</div>}>
            <ForgotPasswordForm />
          </Suspense>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to login</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-amber-800/60">
          Preserving memories for generations
        </p>
      </div>
    </div>
  );
}
