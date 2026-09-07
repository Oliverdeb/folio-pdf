import { PDFDocument } from "pdf-lib";

export type CompressMode = "text" | "raster";

export async function compressPdf(bytes: Uint8Array, mode: CompressMode): Promise<Uint8Array> {
  if (mode === "raster") {
    throw new Error("Image flatten runs in the browser on the Compress page.");
  }
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, src.getPageIndices());
  copied.forEach((page) => out.addPage(page));
  return out.save({ useObjectStreams: true });
}

export { savingsLabel } from "./format.ts";
