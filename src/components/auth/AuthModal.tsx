"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthModal({
  open,
  onClose,
  initialTab,
  initialRefCode,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: "login" | "register";
  initialRefCode?: string;
}) {
  const t = useTranslations("auth");
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  // ModalRoot keeps this component mounted across open/close, so the tab has to
  // follow initialTab — otherwise "Register" reopens on whatever tab was last shown.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  return (
    <Modal open={open} onClose={onClose} size="sm" title={t(tab === "login" ? "login" : "register")}>
      <Tabs
        grow
        className="mb-5"
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "login", label: t("login") },
          { value: "register", label: t("register") },
        ]}
      />

      {tab === "login" ? (
        <LoginForm onSwitchToRegister={() => setTab("register")} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setTab("login")} initialRefCode={initialRefCode} />
      )}

      <p className="mt-5 flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-xs leading-relaxed text-content-tertiary">
        <Info className="mt-px size-3.5 shrink-0" />
        {t("demoNotice")}
      </p>
    </Modal>
  );
}
