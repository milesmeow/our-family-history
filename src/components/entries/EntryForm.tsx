"use client";

import { useActionState, useState, startTransition } from "react";
import { useTranslations } from "next-intl";
import { createEntry, updateEntry } from "@/actions/entries";
import { CATEGORIES, DATE_PRECISIONS, type Category } from "@/lib/validations/entry";
import { format } from "date-fns";
import Link from "next/link";
import { PersonSelector } from "./PersonSelector";
import { RichTextEditor } from "./RichTextEditor";
import { MediaUploader } from "@/components/media/MediaUploader";

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
  media: { id: string; url: string }[];
}

interface EntryFormProps {
  entry?: Entry;
}

export function EntryForm({ entry }: EntryFormProps) {
  const t = useTranslations("entries");
  const tCommon = useTranslations("common");
  const action = entry ? updateEntry.bind(null, entry.id) : createEntry;

  const [state, formAction, isPending] = useActionState(action, null);

  // Track selected people IDs for the PersonSelector
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>(
    entry?.peopleInvolved.map((p) => p.person.id) ?? []
  );

  // Call formAction imperatively to prevent React 19's automatic form reset.
  // When using <form action={fn}>, React resets all uncontrolled inputs after
  // the action completes — even on error — wiping the title and other fields.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          {t("form.titleLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={entry?.title ?? ""}
          required
          placeholder={t("form.titlePlaceholder")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("form.categoryLabel")}
        </label>
        <select
          id="category"
          name="category"
          defaultValue={entry?.category ?? "STORY"}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t(`categories.${cat as Category}`)}
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
            {t("form.eventDateLabel")}
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            defaultValue={
              entry?.eventDate ? format(entry.eventDate, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="eventDateEnd"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("form.eventDateEndLabel")}
          </label>
          <input
            type="date"
            id="eventDateEnd"
            name="eventDateEnd"
            defaultValue={
              entry?.eventDateEnd ? format(entry.eventDateEnd, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
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
            {t("form.dateApproximateLabel")}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-900"
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
            Era ({tCommon("optional")})
          </label>
          <input
            type="text"
            id="era"
            name="era"
            defaultValue={entry?.era ?? ""}
            placeholder='e.g., "World War II", "The Great Depression"'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t("form.locationLabel")}
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={entry?.location ?? ""}
            placeholder={t("form.locationPlaceholder")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
          />
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("form.contentLabel")} <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          initialContent={entry?.content ?? ""}
          inputName="content"
          placeholder={t("form.contentPlaceholder")}
        />
      </div>

      {/* Summary */}
      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t("form.summaryLabel")}
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={entry?.summary ?? ""}
          placeholder={t("form.summaryPlaceholder")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-900"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("form.photosLabel")}
        </label>
        <MediaUploader existingMedia={entry?.media ?? []} />
      </div>

      {/* People in Story */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("form.peopleLabel")}
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
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href={entry ? `/entries/${entry.id}` : "/entries"}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          {tCommon("cancel")}
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending
            ? (entry ? t("form.updating") : t("form.creating"))
            : t("form.submit")}
        </button>
      </div>
    </form>
  );
}
