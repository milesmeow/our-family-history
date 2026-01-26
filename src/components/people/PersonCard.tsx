import Link from "next/link";
import { format } from "date-fns";
import { User, BookOpen, Users } from "lucide-react";
import type { Person } from "@prisma/client";

interface PersonCardProps {
  person: Person & {
    _count: {
      entries: number;
      relationsFrom: number;
    };
  };
}

export function PersonCard({ person }: PersonCardProps) {
  const fullName = `${person.firstName} ${person.lastName}`;

  return (
    <Link
      href={`/people/${person.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt={fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-blue-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
          {person.nickname && (
            <p className="text-sm text-gray-500">&ldquo;{person.nickname}&rdquo;</p>
          )}
          {person.relationship && (
            <p className="text-sm text-blue-600 font-medium">
              {person.relationship}
            </p>
          )}
          {person.birthDate && (
            <p className="text-sm text-gray-500 mt-1">
              {format(person.birthDate, "MMM d, yyyy")}
              {person.deathDate && ` – ${format(person.deathDate, "MMM d, yyyy")}`}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          {person._count.entries} {person._count.entries === 1 ? "story" : "stories"}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {person._count.relationsFrom} {person._count.relationsFrom === 1 ? "relation" : "relations"}
        </span>
      </div>
    </Link>
  );
}
