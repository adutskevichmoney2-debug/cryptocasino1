"use client";

import { Suspense } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";
import { MobileMenuDrawer } from "./MobileMenuDrawer";
import { ModalRoot } from "./ModalRoot";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { AppInit } from "@/components/providers/AppInit";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/cn";

export function AppShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-dvh">
      <Header />
      <Sidebar />
      <MobileMenuDrawer />

      <div
        className={cn(
          "flex min-h-dvh flex-col pt-16 transition-[padding] duration-200",
          "pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0",
          mounted && collapsed ? "lg:pl-[68px]" : "lg:pl-60",
        )}
      >
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <MobileTabBar />
      <CookieConsent />
      <AppInit />
      <Suspense fallback={null}>
        <ModalRoot />
      </Suspense>
    </div>
  );
}
