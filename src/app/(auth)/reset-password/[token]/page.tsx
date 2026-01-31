import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "./ResetPasswordForm";

export async function generateMetadata() {
  const t = await getTranslations("auth.resetPassword");
  return {
    title: t("title"),
  };
}

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
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
            <ResetPasswordForm token={params.token} />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-amber-800/60">
          Preserving memories for generations
        </p>
      </div>
    </div>
  );
}
