import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { docxToPdf } from "@/lib/docx-to-pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/word-to-pdf")({ component: WordPage });

function WordPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const bytes = await docxToPdf(file.bytes);
      downloadBytes(bytes, file.name.replace(/\.docx$/i, "") + ".pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not convert that Word file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="word-to-pdf">
      <Dropzone
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        label="Drop a Word letter (.docx)"
        onFiles={async (files) => {
          const f = files[0];
          setFile({ name: f.name, size: f.size, bytes: await fileToBytes(f) });
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const s = await fetchSample(SAMPLES.docx);
          setFile({ name: s.name, size: s.bytes.byteLength, bytes: s.bytes });
        }}
      >
        Use sample letter
      </Button>
      {file ? <FileRow file={{ id: "one", ...file }} onRemove={() => setFile(null)} /> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Converting…" /> : null}
      <Button type="button" disabled={!file || busy} onClick={run}>
        Download PDF
      </Button>
    </ToolPage>
  );
}
