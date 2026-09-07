import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { compressPdf } from "@/lib/pdf-compress";
import { imagesToPdf } from "@/lib/pdf";
import { renderAllPagesPng } from "@/lib/pdf-preview";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { savingsLabel } from "@/lib/format";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/compress")({ component: CompressPage });

function CompressPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [mode, setMode] = useState<"text" | "raster">("text");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      let out: Uint8Array;
      if (mode === "text") {
        out = await compressPdf(file.bytes, "text");
      } else {
        const pages = await renderAllPagesPng(file.bytes, 1.2);
        out = await imagesToPdf(
          pages.map((p) => ({ bytes: p.bytes, mime: "image/png" })),
          "a4",
        );
      }
      setNote(savingsLabel(file.bytes.byteLength, out.byteLength));
      downloadBytes(out, "compressed.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compress that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="compress">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to shrink"
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
      <label className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
        <input type="radio" name="cmode" checked={mode === "text"} onChange={() => setMode("text")} />
        Keep text (rebuild streams)
      </label>
      <label className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3">
        <input type="radio" name="cmode" checked={mode === "raster"} onChange={() => setMode("raster")} />
        Flatten pages to images
      </label>
      {note ? <p className="text-sm text-ok">{note}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Compressing…" /> : null}
      <Button type="button" disabled={!file || busy} onClick={run}>
        Download compressed PDF
      </Button>
    </ToolPage>
  );
}
