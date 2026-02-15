import { getTranslations } from "next-intl/server";
import { PersonForm } from "@/components/people/PersonForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function NewPersonPage() {
  const t = await getTranslations("people");
  const tCommon = await getTranslations("common");

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        variant="subpage"
        backHref="/people"
        backLabel={tCommon("back")}
        title={t("newPerson")}
        maxWidth="3xl"
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PersonForm />
        </div>
      </main>
    </div>
  );
}
