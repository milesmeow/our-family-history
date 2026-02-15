import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PersonForm } from "@/components/people/PersonForm";
import { PageHeader } from "@/components/layout/PageHeader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const t = await getTranslations("people");
  const tCommon = await getTranslations("common");

  const person = await prisma.person.findUnique({
    where: { id },
  });

  if (!person) notFound();

  // Block viewers from accessing edit page
  if (session!.user?.role === "VIEWER") {
    redirect(`/people/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref={`/people/${id}`}
        backLabel={tCommon("back")}
        title={t("editPerson")}
        maxWidth="3xl"
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PersonForm person={person} />
        </div>
      </main>
    </div>
  );
}
