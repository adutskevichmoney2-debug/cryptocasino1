import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { VipView } from "@/components/bonus/VipView";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tSub = await getTranslations("vip");

  return (
    <PageContainer>
      <PageHeader title={t("vipTitle")} description={tSub("subtitle")} />
      <VipView />
    </PageContainer>
  );
}