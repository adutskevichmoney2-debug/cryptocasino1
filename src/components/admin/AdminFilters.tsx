"use client";

import { useEffect, useRef, useState } from "react";
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
  searchPlaceholder = "Search",
  selects = [],
}: {
  basePath: string;
  values: Record<string, string>;
  searchName?: string;
  searchPlaceholder?: string;
  selects?: FilterSelectSpec[];
}) {
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
    router.replace(hrefWith(basePath, { ...values, [name]: value, page: 1 }));
  };

  const dirty = Object.entries(values).some(([key, value]) => key !== "page" && value);

  return (
    <div className="mb-4 flex flex-wrap items-end gap-2.5">
      {searchName && (
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder={searchPlaceholder}
          className="w-full min-w-[200px] sm:w-72"
          aria-label={searchPlaceholder}
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
          Reset
        </Button>
      )}
    </div>
  );
}
