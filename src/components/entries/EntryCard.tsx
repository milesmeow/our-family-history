import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Users, FileEdit } from "lucide-react";
import { CATEGORY_LABELS, type Category } from "@/lib/validations/entry";

interface EntryCardProps {
  entry: {
    id: string;
    title: string;
    summary: string | null;
    content: string;
    eventDate: Date | null;
    dateApproximate: boolean;
    category: string;
    location: string | null;
    publishedAt: Date | null;
    _count: {
      peopleInvolved: number;
    };
  };
}

export function EntryCard({ entry }: EntryCardProps) {
  const categoryLabel = CATEGORY_LABELS[entry.category as Category] || entry.category;
  const isDraft = entry.publishedAt === null;

  // Use summary if available, otherwise truncate content
  const displayText = entry.summary || entry.content;
  const truncatedText = displayText.length > 150
    ? displayText.substring(0, 150) + "..."
    : displayText;

  return (
    <Link
      href={`/entries/${entry.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
    >
      {/* Header with badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
          {categoryLabel}
        </span>
        {isDraft && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
            <FileEdit className="w-3 h-3" />
            Draft
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
        {entry.title}
      </h3>

      {/* Content Preview */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
        {truncatedText}
      </p>

      {/* Meta Info */}
      <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-500">
        {entry.eventDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {entry.dateApproximate && "~"}
            {format(entry.eventDate, "MMM d, yyyy")}
          </span>
        )}
        {entry.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{entry.location}</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {entry._count.peopleInvolved}{" "}
          {entry._count.peopleInvolved === 1 ? "person" : "people"}
        </span>
      </div>
    </Link>
  );
}
