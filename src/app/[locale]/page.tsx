import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-display text-2xl font-bold">{t("appName")}</h1>
    </main>
  );
}
