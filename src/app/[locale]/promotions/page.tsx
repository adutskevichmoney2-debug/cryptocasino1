import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { PromotionsView } from "@/components/bonus/PromotionsView";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tSub = await getTranslations("promotions");

  return (
    <PageContainer>
      <PageHeader title={t("promotionsTitle")} description={tSub("subtitle")} />
      <PromotionsView />
    </PageContainer>
  );
}