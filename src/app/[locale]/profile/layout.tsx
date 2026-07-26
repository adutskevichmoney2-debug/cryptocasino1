import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ProfileNav } from "@/components/profile/ProfileNav";

export default async function ProfileLayout({
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
      <AuthGuard>
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="shrink-0 lg:w-56">
            <ProfileNav />
          </div>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </AuthGuard>
    </PageContainer>
  );
}
