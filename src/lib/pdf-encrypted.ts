const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF

export function isPdfBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 5) return false;
  return PDF_MAGIC.every((b, i) => bytes[i] === b);
}

export function isPdfAttachmentName(name: string): boolean {
  return /\.pdf$/i.test(name.trim());
}

/**
 * Cheap scan used by the Outlook event runtime (no pdf-lib).
 * /Encrypt lives in the trailer or, for linearized files, near the start.
 */
export function looksPasswordProtectedPdf(bytes: Uint8Array): boolean {
  if (!isPdfBytes(bytes)) return false;
  const window = 96 * 1024;
  const head = bytes.subarray(0, Math.min(bytes.length, window));
  const tailStart = Math.max(0, bytes.length - window);
  const tail = bytes.subarray(tailStart);
  return hasEncryptToken(head) || hasEncryptToken(tail);
}

function hasEncryptToken(slice: Uint8Array): boolean {
  const text = latin1(slice);
  return /\/Encrypt[\s/\[>)]/.test(text);
}

function latin1(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes);
}

export function unlockedPdfPrompt(names: string[]): string {
  if (names.length === 1) {
    return names[0] + " is not password-protected. Lock it with Folio before it leaves?";
  }
  return names.length + " PDFs are not password-protected. Lock them with Folio before they leave?";
}
