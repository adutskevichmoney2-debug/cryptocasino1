"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUiStore, type ModalId } from "@/stores/uiStore";
import { AuthModal } from "@/components/auth/AuthModal";
import { LogoutConfirm } from "@/components/auth/LogoutConfirm";
import { WalletModal } from "@/components/wallet/WalletModal";

const DEEP_LINKABLE: ModalId[] = ["login", "register", "wallet"];

/**
 * Renders whatever sits on top of the modal stack and opens modals requested
 * through the URL (?modal=login, ?modal=wallet&tab=deposit, ?ref=CODE).
 */
export function ModalRoot() {
  const modalStack = useUiStore((s) => s.modalStack);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const searchParams = useSearchParams();

  const requested = searchParams.get("modal");
  const tab = searchParams.get("tab");
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (!requested) return;
    if (!DEEP_LINKABLE.includes(requested as ModalId)) return;
    openModal(requested as ModalId, { tab, refCode: ref });
  }, [requested, tab, ref, openModal]);

  const top = modalStack[modalStack.length - 1];
  const props = (top?.props ?? {}) as { tab?: string | null; refCode?: string | null };

  return (
    <>
      <AuthModal
        open={top?.id === "login" || top?.id === "register"}
        onClose={closeModal}
        initialTab={top?.id === "register" ? "register" : "login"}
        initialRefCode={props.refCode ?? undefined}
      />
      <WalletModal
        open={top?.id === "wallet"}
        onClose={closeModal}
        initialTab={props.tab === "withdraw" ? "withdraw" : "deposit"}
      />
      <LogoutConfirm open={top?.id === "logout"} onClose={closeModal} />
    </>
  );
}
