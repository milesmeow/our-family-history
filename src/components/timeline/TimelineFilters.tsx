"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/validations/entry";

// Module-level cache shared with PersonSelector to avoid duplicate API calls.
let cachedPeople: { id: string; firstName: string; lastName: string | null }[] | null = null;
let peoplePromise: Promise<{ id: string; firstName: string; lastName: string | null }[]> | null = null;

interface Person {
  id: string;
  firstName: string;
  lastName: string | null;
}

interface TimelineFiltersProps {
  currentFilters: {
    category?: string;
    personId?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function TimelineFilters({ currentFilters }: TimelineFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("timeline.filters");
  const tCategories = useTranslations("entries.categories");

  // Filter state
  const [category, setCategory] = useState(currentFilters.category || "");
  const [personId, setPersonId] = useState(currentFilters.personId || "");
  const [startDate, setStartDate] = useState(currentFilters.startDate || "");
  const [endDate, setEndDate] = useState(currentFilters.endDate || "");

  // UI state
  const [isExpanded, setIsExpanded] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);

  // Fetch people list for the person filter dropdown, using a module-level
  // cache so navigating back doesn't re-fetch on every mount.
  useEffect(() => {
    if (cachedPeople) {
      setPeople(cachedPeople);
      return;
    }
    if (!peoplePromise) {
      peoplePromise = fetch("/api/people")
        .then((res) => (res.ok ? res.json() : []))
        .catch(() => []);
    }
    peoplePromise.then((data) => {
      cachedPeople = data;
      setPeople(data);
    });
  }, []);

  // Build URL with current filters
  const buildUrl = useCallback(
    (updates: Partial<typeof currentFilters>) => {
      const params = new URLSearchParams(searchParams.toString());

      const newFilters = {
        category: updates.category ?? category,
        personId: updates.personId ?? personId,
        startDate: updates.startDate ?? startDate,
        endDate: updates.endDate ?? endDate,
      };

      // Update or remove each param
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      return `/timeline${params.toString() ? `?${params.toString()}` : ""}`;
    },
    [searchParams, category, personId, startDate, endDate]
  );

  // Apply filters by navigating to the new URL
  const applyFilter = useCallback(
    (updates: Partial<typeof currentFilters>) => {
      startTransition(() => {
        router.push(buildUrl(updates));
      });
    },
    [router, buildUrl]
  );

  // Check if any filters are active
  const hasActiveFilters = category || personId || startDate || endDate;
  const activeFilterCount = [category, personId, startDate, endDate].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setCategory("");
    setPersonId("");
    setStartDate("");
    setEndDate("");
    startTransition(() => {
      router.push("/timeline");
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      {/* Filter Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">{t("title")}</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {t("active", { count: activeFilterCount })}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Filter Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {/* Category Filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("category")}
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  applyFilter({ category: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t("allCategories")}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {tCategories(cat as Category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Person Filter */}
            <div>
              <label
                htmlFor="personId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("person")}
              </label>
              <select
                id="personId"
                value={personId}
                onChange={(e) => {
                  setPersonId(e.target.value);
                  applyFilter({ personId: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">{t("allPeople")}</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("fromDate")}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  applyFilter({ startDate: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("toDate")}
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  applyFilter({ endDate: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={clearAllFilters}
                disabled={isPending}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {t("clearAll")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick filter chips when collapsed */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-6 pb-4 flex flex-wrap gap-2">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              {tCategories(category as Category)}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCategory("");
                  applyFilter({ category: "" });
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {personId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {people.find((p) => p.id === personId)?.firstName || t("person")}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonId("");
                  applyFilter({ personId: "" });
                }}
                className="hover:text-green-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {startDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {t("fromDate")}: {startDate}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStartDate("");
                  applyFilter({ startDate: "" });
                }}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {endDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {t("toDate")}: {endDate}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEndDate("");
                  applyFilter({ endDate: "" });
                }}
                className="hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
