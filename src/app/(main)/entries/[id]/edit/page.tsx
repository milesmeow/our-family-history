import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EntryForm } from "@/components/entries/EntryForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEntryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

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
    },
  });

  if (!entry) notFound();

  // Check if user is the author
  if (entry.authorId !== session.user?.id) {
    redirect(`/entries/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={`/entries/${id}`}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {tCommon("back")}
            </Link>
          </div>
        </div>
      </header>

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
