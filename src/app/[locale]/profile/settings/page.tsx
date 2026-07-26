import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SettingsView } from "@/components/profile/SettingsView";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-extrabold text-content">{t("settingsTitle")}</h1>
      <SettingsView />
    </div>
  );
}