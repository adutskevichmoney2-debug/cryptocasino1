import { Skeleton } from "@/components/ui/Skeleton";
import { TableSkeleton } from "@/components/admin/Panels";

/** Shared route skeleton for every admin screen. */
export default function AdminLoading() {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
