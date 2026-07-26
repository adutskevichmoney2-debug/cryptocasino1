import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { EventDetailView } from "@/components/sports/SportsViews";

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <EventDetailView eventId={id} />;
}
