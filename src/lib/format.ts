export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB"];
  let value = n / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  const digits = value >= 10 || i === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[i]}`;
}

export function savingsLabel(before: number, after: number): string {
  if (before <= 0) return "No change";
  const delta = before - after;
  const pct = Math.round((delta / before) * 100);
  if (delta <= 0) return "No savings";
  return `Saved ${formatBytes(delta)} (${pct}%)`;
}
