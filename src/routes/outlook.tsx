import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { OutlookLockForm } from "@/components/outlook-lock-form";
import { Button } from "@/components/ui/button";
import { createMemoryHost, type OutlookAttachment } from "@/lib/outlook-host";
import { outlookManifestXml } from "@/lib/outlook-manifest";
import { fetchSample, SAMPLES } from "@/lib/samples";
import { Mail, Lock, Download } from "lucide-react";

export const Route = createFileRoute("/outlook")({ component: OutlookPage });

function downloadManifest() {
  const xml = outlookManifestXml(window.location.origin);
  const blob = new Blob([xml], { type: "text/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "folio-outlook.xml";
  a.click();
  URL.revokeObjectURL(url);
}

function OutlookPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Outlook for Windows</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Ask before an unlocked PDF goes out.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A new Outlook add-in watches the draft. Attach a PDF that is not password-protected, and Folio asks whether to
          lock it. AES-256 runs on that PC. The mail host never sees the password.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={downloadManifest}>
            <Download className="size-4" />
            Download Outlook add-in
          </Button>
          <Link
            to="/outlook/pane"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium"
          >
            Open the lock pane
          </Link>
        </div>

        <ol className="mt-12 grid gap-3 sm:grid-cols-3">
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">1</p>
            <h2 className="mt-2 font-medium">Install on this PC</h2>
            <p className="mt-2 text-sm text-muted">
              In Outlook for Windows: <strong className="text-fg">Home → Get Add-ins → My add-ins → Add a custom
              add-in → Add from file</strong>. Choose the downloaded XML. Restart Outlook.
            </p>
          </li>
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">2</p>
            <h2 className="mt-2 font-medium">Attach a PDF</h2>
            <p className="mt-2 text-sm text-muted">
              Compose a message and attach an unlocked PDF. A banner asks whether to lock it. Choose{" "}
              <strong className="text-fg">Lock PDFs</strong> and set a password.
            </p>
          </li>
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted">3</p>
            <h2 className="mt-2 font-medium">Send is checked</h2>
            <p className="mt-2 text-sm text-muted">
              If a PDF is still unlocked at send, Outlook asks again. Send anyway, or go back and lock. The ribbon
              button <strong className="text-fg">Lock PDFs</strong> opens the same pane.
            </p>
          </li>
        </ol>

        <h2 className="mt-14 font-display text-2xl">Try the prompt</h2>
        <p className="mt-3 max-w-2xl text-muted">
          This is the same question Outlook will show. The sample letter stays in this tab.
        </p>
        <DemoCompose />

        <h2 className="mt-14 font-display text-2xl">What IT needs</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Folio must be published at the same address this page is on (IIS or the intranet). The add-in file points at
          that address. New Outlook and classic Outlook for Windows both accept it. For a whole firm, deploy the XML
          from Microsoft 365 admin as a custom add-in. Files are locked on the sender's PC — nothing is uploaded to
          Folio.
        </p>
        <p className="mt-4">
          <Link to="/privacy" className="text-primary underline-offset-2 hover:underline">
            How Folio stays private
          </Link>
        </p>
      </div>
    </AppShell>
  );
}

function DemoCompose() {
  const [phase, setPhase] = useState<"idle" | "ask" | "locked" | "skipped">("idle");
  const [fileName, setFileName] = useState("engagement-letter.pdf");

  return (
    <div className="mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm text-muted">
        <Mail className="size-4 text-primary" />
        New message
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <p>
          <span className="text-muted">To</span>{" "}
          <span className="rounded-full bg-raised px-2 py-0.5">client@example.com</span>
        </p>
        <p>
          <span className="text-muted">Subject</span> Engagement letter and annexure
        </p>
        {phase === "idle" ? (
          <Button type="button" variant="outline" onClick={() => setPhase("ask")}>
            Attach unlocked PDF
          </Button>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-raised px-3 py-2">
            <Lock className="size-4 text-primary" />
            {fileName}
            {phase === "locked" ? <span className="text-ok"> · locked</span> : null}
          </p>
        )}
      </div>
      {phase === "ask" ? (
        <div className="border-t border-border bg-raised/60 px-4 py-3">
          <p className="text-sm">{fileName} is not password-protected. Lock it with Folio before it leaves?</p>
          <DemoAsk
            onName={setFileName}
            onLocked={() => setPhase("locked")}
            onSkip={() => setPhase("skipped")}
          />
        </div>
      ) : null}
      {phase === "locked" ? (
        <p className="border-t border-border px-4 py-3 text-sm text-ok">
          The attachment is now AES-256 locked. The recipient will need the password you set.
        </p>
      ) : null}
      {phase === "skipped" ? (
        <p className="border-t border-border px-4 py-3 text-sm text-muted">
          Left unlocked. Outlook will ask again if you send with this file still open.
        </p>
      ) : null}
    </div>
  );
}

function DemoAsk({
  onName,
  onLocked,
  onSkip,
}: {
  onName: (name: string) => void;
  onLocked: () => void;
  onSkip: () => void;
}) {
  const [files, setFiles] = useState<OutlookAttachment[] | null>(null);
  const [host, setHost] = useState<ReturnType<typeof createMemoryHost> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSample(SAMPLES.letter).then((sample) => {
      if (cancelled) return;
      const next = createMemoryHost([
        { id: "demo", name: sample.name, isInline: false, bytes: sample.bytes },
      ]);
      setHost(next);
      setFiles(next.snapshot());
      onName(sample.name);
    });
    return () => {
      cancelled = true;
    };
  }, [onName]);

  if (!host || !files) return <p className="mt-3 text-sm text-muted">Loading sample…</p>;

  return (
    <div className="mt-4 max-w-md rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <OutlookLockForm files={files} host={host} onDone={onLocked} onSkip={onSkip} />
    </div>
  );
}
