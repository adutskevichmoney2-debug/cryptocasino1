"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { FOOTER_SECTIONS } from "./navConfig";
import { LEGAL_SLUGS } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tLegal = useTranslations("legal");

  return (
    <footer className="border-t border-line bg-surface-1">
      <div className="mx-auto w-full max-w-[1284px] px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-[300px]">
            <Logo />
            <p className="mt-3 text-[13px] leading-relaxed text-content-tertiary">{t("tagline")}</p>
            <LanguageSwitcher className="-ml-2.5 mt-3" />
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <p className="pb-3 text-[13px] font-bold text-content">{t(section.titleKey)}</p>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-content-tertiary transition-colors duration-120 hover:text-content"
                    >
                      {tNav(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="pb-3 text-[13px] font-bold text-content">{t("legal")}</p>
            <ul className="flex flex-col gap-2">
              {LEGAL_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/legal/${slug}`}
                    className="text-[13px] text-content-tertiary transition-colors duration-120 hover:text-content"
                  >
                    {tLegal(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-[13px] font-bold text-content">{t("disclaimerTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-content-tertiary">{t("disclaimer")}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-6">
          <span className="flex size-9 items-center justify-center rounded-full border border-line-strong text-xs font-bold text-content-secondary">
            {t("ageWarning")}
          </span>
          <span className="text-xs text-content-tertiary">{t("responsibleGaming")}</span>
          <span className="ml-auto text-xs text-content-disabled">
            © {new Date().getFullYear()} CryptoCasino. {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
