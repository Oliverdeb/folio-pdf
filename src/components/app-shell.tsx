import { Link } from "@tanstack/react-router";
import { FolioMark } from "@/components/folio-mark";
import { TOOLS } from "@/lib/tools";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-fg no-underline">
            <FolioMark className="size-8 text-primary" />
            <span className="font-display text-xl tracking-tight">Folio</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted md:flex">
            <Link to="/privacy" className="hover:text-fg">
              How it stays private
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border px-4 py-8 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Files never leave this device. No account. No upload.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {TOOLS.slice(0, 4).map((t) => (
              <Link key={t.id} to={t.href} className="hover:text-fg">
                {t.title}
              </Link>
            ))}
            <Link to="/privacy" className="hover:text-fg">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
