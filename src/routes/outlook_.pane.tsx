import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { OutlookLockForm } from "@/components/outlook-lock-form";
import { Button } from "@/components/ui/button";
import { FolioMark } from "@/components/folio-mark";
import {
  createMemoryHost,
  findUnprotectedPdfAttachments,
  type OutlookAttachment,
  type OutlookHost,
} from "@/lib/outlook-host";
import { createOfficeHost, officeIsAvailable } from "@/lib/outlook-office";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/outlook_/pane")({
  ssr: false,
  component: OutlookPanePage,
});

function OutlookPanePage() {
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "done" | "error">("loading");
  const [host, setHost] = useState<OutlookHost | null>(null);
  const [files, setFiles] = useState<OutlookAttachment[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://appsforoffice.microsoft.com/lib/1/hosted/office.js";
    script.async = true;
    document.head.appendChild(script);

    let cancelled = false;
    const started = Date.now();

    async function boot() {
      while (!cancelled && Date.now() - started < 2000) {
        const office = (window as unknown as { Office?: { onReady?: (cb: () => void) => void } }).Office;
        if (office?.onReady) {
          await new Promise<void>((resolve) => {
            office.onReady(() => resolve());
          });
          break;
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      if (cancelled) return;

      if (officeIsAvailable()) {
        const officeHost = createOfficeHost();
        setHost(officeHost);
        try {
          const found = await findUnprotectedPdfAttachments(officeHost);
          setFiles(found);
          setStatus(found.length ? "ready" : "empty");
        } catch (err) {
          setNote(err instanceof Error ? err.message : "Could not read attachments.");
          setStatus("error");
        }
        return;
      }

      const sample = await fetchSample(SAMPLES.letter);
      const memory = createMemoryHost([
        { id: "demo", name: sample.name, isInline: false, bytes: sample.bytes },
      ]);
      setDemo(true);
      setHost(memory);
      setFiles(memory.snapshot());
      setStatus("ready");
    }

    void boot();
    return () => {
      cancelled = true;
      script.remove();
    };
  }, []);

  return (
    <div className="min-h-dvh bg-bg px-4 py-5">
      <div className="mx-auto max-w-md">
        {status === "loading" ? <p className="text-sm text-muted">Looking at attachments…</p> : null}
        {status === "error" ? <p className="text-sm text-danger">{note}</p> : null}
        {status === "empty" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolioMark className="size-7 text-primary" />
              <p className="font-display text-lg tracking-tight">No unlocked PDFs</p>
            </div>
            <p className="text-sm text-muted">
              Attach a PDF that is not password-protected and this pane will offer to lock it on this PC.
            </p>
          </div>
        ) : null}
        {status === "ready" && host ? (
          <OutlookLockForm
            files={files}
            host={host}
            onDone={(names) => {
              setNote(
                names.length === 1
                  ? `${names[0]} is now locked. The recipient will need the password.`
                  : `${names.length} PDFs are now locked.`,
              );
              setStatus("done");
            }}
            onSkip={() => {
              setNote("Left unlocked. Outlook will ask again if you send.");
              setStatus("done");
            }}
          />
        ) : null}
        {status === "done" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FolioMark className="size-7 text-primary" />
              <p className="font-display text-lg tracking-tight">Folio</p>
            </div>
            <p className="text-sm text-muted">{note}</p>
          </div>
        ) : null}
        {demo ? (
          <p className="mt-6 text-xs text-subtle">
            Demo mode — not inside Outlook.{" "}
            <Link to="/outlook" className="text-primary underline-offset-2 hover:underline">
              Install the add-in
            </Link>
          </p>
        ) : (
          <div className="mt-6">
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 px-0 text-sm text-muted"
              onClick={() => window.location.reload()}
            >
              Check attachments again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
