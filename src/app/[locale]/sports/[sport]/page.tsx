import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { SportView } from "@/components/sports/SportsViews";
import { SPORT_SLUGS, type SportSlug } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SPORT_SLUGS.map((sport) => ({ locale, sport })));
}

export default async function SportPage({
  params,
}: {
  params: Promise<{ locale: Locale; sport: string }>;
}) {
  const { locale, sport } = await params;
  setRequestLocale(locale);

  if (!SPORT_SLUGS.includes(sport as SportSlug)) notFound();

  return <SportView sport={sport} />;
}
