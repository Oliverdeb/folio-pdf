import { useCallback, useState, type DragEvent, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  accept: string;
  multiple?: boolean;
  label: string;
  hint?: string;
  onFiles: (files: File[]) => void;
};

export function Dropzone({ accept, multiple, label, hint, onFiles }: Props) {
  const [over, setOver] = useState(false);

  const take = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    if (e.dataTransfer.files?.length) take(e.dataTransfer.files);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) take(e.target.files);
    e.target.value = "";
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed px-4 py-8 text-center transition-colors",
        over ? "border-primary bg-raised" : "border-border bg-surface",
      )}
    >
      <input type="file" accept={accept} multiple={multiple} className="sr-only" onChange={onChange} />
      <span className="text-base font-medium text-fg">{label}</span>
      {hint ? <span className="mt-1 max-w-md text-sm text-muted">{hint}</span> : null}
    </label>
  );
}
