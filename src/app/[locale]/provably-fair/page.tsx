import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fingerprint, Hash, KeyRound, ListChecks, User } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  { icon: Fingerprint, titleKey: "howTitle", textKey: "howText" },
  { icon: KeyRound, titleKey: "serverTitle", textKey: "serverText" },
  { icon: User, titleKey: "clientTitle", textKey: "clientText" },
  { icon: Hash, titleKey: "nonceTitle", textKey: "nonceText" },
  { icon: ListChecks, titleKey: "verifyTitle", textKey: "verifyText" },
] as const;

export default async function Page({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages");
  const tPf = await getTranslations("provablyFair");

  return (
    <PageContainer>
      <PageHeader title={t("provablyFairTitle")} description={tPf("subtitle")} />
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {SECTIONS.map((section) => (
          <Card key={section.titleKey} className="flex gap-4 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <section.icon className="size-5 text-accent" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-content">{tPf(section.titleKey)}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-content-secondary">{tPf(section.textKey)}</p>
            </div>
          </Card>
        ))}
        <p className="rounded-xl border border-dashed border-line-strong p-4 text-[13px] leading-relaxed text-content-tertiary">
          {tPf("demoNote")}
        </p>
      </div>
    </PageContainer>
  );
}