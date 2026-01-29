"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, X, User, Users } from "lucide-react";
import { AddRelationshipDialog } from "./AddRelationshipDialog";
import { removeRelationship } from "@/actions/people";
import type { FamilyRelation, Person } from "@prisma/client";

interface RelationshipListProps {
  personId: string;
  personName: string;
  relationships: (FamilyRelation & { toPerson: Person })[];
}

export function RelationshipList({
  personId,
  personName,
  relationships,
}: RelationshipListProps) {
  const t = useTranslations("people.relationships");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (relation: FamilyRelation & { toPerson: Person }) => {
    if (!confirm(`Remove relationship?`)) {
      return;
    }

    setRemovingId(relation.id);
    await removeRelationship(
      relation.fromPersonId,
      relation.toPersonId,
      relation.relationType
    );
    setRemovingId(null);
  };

  // Group relationships by type
  const groupedRelations = relationships.reduce(
    (acc, rel) => {
      const type = rel.relationType;
      if (!acc[type]) acc[type] = [];
      acc[type].push(rel);
      return acc;
    },
    {} as Record<string, typeof relationships>
  );

  // Order: Parents, Spouses, Siblings, Children
  const orderedTypes = ["PARENT", "SPOUSE", "SIBLING", "CHILD"] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t("title")}
        </h2>
      </div>

      {relationships.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          {t("noRelationships")}
        </p>
      ) : (
        <div className="space-y-6">
          {orderedTypes.map((type) => {
            const relations = groupedRelations[type];
            if (!relations || relations.length === 0) return null;

            return (
              <div key={type}>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  {t(`types.${type}`)}
                </h3>
                <div className="space-y-2">
                  {relations.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <Link
                        href={`/people/${rel.toPersonId}`}
                        className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {rel.toPerson.avatarUrl ? (
                            <img
                              src={rel.toPerson.avatarUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-medium">
                            {rel.toPerson.firstName} {rel.toPerson.lastName}
                          </span>
                          {rel.toPerson.nickname && (
                            <p className="text-sm text-gray-500">
                              &ldquo;{rel.toPerson.nickname}&rdquo;
                            </p>
                          )}
                        </div>
                      </Link>
                      <button
                        onClick={() => handleRemove(rel)}
                        disabled={removingId === rel.id}
                        className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsDialogOpen(true)}
        className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {t("add")}
      </button>

      <AddRelationshipDialog
        personId={personId}
        personName={personName}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
