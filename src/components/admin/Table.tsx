import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * Table primitives for the operator panel. Every table lives inside its own
 * horizontally scrollable container so the page body never scrolls sideways,
 * even at 360px.
 */
export function TableScroller({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-line bg-surface-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Table({
  minWidth = "min-w-[720px]",
  className,
  children,
}: {
  minWidth?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <table className={cn("w-full border-collapse text-left text-[13px]", minWidth, className)}>
      {children}
    </table>
  );
}

export function Th({
  className,
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "whitespace-nowrap border-b border-line bg-surface-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-content-tertiary",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("whitespace-nowrap border-b border-line px-3 py-2.5 text-content-secondary", className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function Tr({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("relative transition-colors duration-120 hover:bg-surface-2", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

/**
 * Stretched link: makes the whole row clickable while keeping valid table
 * markup (an anchor cannot wrap a <tr>).
 */
export function RowLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "font-semibold text-content transition-colors duration-120 after:absolute after:inset-0 hover:text-accent",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/** Full-width row used for the "no results" case inside a table body. */
export function EmptyRow({ colSpan, label = "No records" }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-10 text-center text-content-tertiary">
        {label}
      </td>
    </tr>
  );
}
