import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { ArticleView } from "@/components/support/ArticleView";

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer>
      <ArticleView slug={slug} />
    </PageContainer>
  );
}
