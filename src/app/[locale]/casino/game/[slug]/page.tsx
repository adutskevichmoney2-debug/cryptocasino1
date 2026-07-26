import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { GameView } from "@/components/casino/GameView";

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <GameView slug={slug} />
      </Suspense>
    </PageContainer>
  );
}
