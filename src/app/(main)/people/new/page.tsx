import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PersonForm } from "@/components/people/PersonForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewPersonPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/people"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-bold text-gray-900">Add New Person</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PersonForm />
        </div>
      </main>
    </div>
  );
}
