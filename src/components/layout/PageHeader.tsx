import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { signOut } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const maxWidthClasses = {
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
} as const;

type MaxWidth = keyof typeof maxWidthClasses;

type DashboardHeaderProps = {
  variant: "dashboard";
  appName: string;
  userEmail: string;
  settingsLabel: string;
  signOutLabel: string;
};

type SubPageHeaderProps = {
  variant: "subpage";
  backHref: string;
  backLabel: string;
  title?: React.ReactNode;
  maxWidth?: MaxWidth;
  actions?: React.ReactNode;
};

export type PageHeaderProps = DashboardHeaderProps | SubPageHeaderProps;

export function PageHeader(props: PageHeaderProps) {
  if (props.variant === "dashboard") {
    return <DashboardHeader {...props} />;
  }
  return <SubPageHeader {...props} />;
}

function DashboardHeader({
  appName,
  userEmail,
  settingsLabel,
  signOutLabel,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-gray-900">{appName}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-gray-600">{userEmail}</span>
            <Link
              href="/settings"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title={settingsLabel}
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
                {signOutLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

function SubPageHeader({
  backHref,
  backLabel,
  title,
  maxWidth = "4xl",
  actions,
}: SubPageHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div
        className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8`}
      >
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link
              href={backHref}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
            {title && (
              <>
                <span className="text-gray-300">|</span>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
