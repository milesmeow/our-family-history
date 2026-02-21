import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EntryForm } from "@/components/entries/EntryForm";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const t = await getTranslations("entries");
  const tCommon = await getTranslations("common");

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      peopleInvolved: {
        include: {
          person: {
            select: {
              id: true,
            },
          },
        },
      },
      media: {
        select: { id: true, url: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!entry) notFound();

  // Allow admins to edit any entry, redirect non-authors who aren't admins
  // (Admins can even edit orphaned entries with no author for cleanup purposes)
  if (session!.user?.role !== "ADMIN" && (!entry.authorId || entry.authorId !== session!.user?.id)) {
    redirect(`/entries/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref={`/entries/${id}`}
        backLabel={tCommon("back")}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("editEntry")}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EntryForm entry={entry} />
        </div>
      </main>
    </div>
  );
}
