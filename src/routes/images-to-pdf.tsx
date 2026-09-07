import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { imagesToPdf, type PageFit } from "@/lib/pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";

export const Route = createFileRoute("/images-to-pdf")({ component: ImagesPage });

type Item = { id: string; name: string; size: number; bytes: Uint8Array; mime: string };

function ImagesPage() {
  const [files, setFiles] = useState<Item[]>([]);
  const [fit, setFit] = useState<PageFit>("a4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const bytes = await imagesToPdf(
        files.map((f) => ({ bytes: f.bytes, mime: f.mime })),
        fit,
      );
      downloadBytes(bytes, "photos.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build that PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="images-to-pdf">
      <Dropzone
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        multiple
        label="Drop photos or scans"
        hint="JPEG or PNG."
        onFiles={async (list) => {
          const next: Item[] = [];
          for (const file of list) {
            next.push({
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              bytes: await fileToBytes(file),
              mime: file.type || "image/jpeg",
            });
          }
          setFiles((prev) => [...prev, ...next]);
        }}
      />
      <div className="space-y-2">
        {files.map((file) => (
          <FileRow key={file.id} file={file} onRemove={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))} />
        ))}
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Page size</legend>
        {(["a4", "letter", "original"] as const).map((value) => (
          <label key={value} className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
            <input type="radio" name="fit" checked={fit === value} onChange={() => setFit(value)} />
            {value === "a4" ? "A4" : value === "letter" ? "Letter" : "Original image size"}
          </label>
        ))}
      </fieldset>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Building PDF…" /> : null}
      <Button type="button" disabled={files.length === 0 || busy} onClick={run}>
        Download PDF
      </Button>
    </ToolPage>
  );
}
