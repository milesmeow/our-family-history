"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteEntry } from "@/actions/entries";

interface DeleteEntryButtonProps {
  id: string;
  title: string;
}

export function DeleteEntryButton({ id, title }: DeleteEntryButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    await deleteEntry(id);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
