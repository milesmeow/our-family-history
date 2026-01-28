import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { formatEventDate } from "@/lib/utils";
import { CATEGORY_LABELS, type Category } from "@/lib/validations/entry";

/**
 * Category color mapping for visual distinction on the timeline.
 * Uses Tailwind color classes - the dot and accent colors create
 * a cohesive visual identity for each entry type.
 */
const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  BIRTH: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  DEATH: { bg: "bg-gray-200", text: "text-gray-700", dot: "bg-gray-500" },
  WEDDING: { bg: "bg-pink-100", text: "text-pink-700", dot: "bg-pink-500" },
  GRADUATION: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  MIGRATION: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  MILITARY: { bg: "bg-slate-200", text: "text-slate-700", dot: "bg-slate-600" },
  CAREER: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  TRADITION: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  RECIPE: { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
  PHOTO_MEMORY: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-500" },
  DOCUMENT: { bg: "bg-stone-200", text: "text-stone-700", dot: "bg-stone-500" },
  STORY: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  OTHER: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500" },
};

export interface TimelineEntryData {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  eventDate: Date | null;
  dateApproximate: boolean;
  datePrecision: string;
  category: string;
  location: string | null;
  peopleInvolved: { person: { firstName: string; lastName: string } }[];
}

interface TimelineEventProps {
  entry: TimelineEntryData;
  position: "left" | "right";
}

export function TimelineEvent({ entry, position }: TimelineEventProps) {
  const categoryLabel = CATEGORY_LABELS[entry.category as Category] || entry.category;
  const colors = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.OTHER;

  // Use summary if available, otherwise truncate content
  const displayText = entry.summary || entry.content;
  const truncatedText =
    displayText.length > 120 ? displayText.substring(0, 120) + "..." : displayText;

  const formattedDate = formatEventDate(
    entry.eventDate,
    entry.datePrecision,
    entry.dateApproximate
  );

  return (
    <div className="relative flex items-center mb-8 md:mb-12">
      {/* Mobile: Always show on right side. Desktop: Alternate based on position */}
      <div
        className={`
          w-full md:w-1/2
          ${position === "left" ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"}
          pl-12 md:pl-0
        `}
      >
        <Link
          href={`/entries/${entry.id}`}
          className="block bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
        >
          {/* Category Badge and Date */}
          <div className={`flex items-center gap-2 mb-2 ${position === "left" ? "md:justify-end" : ""}`}>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
              {categoryLabel}
            </span>
            <span className="text-xs text-gray-500">{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            {entry.title}
          </h3>

          {/* Content Preview */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truncatedText}</p>

          {/* Meta Info */}
          <div className={`flex flex-wrap gap-3 text-xs text-gray-500 ${position === "left" ? "md:justify-end" : ""}`}>
            {entry.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{entry.location}</span>
              </span>
            )}
            {entry.peopleInvolved.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {entry.peopleInvolved.length === 1
                  ? `${entry.peopleInvolved[0].person.firstName} ${entry.peopleInvolved[0].person.lastName}`
                  : `${entry.peopleInvolved.length} people`}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Timeline Connector Dot - positioned on the central line */}
      <div
        className={`
          absolute w-4 h-4 rounded-full border-4 border-white shadow-sm
          ${colors.dot}
          left-0 md:left-1/2 md:-translate-x-1/2
        `}
      />

      {/* Connector Line from dot to card */}
      <div
        className={`
          absolute h-0.5 bg-gray-200
          left-4 w-8 md:w-10
          ${position === "left" ? "md:left-auto md:right-1/2 md:mr-2" : "md:left-1/2 md:ml-2"}
          top-1/2 -translate-y-1/2
          hidden md:block
        `}
      />
    </div>
  );
}
