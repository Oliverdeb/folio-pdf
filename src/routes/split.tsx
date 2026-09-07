import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusyBar } from "@/components/busy-bar";
import { extractPages, splitByChunk, splitEachPage } from "@/lib/pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { downloadZip } from "@/lib/zip";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/split")({ component: SplitPage });

type Mode = "extract" | "each" | "chunks";

function SplitPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [mode, setMode] = useState<Mode>("extract");
  const [range, setRange] = useState("1");
  const [chunk, setChunk] = useState("2");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      if (mode === "extract") {
        const bytes = await extractPages(file.bytes, range);
        downloadBytes(bytes, "extracted.pdf");
      } else if (mode === "each") {
        const files = await splitEachPage(file.bytes);
        await downloadZip(files, "pages.zip");
      } else {
        const n = Number(chunk);
        const files = await splitByChunk(file.bytes, n);
        await downloadZip(files, "chunks.zip");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not split that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="split">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to split"
        onFiles={async (files) => {
          const f = files[0];
          setFile({ name: f.name, size: f.size, bytes: await fileToBytes(f) });
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const s = await fetchSample(SAMPLES.letter);
          setFile({ name: s.name, size: s.bytes.byteLength, bytes: s.bytes });
        }}
      >
        Use sample letter
      </Button>
      {file ? <FileRow file={{ id: "one", ...file }} onRemove={() => setFile(null)} /> : null}
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">How to split</legend>
        {(
          [
            ["extract", "Extract a page range"],
            ["each", "One PDF per page (zip)"],
            ["chunks", "Chunks of N pages (zip)"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
            <input type="radio" name="mode" checked={mode === value} onChange={() => setMode(value)} />
            {label}
          </label>
        ))}
      </fieldset>
      {mode === "extract" ? (
        <div className="space-y-2">
          <Label htmlFor="range">Pages</Label>
          <Input id="range" value={range} onChange={(e) => setRange(e.target.value)} placeholder="1,3-5" />
        </div>
      ) : null}
      {mode === "chunks" ? (
        <div className="space-y-2">
          <Label htmlFor="chunk">Pages per file</Label>
          <Input id="chunk" value={chunk} onChange={(e) => setChunk(e.target.value)} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Splitting…" /> : null}
      <Button type="button" disabled={!file || busy} onClick={run}>
        Download
      </Button>
    </ToolPage>
  );
}
