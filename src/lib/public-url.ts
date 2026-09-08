/** Vite `base` without a trailing slash. Empty when the app is at the site root. */
export function publicBase(): string {
  const raw = (import.meta.env?.BASE_URL as string | undefined) || "/";
  if (raw === "/") return "";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${publicBase()}${p}`;
}

/** Origin + base path. Use this for the Outlook add-in XML. */
export function siteRootFromWindow(): string {
  return `${window.location.origin}${publicBase()}`;
}
