"use client";

import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onValueChange: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onValueChange, placeholder, ...props }, ref) => {
    const t = useTranslations("common");

    return (
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface-2 px-3 transition-colors duration-120",
          "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft hover:border-graphite-500",
          className,
        )}
      >
        <Search className="size-4 shrink-0 text-content-tertiary" aria-hidden="true" />
        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder ?? t("search")}
          className="h-full w-full min-w-0 bg-transparent text-sm text-content outline-none placeholder:text-content-disabled [&::-webkit-search-cancel-button]:hidden"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label={t("close")}
            className="cursor-pointer text-content-tertiary transition-colors duration-120 hover:text-content"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";
