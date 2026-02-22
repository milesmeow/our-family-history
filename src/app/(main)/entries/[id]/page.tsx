import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { Edit, Calendar, MapPin, Tag, User, Images } from "lucide-react";
import Link from "next/link";
import { SafeHtml } from "@/components/entries/SafeHtml";
import { DeleteEntryButton } from "@/components/entries/DeleteEntryButton";
import { MediaGallery } from "@/components/media/MediaGallery";
import { type Category } from "@/lib/validations/entry";
import { PageHeader } from "@/components/layout/PageHeader";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EntryPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const t = await getTranslations("entries");
  const tCommon = await getTranslations("common");

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
      media: {
        select: { id: true, url: true, caption: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!entry) notFound();

  // Show edit/delete if user is author OR admin
  const canEdit = entry.author?.id === session?.user?.id || session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref="/entries"
        backLabel={tCommon("back")}
        actions={
          canEdit ? (
            <>
              <Link
                href={`/entries/${id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-4 h-4" />
                {tCommon("edit")}
              </Link>
              <DeleteEntryButton id={id} title={entry.title} />
            </>
          ) : undefined
        }
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Entry Content Card */}
        <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {/* Header */}
          <div className="mb-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {t(`categories.${entry.category as Category}`)}
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
                  {entry.dateApproximate && `${t("card.approximate")} `}
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
            {entry.content.trimStart().startsWith("<") ? (
              <SafeHtml
                html={entry.content}
                className="text-gray-700 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_a]:text-blue-600 [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
              />
            ) : (
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {entry.content}
              </p>
            )}
          </div>

          {/* Author Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>
              {t("card.by")}{" "}
              {entry.author
                ? entry.author.name || entry.author.email
                : t("card.unknownAuthor")}{" "}
              • {format(entry.createdAt, "MMMM d, yyyy")}
            </p>
          </div>
        </article>

        {/* Photo Gallery */}
        {entry.media.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Images className="w-5 h-5" />
              {t("detail.photos")}
            </h2>
            <MediaGallery media={entry.media} />
          </div>
        )}

        {/* People in Story */}
        {entry.peopleInvolved.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {t("form.peopleLabel")}
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
                      <Image
                        src={person.avatarUrl}
                        alt={`${person.firstName} ${person.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
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
