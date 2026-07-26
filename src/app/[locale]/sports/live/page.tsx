import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { LiveView } from "@/components/sports/SportsViews";

export default async function LivePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LiveView />;
}
