import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { ToastHub } from "@/components/ui/Toast";
import { AppShell } from "@/components/layout/AppShell";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "CryptoCasino — Online Crypto Casino & Sportsbook",
    template: "%s · CryptoCasino",
  },
  description:
    "Demo crypto casino platform: slots, live casino, sportsbook and a multi-coin crypto wallet. Portfolio project — no real money.",
};

export const viewport: Viewport = {
  themeColor: "#0e1116",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <NextIntlClientProvider>
          <MotionProvider>
            <AppShell>{children}</AppShell>
            <ToastHub />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
