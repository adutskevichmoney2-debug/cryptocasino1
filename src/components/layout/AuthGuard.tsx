"use client";

import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

/** Renders children only for authenticated users; guests get a login CTA. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const t = useTranslations("wallet");
  const tAuth = useTranslations("auth");
  const status = useAuthStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const mounted = useMounted();

  if (!mounted || status === "loading") {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (status === "guest") {
    return (
      <EmptyState
        icon={Lock}
        title={t("loginRequired")}
        action={
          <div className="flex gap-2">
            <Button onClick={() => openModal("login")}>{tAuth("login")}</Button>
            <Button variant="secondary" onClick={() => openModal("register")}>
              {tAuth("register")}
            </Button>
          </div>
        }
      />
    );
  }

  return <>{children}</>;
}
