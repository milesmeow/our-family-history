"use client";

import { useActionState, useState } from "react";
import { createEntry, updateEntry } from "@/actions/entries";
import { CATEGORIES, CATEGORY_LABELS, DATE_PRECISIONS } from "@/lib/validations/entry";
import { format } from "date-fns";
import Link from "next/link";
import { PersonSelector } from "./PersonSelector";

interface Entry {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  eventDate: Date | null;
  eventDateEnd: Date | null;
  dateApproximate: boolean;
  datePrecision: string;
  era: string | null;
  category: string;
  location: string | null;
  publishedAt: Date | null;
  peopleInvolved: { person: { id: string } }[];
}

interface EntryFormProps {
  entry?: Entry;
}

export function EntryForm({ entry }: EntryFormProps) {
  const action = entry ? updateEntry.bind(null, entry.id) : createEntry;

  const [state, formAction, isPending] = useActionState(action, null);

  // Track selected people IDs for the PersonSelector
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>(
    entry?.peopleInvolved.map((p) => p.person.id) ?? []
  );

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {state.error}
        </div>
      )}

      {/* Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={entry?.title ?? ""}
          required
          placeholder="A memorable title for this story"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={entry?.category ?? "STORY"}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Date Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Event Date
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            defaultValue={
              entry?.eventDate ? format(entry.eventDate, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="eventDateEnd"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            End Date (optional)
          </label>
          <input
            type="date"
            id="eventDateEnd"
            name="eventDateEnd"
            defaultValue={
              entry?.eventDateEnd ? format(entry.eventDateEnd, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Date Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="dateApproximate"
            name="dateApproximate"
            defaultChecked={entry?.dateApproximate ?? false}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="dateApproximate" className="text-sm text-gray-700">
            Date is approximate
          </label>
        </div>

        <div>
          <label
            htmlFor="datePrecision"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date Precision
          </label>
          <select
            id="datePrecision"
            name="datePrecision"
            defaultValue={entry?.datePrecision ?? "DAY"}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {DATE_PRECISIONS.map((precision) => (
              <option key={precision} value={precision}>
                {precision.charAt(0) + precision.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Era and Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="era"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Era (optional)
          </label>
          <input
            type="text"
            id="era"
            name="era"
            defaultValue={entry?.era ?? ""}
            placeholder='e.g., "World War II", "The Great Depression"'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location (optional)
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={entry?.location ?? ""}
            placeholder='e.g., "Ellis Island, New York"'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Story <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          rows={10}
          defaultValue={entry?.content ?? ""}
          required
          placeholder="Tell the story in detail..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Summary (optional)
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={entry?.summary ?? ""}
          placeholder="A brief excerpt for timeline view..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* People in Story */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          People in this Story
        </label>
        <PersonSelector
          selectedIds={selectedPeopleIds}
          onChange={setSelectedPeopleIds}
        />
      </div>

      {/* Publish Status */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="isPublished"
          name="isPublished"
          defaultChecked={entry?.publishedAt !== null}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div>
          <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
            Publish this story
          </label>
          <p className="text-xs text-gray-500">
            Published stories are visible to all family members. Leave unchecked to save as draft.
          </p>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href={entry ? `/entries/${entry.id}` : "/entries"}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : entry ? "Update Story" : "Create Story"}
        </button>
      </div>
    </form>
  );
}
