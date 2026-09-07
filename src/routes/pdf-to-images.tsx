import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { renderAllPagesPng } from "@/lib/pdf-preview";
import { fileToBytes } from "@/lib/download";
import { downloadZip } from "@/lib/zip";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/pdf-to-images")({ component: PdfImagesPage });

function PdfImagesPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const pages = await renderAllPagesPng(file.bytes, 1.6);
      await downloadZip(pages, "pages.zip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export those pages.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="pdf-to-images">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to export as PNG"
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
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Exporting pages…" /> : null}
      <Button type="button" disabled={!file || busy} onClick={run}>
        Download PNG zip
      </Button>
    </ToolPage>
  );
}
