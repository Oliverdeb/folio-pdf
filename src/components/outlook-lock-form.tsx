import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusyBar } from "@/components/busy-bar";
import { FolioMark } from "@/components/folio-mark";
import { protectPdf } from "@/lib/pdf-password";
import { trackPdfDone } from "@/lib/metrics";
import type { OutlookAttachment, OutlookHost } from "@/lib/outlook-host";

export function OutlookLockForm({
  files,
  host,
  onDone,
  onSkip,
}: {
  files: OutlookAttachment[];
  host: OutlookHost;
  onDone: (lockedNames: string[]) => void;
  onSkip: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lock() {
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setError(null);
    setBusy(true);
    const locked: string[] = [];
    try {
      for (const file of files) {
        const bytes = file.bytes ?? (await host.readAttachment(file.id));
        const out = await protectPdf(bytes, password);
        await host.replaceAttachment(file.id, file.name, out);
        locked.push(file.name);
      }
      trackPdfDone("/outlook");
      onDone(locked);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not lock that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FolioMark className="size-7 text-primary" />
        <p className="font-display text-lg tracking-tight">Lock before it leaves?</p>
      </div>
      <p className="text-sm text-muted">
        {files.length === 1
          ? `${files[0].name} is not password-protected.`
          : `${files.length} PDFs are not password-protected.`}{" "}
        Encryption runs on this PC. Outlook never sends the password.
      </p>
      <ul className="space-y-1 text-sm">
        {files.map((f) => (
          <li key={f.id} className="rounded-[var(--radius-sm)] border border-border bg-raised px-3 py-2">
            {f.name}
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <Label htmlFor="folio-outlook-pw">Password</Label>
        <Input
          id="folio-outlook-pw"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="folio-outlook-pw2">Confirm password</Label>
        <Input
          id="folio-outlook-pw2"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Encrypting…" /> : null}
      <div className="flex flex-col gap-2">
        <Button type="button" disabled={busy || password.length < 4} onClick={lock}>
          Lock {files.length === 1 ? "this PDF" : "these PDFs"}
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={onSkip}>
          Keep unlocked
        </Button>
      </div>
    </div>
  );
}
