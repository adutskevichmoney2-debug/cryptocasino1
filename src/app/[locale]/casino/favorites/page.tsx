import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { FavoritesView } from "@/components/casino/FavoritesView";

export default async function FavoritesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <PageContainer>
      <PageHeader title={t("favorites")} />
      <FavoritesView />
    </PageContainer>
  );
}
