function runtimeBase(): string {
  const env = (import.meta.env?.BASE_URL as string | undefined) || "/";
  if (env && env !== "/") return env.replace(/\/$/, "");
  if (typeof document !== "undefined") {
    const tagged = document.querySelector('meta[name="folio-base"]')?.getAttribute("content");
    if (tagged && tagged !== "/") return tagged.replace(/\/$/, "");
  }
  return "";
}

/** Vite `base` without a trailing slash. Empty when the app is at the site root. */
export function publicBase(): string {
  return runtimeBase();
}

export function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${publicBase()}${p}`;
}

/** Origin + base path. Use this for the Outlook add-in XML. */
export function siteRootFromWindow(): string {
  return `${window.location.origin}${publicBase()}`;
}
