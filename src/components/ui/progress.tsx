import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-raised", className)} role="progressbar" aria-valuenow={pct}>
      <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${pct}%` }} />
    </div>
  );
}
