"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input, type InputProps } from "./Input";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "rightSlot">>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    const t = useTranslations("auth");

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("hidePassword") : t("showPassword")}
            className="cursor-pointer text-content-tertiary transition-colors duration-120 hover:text-content"
          >
            {visible ? <EyeOff /> : <Eye />}
          </button>
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";
