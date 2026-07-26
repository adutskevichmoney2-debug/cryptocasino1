import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { CategoryView } from "@/components/casino/CategoryView";
import { CASINO_CATEGORIES, type CasinoCategory } from "@/lib/constants";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CASINO_CATEGORIES.map((slug) => ({ locale, slug })),
  );
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  if (!CASINO_CATEGORIES.includes(slug as CasinoCategory)) notFound();

  const t = await getTranslations("casino");

  return (
    <PageContainer>
      <PageHeader title={t(`categories.${slug as CasinoCategory}`)} />
      <CategoryView category={slug} />
    </PageContainer>
  );
}
