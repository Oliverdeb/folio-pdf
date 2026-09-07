import { Progress } from "@/components/ui/progress";

export function BusyBar({ label, value }: { label: string; value?: number }) {
  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <p className="text-sm text-muted">{label}</p>
      <Progress value={value ?? 55} />
    </div>
  );
}
