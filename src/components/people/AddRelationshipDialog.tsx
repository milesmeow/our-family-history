"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { addRelationship } from "@/actions/people";

interface AddRelationshipDialogProps {
  personId: string;
  personName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PersonOption {
  id: string;
  firstName: string;
  lastName: string;
}

const relationTypeValues = ["PARENT", "CHILD", "SPOUSE", "SIBLING"] as const;

export function AddRelationshipDialog({
  personId,
  personName,
  isOpen,
  onClose,
}: AddRelationshipDialogProps) {
  const t = useTranslations("people.relationships");
  const tCommon = useTranslations("common");

  const [people, setPeople] = useState<PersonOption[]>([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [relationType, setRelationType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available people when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsFetching(true);
      fetch(`/api/people?exclude=${personId}`)
        .then((res) => res.json())
        .then((data) => {
          setPeople(data);
          setIsFetching(false);
        })
        .catch(() => {
          setError("Failed to load people");
          setIsFetching(false);
        });
    } else {
      // Reset state when closed
      setSelectedPerson("");
      setRelationType("");
      setError(null);
    }
  }, [isOpen, personId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPerson || !relationType) return;

    setIsLoading(true);
    setError(null);

    const result = await addRelationship({
      fromPersonId: personId,
      toPersonId: selectedPerson,
      relationType,
    });

    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("dialog.title")}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dialog.selectPerson")}
            </label>
            {isFetching ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500">
                {tCommon("loading")}
              </div>
            ) : people.length === 0 ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-500">
                {t("noRelationships")}
              </div>
            ) : (
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">{t("dialog.selectPerson")}...</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("dialog.selectType")}
            </label>
            <select
              value={relationType}
              onChange={(e) => setRelationType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            >
              <option value="">{t("dialog.selectType")}...</option>
              {relationTypeValues.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedPerson || !relationType || people.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? tCommon("loading") : t("add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
