"use client";

import { useState, useEffect, useActionState } from "react";
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
          setError("Failed to load people");
          setIsFetching(false);
        });
    }
  }, [mode]);

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
    if (!confirm("Are you sure you want to unlink your profile? You can re-link later.")) {
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Family Profile</h2>

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
            <p className="text-sm text-green-600">Linked to your account</p>
          </div>
          <Link
            href={`/people/${linkedPerson.id}`}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Profile
          </Link>
        </div>

        <button
          onClick={handleUnlink}
          disabled={isUnlinking}
          className="mt-4 text-sm text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isUnlinking ? "Unlinking..." : "Unlink profile"}
        </button>
      </div>
    );
  }

  // Not linked - show options
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Link Your Family Profile</h2>
      <p className="text-gray-600 text-sm mb-4">
        Connect your account to your profile in the family tree. This helps others know who you are!
      </p>

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
              <p className="font-medium text-gray-900">Create my profile</p>
              <p className="text-sm text-gray-500">Add yourself to the family tree</p>
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
              <p className="font-medium text-gray-900">Link to existing profile</p>
              <p className="text-sm text-gray-500">Connect to a profile already in the family tree</p>
            </div>
          </button>
        </div>
      )}

      {mode === "create" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Create Your Profile</h3>
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
                  First Name <span className="text-red-500">*</span>
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
                  Last Name <span className="text-red-500">*</span>
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
                  Nickname
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  placeholder='e.g., "Jamie"'
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label htmlFor="maidenName" className="block text-sm font-medium text-gray-700 mb-1">
                  Maiden Name
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
                Birth Date
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
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                placeholder="A little about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMode("view")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? "Creating..." : "Create & Link Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === "link" && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Link to Existing Profile</h3>
            <button
              onClick={() => setMode("view")}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {isFetching ? (
            <p className="text-gray-500 text-center py-4">Loading people...</p>
          ) : people.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">No unlinked profiles available.</p>
              <button
                onClick={() => setMode("create")}
                className="text-blue-600 hover:text-blue-700"
              >
                Create a new profile instead
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="selectPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Your Profile
                </label>
                <select
                  id="selectPerson"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Choose a person...</option>
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
                  Cancel
                </button>
                <button
                  onClick={handleLinkExisting}
                  disabled={!selectedPerson || isLinking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLinking ? "Linking..." : "Link Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
