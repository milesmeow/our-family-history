import { TimelineEvent, type TimelineEntryData } from "./TimelineEvent";
import { getEventYear } from "@/lib/utils";

interface VerticalTimelineProps {
  entries: TimelineEntryData[];
}

/**
 * VerticalTimeline renders entries chronologically along a central vertical axis.
 *
 * Features:
 * - Year markers appear when the year changes between entries
 * - Events alternate left/right on desktop, stack on mobile
 * - Entries without dates are shown in a separate "Undated" section at the bottom
 */
export function VerticalTimeline({ entries }: VerticalTimelineProps) {
  // Separate dated and undated entries
  const datedEntries = entries.filter((e) => e.eventDate !== null);
  const undatedEntries = entries.filter((e) => e.eventDate === null);

  // Track the last year to show year markers when it changes
  let lastYear: number | null = null;

  return (
    <div className="relative">
      {/* Central vertical line - only visible on desktop */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-200" />

      {/* Mobile vertical line - on the left side */}
      <div className="md:hidden absolute left-2 w-0.5 h-full bg-gray-200" />

      {/* Dated Entries */}
      {datedEntries.map((entry, index) => {
        const year = getEventYear(entry.eventDate);
        const showYearMarker = year !== null && year !== lastYear;
        lastYear = year;

        return (
          <div key={entry.id}>
            {/* Year Marker */}
            {showYearMarker && (
              <div className="relative flex justify-center mb-6 md:mb-8">
                {/* Mobile: Position year marker near the left line */}
                <div className="md:hidden absolute left-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>

                {/* Year pill - centered on desktop, offset on mobile */}
                <span className="ml-10 md:ml-0 bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                  {year}
                </span>
              </div>
            )}

            <TimelineEvent
              entry={entry}
              position={index % 2 === 0 ? "left" : "right"}
            />
          </div>
        );
      })}

      {/* Undated Entries Section */}
      {undatedEntries.length > 0 && (
        <>
          {/* Undated section header */}
          <div className="relative flex justify-center my-8 md:my-12">
            <div className="md:hidden absolute left-0 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            <span className="ml-10 md:ml-0 bg-gray-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
              Undated
            </span>
          </div>

          {datedEntries.length > 0 && undatedEntries.map((entry, index) => (
            <TimelineEvent
              key={entry.id}
              entry={entry}
              position={(datedEntries.length + index) % 2 === 0 ? "left" : "right"}
            />
          ))}

          {datedEntries.length === 0 && undatedEntries.map((entry, index) => (
            <TimelineEvent
              key={entry.id}
              entry={entry}
              position={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </>
      )}

      {/* Empty State */}
      {entries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or add some family stories to see them on the timeline.
          </p>
        </div>
      )}
    </div>
  );
}
