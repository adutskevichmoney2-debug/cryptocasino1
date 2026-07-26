import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { TransactionsView } from "@/components/wallet/TransactionsView";

export default async function TransactionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");

  return (
    <div>
      <h1 className="mb-5 font-display text-xl font-extrabold text-content">
        {t("transactionsTitle")}
      </h1>
      <TransactionsView />
    </div>
  );
}
