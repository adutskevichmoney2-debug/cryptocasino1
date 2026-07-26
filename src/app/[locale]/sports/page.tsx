import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SportsHomeView } from "@/components/sports/SportsViews";

export default async function SportsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SportsHomeView />;
}