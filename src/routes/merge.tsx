import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { mergePdfs } from "@/lib/pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/merge")({ component: MergePage });

type Item = { id: string; name: string; size: number; bytes: Uint8Array };

function MergePage() {
  const [files, setFiles] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add(list: File[]) {
    const next: Item[] = [];
    for (const file of list) {
      next.push({
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        bytes: await fileToBytes(file),
      });
    }
    setFiles((prev) => [...prev, ...next]);
  }

  async function addSample() {
    const [a, b] = await Promise.all([fetchSample(SAMPLES.letter), fetchSample(SAMPLES.fees)]);
    setFiles([
      { id: crypto.randomUUID(), name: a.name, size: a.bytes.byteLength, bytes: a.bytes },
      { id: crypto.randomUUID(), name: b.name, size: b.bytes.byteLength, bytes: b.bytes },
    ]);
  }

  function move(i: number, dir: -1 | 1) {
    setFiles((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const bytes = await mergePdfs(files.map((f) => f.bytes));
      downloadBytes(bytes, "combined.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not combine those files.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="merge">
      <Dropzone
        accept="application/pdf,.pdf"
        multiple
        label="Drop PDFs to combine"
        hint="Two or more files. Reorder below."
        onFiles={add}
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addSample}>
          Use sample letter + fee schedule
        </Button>
      </div>
      <div className="space-y-2">
        {files.map((file, i) => (
          <FileRow
            key={file.id}
            file={file}
            onRemove={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
            onUp={i > 0 ? () => move(i, -1) : undefined}
            onDown={i < files.length - 1 ? () => move(i, 1) : undefined}
          />
        ))}
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Combining…" /> : null}
      <Button type="button" disabled={files.length < 2 || busy} onClick={run}>
        Download combined PDF
      </Button>
    </ToolPage>
  );
}
