"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deletePerson } from "@/actions/people";

interface DeletePersonButtonProps {
  id: string;
  name: string;
}

export function DeletePersonButton({ id, name }: DeletePersonButtonProps) {
  const t = useTranslations("people");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    setIsDeleting(true);
    await deletePerson(id);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? tCommon("loading") : tCommon("delete")}
    </button>
  );
}
