import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ToolPage } from "@/components/tool-page";
import { Dropzone } from "@/components/dropzone";
import { FileRow } from "@/components/file-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusyBar } from "@/components/busy-bar";
import { unprotectPdf } from "@/lib/pdf-password";
import { downloadBytes, fileToBytes } from "@/lib/download";

export const Route = createFileRoute("/unlock")({ component: UnlockPage });

function UnlockPage() {
  const [file, setFile] = useState<{ name: string; size: number; bytes: Uint8Array } | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const bytes = await unprotectPdf(file.bytes, password);
      downloadBytes(bytes, file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock that file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage id="unlock">
      <Dropzone
        accept="application/pdf,.pdf"
        label="Drop a locked PDF"
        hint="You must already know the password."
        onFiles={async (files) => {
          const f = files[0];
          setFile({ name: f.name, size: f.size, bytes: await fileToBytes(f) });
        }}
      />
      {file ? <FileRow file={{ id: "one", ...file }} onRemove={() => setFile(null)} /> : null}
      <div className="space-y-2">
        <Label htmlFor="pw">Password</Label>
        <Input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {busy ? <BusyBar label="Decrypting…" /> : null}
      <Button type="button" disabled={!file || busy || !password} onClick={run}>
        Download unlocked PDF
      </Button>
      <p className="text-sm text-muted">
        Need to lock a file?{" "}
        <Link to="/protect" className="text-primary underline-offset-2 hover:underline">
          Password protect
        </Link>
      </p>
    </ToolPage>
  );
}
