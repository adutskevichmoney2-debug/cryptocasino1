import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { SportsNav } from "@/components/sports/SportsNav";
import { BetslipMobile, BetslipRail } from "@/components/sports/Betslip";

export default async function SportsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <PageContainer>
      <div className="flex items-start gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-5">
            <SportsNav />
          </div>
          {children}
        </div>
        <BetslipRail />
      </div>
      <BetslipMobile />
    </PageContainer>
  );
}
