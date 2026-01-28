import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EntryCard } from "@/components/entries/EntryCard";
import { Plus, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/lib/validations/entry";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function EntriesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const categoryFilter = params.category;

  const entries = await prisma.entry.findMany({
    where: categoryFilter ? { category: categoryFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          peopleInvolved: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-xl font-bold text-gray-900">Stories</h1>
            </div>
            <Link
              href="/entries/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Story
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/entries"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !categoryFilter
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/entries?category=${cat}`}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {CATEGORY_LABELS[cat as Category]}
            </Link>
          ))}
        </div>

        {entries.length === 0 ? (
          <EmptyState categoryFilter={categoryFilter} />
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {entries.length} {entries.length === 1 ? "story" : "stories"}
              {categoryFilter && ` in ${CATEGORY_LABELS[categoryFilter as Category]}`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState({ categoryFilter }: { categoryFilter?: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {categoryFilter ? "No stories in this category" : "No stories yet"}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {categoryFilter
          ? "Try selecting a different category or add a new story."
          : "Start preserving your family history by adding your first story."}
      </p>
      <Link
        href="/entries/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Your First Story
      </Link>
    </div>
  );
}
