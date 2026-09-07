import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { toolById, type ToolId } from "@/lib/tools";
import type { ReactNode } from "react";

export function ToolPage({ id, children }: { id: ToolId; children: ReactNode }) {
  const tool = toolById(id);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <p className="text-sm text-muted">
          <Link to="/" className="hover:text-fg">
            All tools
          </Link>
          <span className="px-2">/</span>
          {tool.title}
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">{tool.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{tool.detail}</p>
        <div className="mt-8 space-y-6">{children}</div>
      </div>
    </AppShell>
  );
}
