import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { parseDateString } from "@/lib/utils";
import { TimelineFilters } from "@/components/timeline/TimelineFilters";
import { VerticalTimeline } from "@/components/timeline/VerticalTimeline";
import { PageHeader } from "@/components/layout/PageHeader";
import type { TimelineEntryData } from "@/components/timeline/TimelineEvent";
import type { Prisma } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    personId?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export const metadata = {
  title: "Family Timeline",
  description: "Explore your family history chronologically",
};

/**
 * Timeline Page
 *
 * Displays family history entries in chronological order with:
 * - Filtering by category, person, and date range
 * - Visual timeline with year markers
 * - Alternating left/right layout on desktop
 * - Undated entries shown in a separate section
 */
export default async function TimelinePage({ searchParams }: PageProps) {
  const t = await getTranslations("timeline");
  const tDashboard = await getTranslations("dashboard");

  // Parse filter parameters
  const params = await searchParams;
  const { category, personId, startDate, endDate } = params;

  // Build the where clause for Prisma query
  const whereClause: Prisma.EntryWhereInput = {
    // Only show published entries on the timeline
    publishedAt: { not: null },
  };

  if (category) {
    whereClause.category = category;
  }

  if (personId) {
    whereClause.peopleInvolved = {
      some: { personId },
    };
  }

  if (startDate) {
    whereClause.eventDate = {
      ...((whereClause.eventDate as object) || {}),
      gte: parseDateString(startDate),
    };
  }

  if (endDate) {
    whereClause.eventDate = {
      ...((whereClause.eventDate as object) || {}),
      lte: parseDateString(endDate),
    };
  }

  // Fetch entries ordered by event date (oldest first)
  // Entries without dates will have eventDate: null and sort to the end
  const entries = await prisma.entry.findMany({
    where: whereClause,
    orderBy: [
      { eventDate: "asc" },
      { createdAt: "asc" }, // Secondary sort for entries with same date
    ],
    take: 100,
    include: {
      peopleInvolved: {
        include: {
          person: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  // Transform entries to the format expected by VerticalTimeline
  const timelineEntries: TimelineEntryData[] = entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    content: entry.content,
    eventDate: entry.eventDate,
    dateApproximate: entry.dateApproximate,
    datePrecision: entry.datePrecision,
    category: entry.category,
    location: entry.location,
    peopleInvolved: entry.peopleInvolved.map((poi) => ({
      person: {
        firstName: poi.person.firstName,
        lastName: poi.person.lastName || "",
      },
    })),
  }));

  // Current filter values for the filter component
  const currentFilters = {
    category,
    personId,
    startDate,
    endDate,
  };

  const hasFilters = category || personId || startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref="/dashboard"
        backLabel={tDashboard("title")}
        title={t("title")}
        maxWidth="5xl"
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subtitle */}
        <p className="text-gray-600 mb-6">{t("subtitle")}</p>

        {/* Filters */}
        <Suspense fallback={<div className="h-16 bg-gray-100 rounded-xl animate-pulse mb-8" />}>
          <TimelineFilters currentFilters={currentFilters} />
        </Suspense>

        {/* Timeline */}
        <div className="py-4">
          <VerticalTimeline entries={timelineEntries} />
        </div>

        {/* Results Summary */}
        {entries.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            {t("results.showing", { count: entries.length })}
            {hasFilters && ` ${t("results.filtered")}`}
          </div>
        )}
      </main>
    </div>
  );
}
