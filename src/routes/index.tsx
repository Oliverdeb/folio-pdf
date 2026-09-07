import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { TOOLS } from "@/lib/tools";
import { Shield, MonitorSmartphone, Lock } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-muted">Private PDF desk</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight tracking-tight sm:text-5xl">
          Combine, lock, and tidy PDFs without sending them anywhere.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Folio runs in this browser tab. The file you drop never leaves the machine. Built for letters, annexures, and
          bundles you would rather not upload.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/merge"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] bg-primary px-4 text-sm font-medium text-primary-fg"
          >
            Combine PDFs
          </Link>
          <Link
            to="/privacy"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-sm)] border border-border bg-surface px-4 text-sm font-medium"
          >
            How it stays private
          </Link>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <Lock className="size-5 text-primary" />
            <p className="mt-3 font-medium">On this device</p>
            <p className="mt-1 text-sm text-muted">No server sees the document or the password.</p>
          </li>
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <Shield className="size-5 text-primary" />
            <p className="mt-3 font-medium">AES-256 lock</p>
            <p className="mt-1 text-sm text-muted">Password-protect a PDF, or unlock one you already hold the key for.</p>
          </li>
          <li className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <MonitorSmartphone className="size-5 text-primary" />
            <p className="mt-3 font-medium">Works on Windows</p>
            <p className="mt-1 text-sm text-muted">Open in Edge. Optional: install this site as an app from the browser menu.</p>
          </li>
        </ul>

        <h2 className="mt-14 font-display text-2xl">Tools</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              to={tool.href}
              className="group rounded-[var(--radius-lg)] border border-border bg-surface p-5 no-underline transition-colors hover:border-primary"
            >
              <h3 className="font-medium text-fg group-hover:text-primary">{tool.title}</h3>
              <p className="mt-2 text-sm text-muted">{tool.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
