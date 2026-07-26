import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { ContactForm } from "@/components/support/ContactForm";

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tContact = await getTranslations("contact");

  return (
    <PageContainer>
      <PageHeader title={t("contactTitle")} description={tContact("subtitle")} />
      <ContactForm />
    </PageContainer>
  );
}