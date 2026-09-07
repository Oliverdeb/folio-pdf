import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusyBar } from "@/components/busy-bar";
import { stampPdf } from "@/lib/pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/stamp")({ component: StampPage });

function StampPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [watermark, setWatermark] = useState("CONFIDENTIAL");
  const [pageNumbers, setPageNumbers] = useState(true);
  const [bates, setBates] = useState(true);
  const [prefix, setPrefix] = useState("BATES");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const bytes = await stampPdf(file.bytes, {
        watermark: watermark.trim() || undefined,
        pageNumbers,
        batesPrefix: bates ? prefix : undefined,
        batesStart: 1,
      });
      downloadBytes(bytes, "stamped.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not stamp that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="stamp">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to stamp"
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
      <div className="space-y-2">
        <Label htmlFor="wm">Watermark</Label>
        <Input id="wm" value={watermark} onChange={(e) => setWatermark(e.target.value)} />
      </div>
      <label className="flex min-h-11 items-center gap-2">
        <input type="checkbox" checked={pageNumbers} onChange={(e) => setPageNumbers(e.target.checked)} />
        Page numbers (n of n)
      </label>
      <label className="flex min-h-11 items-center gap-2">
        <input type="checkbox" checked={bates} onChange={(e) => setBates(e.target.checked)} />
        Bates labels
      </label>
      {bates ? (
        <div className="space-y-2">
          <Label htmlFor="prefix">Prefix</Label>
          <Input id="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        </div>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Stamping…" /> : null}
      <Button type="button" disabled={!file || busy} onClick={run}>
        Download stamped PDF
      </Button>
    </ToolPage>
  );
}
