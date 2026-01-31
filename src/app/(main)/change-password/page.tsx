import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import ChangePasswordForm from "./ChangePasswordForm";
import { AlertTriangle } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("auth.changePassword");
  return {
    title: t("title"),
  };
}

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // @ts-expect-error - requirePasswordChange added via module augmentation
  const requirePasswordChange = session.user.requirePasswordChange;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Warning Banner (if forced) */}
        {requirePasswordChange && (
          <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Password Change Required</p>
              <p>
                For security, you must change your temporary password before
                continuing.
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <Suspense fallback={<div>Loading...</div>}>
            <ChangePasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
