/** Privacy-friendly counts: which tool page, and whether a PDF was downloaded. Never files or passwords. */

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

function toolPath(pathname: string): string {
  const trimmed = pathname.replace(/\/$/, "") || "/";
  const base = goatSite() && typeof document !== "undefined"
    ? document.querySelector('meta[name="folio-base"]')?.getAttribute("content") || ""
    : "";
  const prefix = (base || "").replace(/\/$/, "");
  if (prefix && (trimmed === prefix || trimmed.startsWith(prefix + "/"))) {
    return trimmed.slice(prefix.length) || "/";
  }
  return trimmed;
}

export function trackPage(pathname: string): void {
  const site = goatSite();
  if (!site) return;
  fire(site, { path: toolPath(pathname), title: typeof document !== "undefined" ? document.title : "Folio" });
}

/** Fired when a processed PDF (or zip) is offered as a download. */
export function trackPdfDone(pathname?: string): void {
  const site = goatSite();
  if (!site) return;
  const path = typeof location !== "undefined" ? location.pathname : pathname || "/";
  fire(site, {
    path: `/done${toolPath(path)}`,
    title: "PDF finished",
    event: true,
  });
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
