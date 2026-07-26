import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ModalId =
  | "login"
  | "register"
  | "wallet"
  | "logout"
  | "demo-deposit";

export interface ModalEntry {
  id: ModalId;
  props?: Record<string, unknown>;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface UiState {
  modalStack: ModalEntry[];
  openModal: (id: ModalId, props?: Record<string, unknown>) => void;
  closeModal: () => void;
  closeAllModals: () => void;

  toasts: ToastItem[];
  pushToast: (type: ToastType, message: string) => void;
  dismissToast: (id: number) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  cookieConsent: boolean;
  acceptCookies: () => void;
}

let toastSeq = 0;
const TOAST_TTL_MS = 4500;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      modalStack: [],
      openModal: (id, props) =>
        set((s) => ({
          // Re-opening the same modal replaces its props instead of stacking duplicates
          modalStack: [...s.modalStack.filter((m) => m.id !== id), { id, props }],
        })),
      closeModal: () => set((s) => ({ modalStack: s.modalStack.slice(0, -1) })),
      closeAllModals: () => set({ modalStack: [] }),

      toasts: [],
      pushToast: (type, message) => {
        const id = ++toastSeq;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { id, type, message }] }));
        setTimeout(() => get().dismissToast(id), TOAST_TTL_MS);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
      chatOpen: false,
      setChatOpen: (open) => set({ chatOpen: open }),
      cookieConsent: false,
      acceptCookies: () => set({ cookieConsent: true }),
    }),
    {
      name: "cc:ui:global",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, cookieConsent: s.cookieConsent }),
      skipHydration: true,
    },
  ),
);

/** Imperative toast helpers usable outside React components (services, stores). */
export const toast = {
  success: (message: string) => useUiStore.getState().pushToast("success", message),
  error: (message: string) => useUiStore.getState().pushToast("error", message),
  info: (message: string) => useUiStore.getState().pushToast("info", message),
  warning: (message: string) => useUiStore.getState().pushToast("warning", message),
};
