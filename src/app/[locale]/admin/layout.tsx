import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { AdminNav } from "@/components/admin/AdminNav";
import { SupabaseNotConfigured } from "@/components/admin/Panels";
import { requireStaff } from "@/components/admin/guard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "admin.nav" });
  return {
    title: t("operatorPanel"),
    robots: { index: false, follow: false },
  };
}

/** Operator data must never be served from a cached shell. */
export const dynamic = "force-dynamic";

/**
 * Operator shell. Fully localised through the `admin` namespace, and living
 * under [locale] so routing behaves like the rest of the app.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("admin.nav");
  const tc = await getTranslations("admin.common");

  const profile = await requireStaff();

  if (!profile) {
    return (
      <div className="min-h-dvh px-4 py-10">
        <SupabaseNotConfigured />
      </div>
    );
  }

  const isAdmin = profile.role === "admin";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface-1/95 px-3 backdrop-blur-md sm:px-4">
        <Link href="/admin" className="flex shrink-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft">
            <ShieldCheck className="size-4 text-accent" />
          </span>
          <span className="font-display text-sm font-extrabold text-content max-sm:hidden">
            {t("operatorPanel")}
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
          >
            <ExternalLink className="size-4" />
            <span className="max-sm:hidden">{t("backToSite")}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar nickname={profile.nickname} avatarId={profile.avatar_id} size="sm" />
            <div className="min-w-0 max-sm:hidden">
              <p className="truncate text-[13px] font-semibold leading-tight text-content">
                {profile.nickname}
              </p>
            </div>
            <Badge variant={isAdmin ? "warning" : "accent"}>{tc(`role.${profile.role}`)}</Badge>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1">
        <aside className="hidden shrink-0 border-r border-line lg:block lg:w-56">
          <div className="sticky top-14">
            <AdminNav isAdmin={isAdmin} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-line lg:hidden">
            <AdminNav isAdmin={isAdmin} orientation="horizontal" />
          </div>
          <main className="min-w-0 flex-1 px-3 py-5 sm:px-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
