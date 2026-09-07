import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { BusyBar } from "@/components/busy-bar";
import { pageCount, rearrangePdf } from "@/lib/pdf";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/rearrange")({ component: RearrangePage });

function RearrangePage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(bytes: Uint8Array, name: string) {
    const n = await pageCount(bytes);
    setFile({ name, size: bytes.byteLength, bytes });
    setOrder(Array.from({ length: n }, (_, i) => i));
  }

  function move(i: number, dir: -1 | 1) {
    setOrder((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const bytes = await rearrangePdf(file.bytes, order);
      downloadBytes(bytes, "rearranged.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not rearrange that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="rearrange">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to reorder"
        onFiles={async (files) => {
          const f = files[0];
          await load(await fileToBytes(f), f.name);
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          const s = await fetchSample(SAMPLES.letter);
          await load(s.bytes, s.name);
        }}
      >
        Use sample letter
      </Button>
      {file ? <FileRow file={{ id: "one", ...file }} onRemove={() => { setFile(null); setOrder([]); }} /> : null}
      <ol className="space-y-2">
        {order.map((orig, i) => (
          <li key={`${orig}-${i}`} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2">
            <span className="flex-1 text-sm">Page {orig + 1}</span>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => move(i, -1)} disabled={i === 0}>
              Up
            </Button>
            <Button type="button" variant="ghost" className="min-h-11" onClick={() => move(i, 1)} disabled={i === order.length - 1}>
              Down
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11"
              onClick={() => setOrder((prev) => prev.filter((_, idx) => idx !== i))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ol>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Saving…" /> : null}
      <Button type="button" disabled={!file || order.length === 0 || busy} onClick={run}>
        Download rearranged PDF
      </Button>
    </ToolPage>
  );
}
