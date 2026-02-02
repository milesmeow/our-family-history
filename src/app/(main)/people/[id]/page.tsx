import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { Edit, User, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DeletePersonButton } from "@/components/people/DeletePersonButton";
import { RelationshipList } from "@/components/people/RelationshipList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const t = await getTranslations("people");
  const tCommon = await getTranslations("common");

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      relationsFrom: {
        include: {
          toPerson: true,
        },
      },
      entries: {
        include: {
          entry: {
            select: {
              id: true,
              title: true,
              eventDate: true,
            },
          },
        },
        take: 5,
        orderBy: {
          entry: {
            eventDate: "desc",
          },
        },
      },
    },
  });

  if (!person) notFound();

  const fullName = `${person.firstName} ${person.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/people"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {tCommon("back")}
            </Link>
            {/* Show edit/delete for admins and members, hide for viewers */}
            {session.user?.role !== "VIEWER" && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/people/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <Edit className="w-4 h-4" />
                  {tCommon("edit")}
                </Link>
                <DeletePersonButton id={id} name={fullName} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              {person.avatarUrl ? (
                <img
                  src={person.avatarUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-blue-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              {person.maidenName && (
                <p className="text-gray-500">née {person.maidenName}</p>
              )}
              {person.nickname && (
                <p className="text-lg text-gray-600 mt-1">
                  &ldquo;{person.nickname}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          {(person.birthDate || person.deathDate) && (
            <div className="mt-6 flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              {person.birthDate && (
                <span>{t("card.born")} {format(person.birthDate, "MMMM d, yyyy")}</span>
              )}
              {person.birthDate && person.deathDate && <span>–</span>}
              {person.deathDate && (
                <span>{t("card.died")} {format(person.deathDate, "MMMM d, yyyy")}</span>
              )}
            </div>
          )}

          {/* Bio */}
          {person.bio && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">{t("form.bioLabel")}</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{person.bio}</p>
            </div>
          )}
        </div>

        {/* Relationships Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <RelationshipList
            personId={person.id}
            personName={person.firstName}
            relationships={person.relationsFrom}
          />
        </div>

        {/* Related Stories */}
        {person.entries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("entries.title")}
            </h2>
            <div className="space-y-3">
              {person.entries.map(({ entry }) => (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-medium text-gray-900">{entry.title}</h3>
                  {entry.eventDate && (
                    <p className="text-sm text-gray-500">
                      {format(entry.eventDate, "MMM d, yyyy")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
