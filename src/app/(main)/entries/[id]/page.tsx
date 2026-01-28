import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { Edit, Calendar, MapPin, Tag, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { DeleteEntryButton } from "@/components/entries/DeleteEntryButton";
import { CATEGORY_LABELS, type Category } from "@/lib/validations/entry";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      peopleInvolved: {
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!entry) notFound();

  const isAuthor = entry.author.id === session.user?.id;
  const categoryLabel = CATEGORY_LABELS[entry.category as Category] || entry.category;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/entries"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Link>
            {isAuthor && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/entries/${id}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <DeleteEntryButton id={id} title={entry.title} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entry Content Card */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {/* Header */}
          <div className="mb-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {categoryLabel}
              </span>
              {entry.publishedAt === null && (
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Draft
                </span>
              )}
              {entry.era && (
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {entry.era}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {entry.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {entry.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {entry.dateApproximate && "Circa "}
                  {format(entry.eventDate, "MMMM d, yyyy")}
                  {entry.eventDateEnd && (
                    <> – {format(entry.eventDateEnd, "MMMM d, yyyy")}</>
                  )}
                </span>
              )}
              {entry.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {entry.location}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {entry.content}
            </p>
          </div>

          {/* Author Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Written by {entry.author.name || entry.author.email} •{" "}
              {format(entry.createdAt, "MMMM d, yyyy")}
              {entry.updatedAt > entry.createdAt && (
                <> • Updated {format(entry.updatedAt, "MMMM d, yyyy")}</>
              )}
            </p>
          </div>
        </article>

        {/* People in Story */}
        {entry.peopleInvolved.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              People in this Story
            </h2>
            <div className="flex flex-wrap gap-3">
              {entry.peopleInvolved.map(({ person }) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {person.avatarUrl ? (
                      <img
                        src={person.avatarUrl}
                        alt={`${person.firstName} ${person.lastName}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {person.firstName} {person.lastName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
