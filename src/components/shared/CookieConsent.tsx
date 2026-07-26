"use client";

import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { Cookie } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { fadeUp, transitionStructural } from "@/lib/motion";

export function CookieConsent() {
  const t = useTranslations("cookies");
  const mounted = useMounted();
  const accepted = useUiStore((s) => s.cookieConsent);
  const accept = useUiStore((s) => s.acceptCookies);

  return (
    <AnimatePresence>
      {mounted && !accepted && (
        <m.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitionStructural}
          className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-[720px] rounded-xl border border-line bg-surface-2 p-4 shadow-dropdown max-lg:bottom-[calc(68px+env(safe-area-inset-bottom))]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Cookie className="size-5 shrink-0 text-accent" />
            <p className="flex-1 text-[13px] leading-relaxed text-content-secondary">
              {t("message")}{" "}
              <Link href="/legal/privacy" className="text-accent hover:underline">
                {t("learnMore")}
              </Link>
            </p>
            <Button size="sm" onClick={accept} className="shrink-0 max-sm:w-full">
              {t("accept")}
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
