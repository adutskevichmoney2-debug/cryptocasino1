import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { HelpCenterView } from "@/components/support/HelpCenterView";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tHelp = await getTranslations("help");

  return (
    <PageContainer>
      <PageHeader title={t("helpTitle")} description={tHelp("subtitle")} />
      <HelpCenterView />
    </PageContainer>
  );
}