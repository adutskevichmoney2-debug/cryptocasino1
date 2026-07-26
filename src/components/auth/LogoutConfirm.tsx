"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export function LogoutConfirm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const logout = useAuthStore((s) => s.logout);
  const pushToast = useUiStore((s) => s.pushToast);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    onClose();
    pushToast("info", t("loggedOut"));
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title={t("logout")}>
      <p className="text-sm text-content">{t("logoutConfirm")}</p>
      <p className="mt-1.5 text-[13px] text-content-tertiary">{t("logoutDescription")}</p>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" full onClick={onClose}>
          {tCommon("cancel")}
        </Button>
        <Button variant="danger" full loading={loading} onClick={handleLogout}>
          {t("logout")}
        </Button>
      </div>
    </Modal>
  );
}
