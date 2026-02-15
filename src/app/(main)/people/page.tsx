import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { PersonCard } from "@/components/people/PersonCard";
import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function PeoplePage() {
  const t = await getTranslations("people");
  const tDashboard = await getTranslations("dashboard");

  const people = await prisma.person.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: {
      _count: {
        select: {
          entries: true,
          relationsFrom: true,
        },
      },
    },
  });

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
            href="/people/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("newPerson")}
          </Link>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {people.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ t }: { t: Awaited<ReturnType<typeof getTranslations<"people">>> }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <Users className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {t("noPeople")}
      </h2>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {t("addFirst")}
      </p>
      <Link
        href="/people/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {t("newPerson")}
      </Link>
    </div>
  );
}
