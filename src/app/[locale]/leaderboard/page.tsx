import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { LeaderboardView } from "@/components/bonus/LeaderboardView";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tSub = await getTranslations("leaderboard");

  return (
    <PageContainer>
      <PageHeader title={t("leaderboardTitle")} description={tSub("subtitle")} />
      <LeaderboardView />
    </PageContainer>
  );
}