"use client";

import { useState, useEffect, useActionState } from "react";
import { useTranslations } from "next-intl";
import { User, Link as LinkIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { linkUserToPerson, createAndLinkPerson, unlinkProfile } from "@/actions/settings";
import type { Person } from "@prisma/client";

interface LinkProfileSectionProps {
  linkedPerson: Person | null;
}

interface PersonOption {
  id: string;
  firstName: string;
  lastName: string;
}

export function LinkProfileSection({ linkedPerson }: LinkProfileSectionProps) {
  const t = useTranslations("settings.profile");
  const tPeople = useTranslations("people.form");
  const tCommon = useTranslations("common");

  const [mode, setMode] = useState<"view" | "create" | "link">("view");
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const [createState, createAction, isCreating] = useActionState(createAndLinkPerson, null);

  // Fetch unlinked people when switching to link mode
  useEffect(() => {
    if (mode === "link") {
      setIsFetching(true);
      fetch("/api/people/unlinked")
        .then((res) => res.json())
        .then((data) => {
          setPeople(data);
          setIsFetching(false);
        })
        .catch(() => {
          setError(t("failedToLoad"));
          setIsFetching(false);
        });
    }
  }, [mode, t]);

  const handleLinkExisting = async () => {
    if (!selectedPerson) return;

    setIsLinking(true);
    setError(null);

    const result = await linkUserToPerson(selectedPerson);

    setIsLinking(false);

    if (!result.success) {
      setError(result.error);
    } else {
      // Page will revalidate and show linked profile
      setMode("view");
    }
  };

  const handleUnlink = async () => {
    if (!confirm(t("unlinkConfirm"))) {
      return;
    }

    setIsUnlinking(true);
    setError(null);

    const result = await unlinkProfile();

    setIsUnlinking(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  // If linked, show the linked profile
  if (linkedPerson) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("title")}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            {linkedPerson.avatarUrl ? (
              <img
                src={linkedPerson.avatarUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {linkedPerson.firstName} {linkedPerson.lastName}
            </p>
            {linkedPerson.nickname && (
              <p className="text-sm text-gray-500">&ldquo;{linkedPerson.nickname}&rdquo;</p>
            )}
            <p className="text-sm text-green-600">{t("linkedToAccount")}</p>
          </div>
          <Link
            href={`/people/${linkedPerson.id}`}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t("viewProfile")}
          </Link>
        </div>

        <button
          onClick={handleUnlink}
          disabled={isUnlinking}
          className="mt-4 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isUnlinking ? t("unlinking") : t("unlinkProfile")}
        </button>
      </div>
    );
  }

  // Not linked - show options
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{t("titleLink")}</h2>
      <p className="text-gray-600 text-sm mb-4">{t("description")}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {createState && !createState.success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {createState.error}
        </div>
      )}

      {mode === "view" && (
        <div className="space-y-3">
          <button
            onClick={() => setMode("create")}
            className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{t("createMyProfile")}</p>
              <p className="text-sm text-gray-500">{t("createMyProfileDesc")}</p>
            </div>
          </button>

          <button
            onClick={() => setMode("link")}
            className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{t("linkExisting")}</p>
              <p className="text-sm text-gray-500">{t("linkExistingDesc")}</p>
            </div>
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{t("createTitle")}</h3>
            <button
              onClick={() => setMode("view")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form action={createAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {tPeople("firstNameLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {tPeople("lastNameLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  {tPeople("nicknameLabel")}
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder={tPeople("nicknamePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 mb-1">
                  {tPeople("maidenNameLabel")}
                </label>
                <input
                  type="text"
                  id="maidenName"
                  name="maidenName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                {tPeople("birthDateLabel")}
              </label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                {t("aboutYou")}
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder={t("aboutYouPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? t("creating") : t("createAndLink")}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "link" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">{t("linkTitle")}</h3>
            <button
              onClick={() => setMode("view")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {isFetching ? (
            <p className="text-gray-500 text-center py-4">{t("loadingPeople")}</p>
          ) : people.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">{t("noUnlinkedProfiles")}</p>
              <button
                onClick={() => setMode("create")}
                className="text-blue-600 hover:text-blue-700"
              >
                {t("createInstead")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="selectPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("selectYourProfile")}
                </label>
                <select
                  id="selectPerson"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">{t("choosePerson")}</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  {tCommon("cancel")}
                </button>
                <button
                  onClick={handleLinkExisting}
                  disabled={!selectedPerson || isLinking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLinking ? t("linking") : t("linkButton")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
