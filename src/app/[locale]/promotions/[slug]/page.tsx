import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { PromotionDetailView } from "@/components/bonus/PromotionDetailView";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer>
      <PromotionDetailView slug={slug} />
    </PageContainer>
  );
}