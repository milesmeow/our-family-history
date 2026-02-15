import { getTranslations } from "next-intl/server";
import { EntryForm } from "@/components/entries/EntryForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewEntryPage() {
  const t = await getTranslations("entries");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref="/entries"
        backLabel={tCommon("back")}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t("newEntry")}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <EntryForm />
        </div>
      </main>
    </div>
  );
}
