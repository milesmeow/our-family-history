import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { EntryCard } from "@/components/entries/EntryCard";
import { Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, type Category } from "@/lib/validations/entry";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function EntriesPage({ searchParams }: PageProps) {
  const t = await getTranslations("entries");
  const tCommon = await getTranslations("common");
  const tDashboard = await getTranslations("dashboard");

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

  const formattedEntries = entries.map((entry) => ({
    ...entry,
    eventDateFormatted: entry.eventDate
      ? format(entry.eventDate, "MMM d, yyyy")
      : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref="/dashboard"
        backLabel={tDashboard("title")}
        title={t("title")}
        maxWidth="7xl"
        actions={
          <Link
            href="/entries/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("newEntry")}
          </Link>
        }
      />

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
            {tCommon("all")}
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
              {t(`categories.${cat as Category}`)}
            </Link>
          ))}
        </div>

        {entries.length === 0 ? (
          <EmptyState categoryFilter={categoryFilter} t={t} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  categoryFilter,
  t
}: {
  categoryFilter?: string;
  t: Awaited<ReturnType<typeof getTranslations<"entries">>>;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t("noEntries")}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {t("createFirst")}
      </p>
      <Link
        href="/entries/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {t("newEntry")}
      </Link>
    </div>
  );
}
