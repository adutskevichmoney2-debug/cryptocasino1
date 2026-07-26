/** Shared search-param plumbing for the paginated admin list screens. */

export const PAGE_SIZE = 25;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function param(searchParams: RawSearchParams, key: string): string {
  const value = searchParams[key];
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? "").trim();
}

export function pageFrom(searchParams: RawSearchParams): number {
  const n = Number.parseInt(param(searchParams, "page"), 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

export function rangeFor(page: number, size = PAGE_SIZE): [number, number] {
  const from = (page - 1) * size;
  return [from, from + size - 1];
}

/** Builds `/path?a=1&b=2`, dropping empty values and `page=1`. */
export function hrefWith(
  basePath: string,
  values: Record<string, string | number | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const str = value === undefined ? "" : String(value);
    if (!str || (key === "page" && str === "1")) continue;
    qs.set(key, str);
  }
  const query = qs.toString();
  return query ? `${basePath}?${query}` : basePath;
}
