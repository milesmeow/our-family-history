"use client";

import { useEffect, useState } from "react";
import { Users, X, ChevronDown, ChevronUp } from "lucide-react";

interface Person {
  id: string;
  firstName: string;
  lastName: string;
}

interface PersonSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function PersonSelector({ selectedIds, onChange }: PersonSelectorProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchPeople() {
      try {
        const response = await fetch("/api/people");
        if (response.ok) {
          const data = await response.json();
          setPeople(data);
        }
      } catch (error) {
        console.error("Failed to fetch people:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeople();
  }, []);

  const filteredPeople = people.filter((person) => {
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const selectedPeople = people.filter((p) => selectedIds.includes(p.id));

  const togglePerson = (personId: string) => {
    if (selectedIds.includes(personId)) {
      onChange(selectedIds.filter((id) => id !== personId));
    } else {
      onChange([...selectedIds, personId]);
    }
  };

  const removePerson = (personId: string) => {
    onChange(selectedIds.filter((id) => id !== personId));
  };

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500 py-2">Loading people...</div>
    );
  }

  if (people.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
        No people added yet. Add family members first to link them to stories.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Selected People Chips */}
      {selectedPeople.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPeople.map((person) => (
            <span
              key={person.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {person.firstName} {person.lastName}
              <button
                type="button"
                onClick={() => removePerson(person.id)}
                className="hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="peopleIds" value={id} />
      ))}

      {/* Expandable Selector */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4" />
            {selectedIds.length === 0
              ? "Select people in this story"
              : `${selectedIds.length} selected`}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-300">
            {/* Search */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* People List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredPeople.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No people found
                </div>
              ) : (
                filteredPeople.map((person) => (
                  <label
                    key={person.id}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(person.id)}
                      onChange={() => togglePerson(person.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {person.firstName} {person.lastName}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
