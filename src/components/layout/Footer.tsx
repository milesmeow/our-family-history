import { getTranslations } from "next-intl/server";
import packageJson from "../../../package.json";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200 bg-white">
      <p>{t("version", { version: packageJson.version })}</p>
    </footer>
  );
}
