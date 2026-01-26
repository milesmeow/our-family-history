import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Users, Clock, TreePine } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">Family History</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user?.email}
              </span>
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
            Welcome, {session.user?.name || session.user?.email?.split("@")[0]}!
          </h2>
          <p className="mt-1 text-gray-600">
            Start preserving your family's stories and memories.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickActionCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Add Story"
            description="Record a family memory or story"
            href="/entries/new"
            color="amber"
          />
          <QuickActionCard
            icon={<Users className="w-6 h-6" />}
            title="Family Members"
            description="Add people to your family"
            href="/people"
            color="blue"
          />
          <QuickActionCard
            icon={<Clock className="w-6 h-6" />}
            title="Timeline"
            description="View stories chronologically"
            href="/timeline"
            color="green"
          />
          <QuickActionCard
            icon={<TreePine className="w-6 h-6" />}
            title="Family Tree"
            description="Explore family relationships"
            href="/tree"
            color="purple"
          />
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Getting Started
          </h3>
          <div className="space-y-3">
            <TodoItem
              done={false}
              text="Add your first family story"
            />
            <TodoItem
              done={false}
              text="Create profiles for family members"
            />
            <TodoItem
              done={false}
              text="Upload old photos and documents"
            />
            <TodoItem
              done={false}
              text="Invite other family members to contribute"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
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
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}

function TodoItem({ done, text }: { done: boolean; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          done
            ? "bg-green-500 border-green-500"
            : "border-gray-300"
        }`}
      >
        {done && (
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <span className={done ? "text-gray-400 line-through" : "text-gray-700"}>
        {text}
      </span>
    </div>
  );
}
