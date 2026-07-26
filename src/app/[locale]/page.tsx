import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { HomeView } from "@/components/home/HomeView";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer>
      <HomeView />
    </PageContainer>
  );
}
