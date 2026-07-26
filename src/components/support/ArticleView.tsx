"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NotFoundContent } from "@/components/shared/NotFoundContent";

export function ArticleView({ slug }: { slug: string }) {
  const t = useTranslations("help");
  const locale = useLocale();

  const { data: article, loading } = useAsync(
    () => services.support.getArticleBySlug(locale, slug),
    [locale, slug],
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!article) return <NotFoundContent />;

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/help"
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-content-tertiary transition-colors duration-120 hover:text-content"
      >
        <ArrowLeft className="size-4" />
        {t("backToHelp")}
      </Link>

      <Badge variant="accent" className="mb-3 block w-fit">
        {t(`categories.${article.category}` as never)}
      </Badge>
      <h1 className="font-display text-2xl font-extrabold text-content sm:text-3xl">
        {article.title}
      </h1>

      <div className="mt-5 space-y-4">
        {article.body.map((paragraph, i) => (
          <p key={i} className="text-sm leading-relaxed text-content-secondary">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-1 p-5">
        <p className="text-sm font-semibold text-content">{t("contactCta")}</p>
        <Link href="/help/contact">
          <Button variant="soft">{t("contactButton")}</Button>
        </Link>
      </div>
    </article>
  );
}
