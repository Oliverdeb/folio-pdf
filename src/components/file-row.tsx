import { formatBytes } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, X } from "lucide-react";

export type ListedFile = {
  id: string;
  name: string;
  size: number;
};

type Props = {
  file: ListedFile;
  onRemove?: () => void;
  onUp?: () => void;
  onDown?: () => void;
};

export function FileRow({ file, onRemove, onUp, onDown }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted">{formatBytes(file.size)}</p>
      </div>
      <div className="flex items-center gap-1">
        {onUp ? (
          <Button type="button" variant="ghost" className="min-h-11 w-11 px-0" onClick={onUp} aria-label="Move up">
            <ArrowUp className="size-4" />
          </Button>
        ) : null}
        {onDown ? (
          <Button type="button" variant="ghost" className="min-h-11 w-11 px-0" onClick={onDown} aria-label="Move down">
            <ArrowDown className="size-4" />
          </Button>
        ) : null}
        {onRemove ? (
          <Button type="button" variant="ghost" className="min-h-11 w-11 px-0" onClick={onRemove} aria-label="Remove">
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
