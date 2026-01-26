"use client";

import { useActionState } from "react";
import { createPerson, updatePerson } from "@/actions/people";
import type { Person } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";

interface PersonFormProps {
  person?: Person;
}

export function PersonForm({ person }: PersonFormProps) {
  const action = person
    ? updatePerson.bind(null, person.id)
    : createPerson;

  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {state.error}
        </div>
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            defaultValue={person?.firstName ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            defaultValue={person?.lastName ?? ""}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Maiden Name and Nickname */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="maidenName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Maiden Name
          </label>
          <input
            type="text"
            id="maidenName"
            name="maidenName"
            defaultValue={person?.maidenName ?? ""}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="nickname"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nickname
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            defaultValue={person?.nickname ?? ""}
            placeholder='e.g., "Grandpa Joe"'
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            defaultValue={
              person?.birthDate ? format(person.birthDate, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="deathDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Death Date
          </label>
          <input
            type="date"
            id="deathDate"
            name="deathDate"
            defaultValue={
              person?.deathDate ? format(person.deathDate, "yyyy-MM-dd") : ""
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Relationship */}
      <div>
        <label
          htmlFor="relationship"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Relationship to You
        </label>
        <input
          type="text"
          id="relationship"
          name="relationship"
          defaultValue={person?.relationship ?? ""}
          placeholder="e.g., Great-grandmother, Uncle, Cousin"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={person?.bio ?? ""}
          placeholder="Tell us about this person..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href={person ? `/people/${person.id}` : "/people"}
          className="px-6 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : person ? "Update Person" : "Add Person"}
        </button>
      </div>
    </form>
  );
}
