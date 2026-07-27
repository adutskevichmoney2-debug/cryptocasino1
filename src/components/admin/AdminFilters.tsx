"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";
import { hrefWith } from "./query";

export interface FilterSelectSpec {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Filter bar for the list screens. State lives in the URL so the pages
 * themselves stay server components and every view is linkable.
 */
export function AdminFilters({
  basePath,
  values,
  searchName,
  searchPlaceholder,
  selects = [],
}: {
  basePath: string;
  values: Record<string, string>;
  searchName?: string;
  /** Already translated by the calling page; falls back to a generic label. */
  searchPlaceholder?: string;
  selects?: FilterSelectSpec[];
}) {
  const t = useTranslations("admin.common");
  const router = useRouter();
  const initialSearch = searchName ? (values[searchName] ?? "") : "";
  const [search, setSearch] = useState(initialSearch);
  const debounced = useDebounce(search, 350);
  const applied = useRef(initialSearch);

  useEffect(() => {
    if (!searchName || debounced === applied.current) return;
    applied.current = debounced;
    router.replace(hrefWith(basePath, { ...values, [searchName]: debounced, page: 1 }));
  }, [debounced, searchName, basePath, router, values]);

  const go = (name: string, value: string) => {
    const next: Record<string, string | number> = { ...values, [name]: value, page: 1 };
    // Carry the typed search along: without this, changing a select inside the
    // debounce window navigates with the stale URL value and silently drops
    // whatever the operator just typed (the box keeps showing it).
    if (searchName) {
      next[searchName] = search;
      applied.current = search;
    }
    router.replace(hrefWith(basePath, next));
  };

  const dirty = Object.entries(values).some(([key, value]) => key !== "page" && value);
  const placeholder = searchPlaceholder ?? t("search");

  return (
    <div className="mb-4 flex flex-wrap items-end gap-2.5">
      {searchName && (
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder={placeholder}
          className="w-full min-w-[200px] sm:w-72"
          aria-label={placeholder}
        />
      )}

      {selects.map((spec) => (
        <div key={spec.name} className="w-[calc(50%-5px)] min-w-[140px] sm:w-40">
          <Select
            aria-label={spec.label}
            options={spec.options}
            value={values[spec.name] ?? ""}
            onChange={(e) => go(spec.name, e.target.value)}
          />
        </div>
      ))}

      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            applied.current = "";
            setSearch("");
            router.replace(basePath);
          }}
        >
          <RotateCcw className="size-4" />
          {t("reset")}
        </Button>
      )}
    </div>
  );
}
