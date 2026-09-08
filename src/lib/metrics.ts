/** One count per finished PDF job. Never files or passwords. */

export type GoatCount = {
  count: (opts?: { path?: string; title?: string; event?: boolean }) => void;
  no_onload?: boolean;
};

declare global {
  interface Window {
    goatcounter?: GoatCount;
    __FOLIO_GOATCOUNTER?: string;
  }
}

const TOOL_EVENTS: Record<string, string> = {
  merge: "Combine PDFs",
  split: "Split / extract",
  compress: "Compress",
  stamp: "Stamp & Bates",
  rearrange: "Rearrange",
  "images-to-pdf": "Photos to PDF",
  "pdf-to-images": "PDF to images",
  "word-to-pdf": "Word to PDF",
  protect: "Password protect",
  unlock: "Remove password",
  outlook: "Outlook protect",
};

export function goatSite(): string {
  const fromWindow =
    typeof globalThis !== "undefined"
      ? (globalThis as { __FOLIO_GOATCOUNTER?: string }).__FOLIO_GOATCOUNTER
      : "";
  const fromEnv =
    typeof import.meta !== "undefined" && import.meta.env && typeof import.meta.env.VITE_GOATCOUNTER === "string"
      ? import.meta.env.VITE_GOATCOUNTER
      : "";
  return sanitizeGoatSite(fromWindow || fromEnv || "");
}

export function sanitizeGoatSite(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || /[:/.]/.test(trimmed)) return "";
  const code = trimmed.replace(/[^a-z0-9-]/g, "");
  if (!code || code.length > 60) return "";
  if (!/^[a-z0-9][a-z0-9-]*$/.test(code)) return "";
  return code;
}

export function metricsEnabled(): boolean {
  return Boolean(goatSite());
}

export function toolEventFromPath(pathname: string): { path: string; title: string } | null {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  const parts = trimmed.split("/").filter(Boolean);
  let slug = parts[parts.length - 1] || "";
  if (slug === "pane" && parts.includes("outlook")) slug = "outlook";
  if (slug === "folio-pdf") return null;
  const title = TOOL_EVENTS[slug];
  if (!title) return null;
  return { path: slug, title };
}

/** Fired once when a processed PDF (or zip) is offered as a download. */
export function trackPdfDone(pathname?: string): void {
  const site = goatSite();
  if (!site) return;
  const href = pathname || (typeof location !== "undefined" ? location.pathname : "");
  const event = toolEventFromPath(href);
  if (!event) return;
  fire(site, { ...event, event: true });
}

function fire(site: string, opts: { path: string; title: string; event?: boolean }): void {
  if (typeof window === "undefined") return;
  const g = window.goatcounter;
  if (g && typeof g.count === "function") {
    g.count(opts);
    return;
  }
  const q = new URLSearchParams({ p: opts.path, t: opts.title });
  if (opts.event) q.set("e", "true");
  const img = new Image();
  img.referrerPolicy = "no-referrer";
  img.src = `https://${site}.goatcounter.com/count?${q.toString()}`;
}
