export const SAMPLES = {
  letter: "/samples/engagement-letter.pdf",
  fees: "/samples/fee-schedule.pdf",
  annexure: "/samples/annexure-a.pdf",
  docx: "/samples/engagement-letter.docx",
} as const;

export async function fetchSample(path: string): Promise<{ bytes: Uint8Array; name: string }> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load sample ${path}`);
  const buf = await res.arrayBuffer();
  const name = path.split("/").pop() ?? "sample.pdf";
  return { bytes: new Uint8Array(buf), name };
}
