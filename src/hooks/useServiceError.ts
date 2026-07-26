"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { ServiceError } from "@/services/types";

/**
 * Turns a service error code into a translated message. Unknown codes fall back
 * to a generic string rather than leaking a raw code into the UI.
 */
export function useServiceError() {
  const t = useTranslations("errors");

  return useCallback(
    (error: ServiceError): string => {
      try {
        return t(error.code as never, error.values as never);
      } catch {
        return t("unknown");
      }
    },
    [t],
  );
}
