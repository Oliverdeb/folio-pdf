import { publicUrl } from "./public-url.ts";

export const SAMPLES = {
  letter: publicUrl("/samples/engagement-letter.pdf"),
  fees: publicUrl("/samples/fee-schedule.pdf"),
  annexure: publicUrl("/samples/annexure-a.pdf"),
  docx: publicUrl("/samples/engagement-letter.docx"),
} as const;

export async function fetchSample(path: string): Promise<{ bytes: Uint8Array; name: string }> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load sample ${path}`);
  const buf = await res.arrayBuffer();
  const name = path.split("/").pop() ?? "sample.pdf";
  return { bytes: new Uint8Array(buf), name };
}
