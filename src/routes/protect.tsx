import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusyBar } from "@/components/busy-bar";
import { protectPdf } from "@/lib/pdf-password";
import { downloadBytes, fileToBytes } from "@/lib/download";
import { fetchSample, SAMPLES } from "@/lib/samples";

export const Route = createFileRoute("/protect")({ component: ProtectPage });

function ProtectPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const bytes = await protectPdf(file.bytes, password);
      downloadBytes(bytes, file.name.replace(/\.pdf$/i, "") + "-locked.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not lock that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="protect">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a PDF to lock"
        hint="AES-256. The password stays in this tab."
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
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw2">Confirm password</Label>
        <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Encrypting…" /> : null}
      <Button type="button" disabled={!file || busy || password.length < 4} onClick={run}>
        Download locked PDF
      </Button>
      <p className="text-sm text-muted">
        Already locked?{" "}
        <Link to="/unlock" className="text-primary underline-offset-2 hover:underline">
          Remove a password
        </Link>
      </p>
    </ToolPage>
  );
}
