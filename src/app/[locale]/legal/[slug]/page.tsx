import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { PageContainer } from "@/components/layout/PageContainer";
import { LEGAL_DOCS } from "@/content/legal";
import { LEGAL_SLUGS } from "@/lib/constants";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL_SLUGS.map((slug) => ({ locale, slug })));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const doc = LEGAL_DOCS[locale]?.find((d) => d.slug === slug);
  if (!doc) notFound();

  return (
    <PageContainer>
      <article className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold text-content sm:text-3xl">{doc.title}</h1>
        <p className="mt-1.5 text-[13px] text-content-disabled">{doc.updated}</p>
        <p className="mt-4 rounded-xl border border-line bg-surface-1 p-4 text-sm leading-relaxed text-content-secondary">
          {doc.intro}
        </p>

        <div className="mt-8 space-y-8">
          {doc.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-lg font-bold text-content">
                {i + 1}. {section.heading}
              </h2>
              <div className="mt-2.5 space-y-3">
                {section.paragraphs.map((paragraph, j) => (
                  <p key={j} className="text-sm leading-relaxed text-content-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </PageContainer>
  );
}
