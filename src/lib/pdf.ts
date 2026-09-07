import { PDFDocument, StandardFonts, rgb, PageSizes, degrees, type PDFPage } from "pdf-lib";

export async function mergePdfs(files: Uint8Array[]): Promise<Uint8Array> {
  if (files.length < 1) throw new Error("Add at least one PDF.");
  const out = await PDFDocument.create();
  for (const bytes of files) {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await out.copyPages(src, src.getPageIndices());
    copied.forEach((page) => out.addPage(page));
  }
  return out.save();
}

/** 1-based inclusive ranges like "1,3-5,8". */
export function parsePageRange(spec: string, pageCount: number): number[] {
  const trimmed = spec.trim();
  if (!trimmed) throw new Error("Enter a page range, for example 1-3,5.");
  const seen = new Set<number>();
  const pages: number[] = [];
  for (const part of trimmed.split(",")) {
    const bit = part.trim();
    if (!bit) continue;
    const m = bit.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!m) throw new Error(`Could not read page range “${bit}”.`);
    const start = Number(m[1]);
    const end = m[2] ? Number(m[2]) : start;
    const from = Math.min(start, end);
    const to = Math.max(start, end);
    if (from < 1 || to > pageCount) {
      throw new Error(`Pages must be between 1 and ${pageCount}.`);
    }
    for (let n = from; n <= to; n += 1) {
      if (!seen.has(n)) {
        seen.add(n);
        pages.push(n);
      }
    }
  }
  if (pages.length === 0) throw new Error("Enter a page range, for example 1-3,5.");
  return pages;
}

export async function extractPages(bytes: Uint8Array, spec: string): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const indices = parsePageRange(spec, src.getPageCount()).map((n) => n - 1);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((page) => out.addPage(page));
  return out.save();
}

export async function splitEachPage(bytes: Uint8Array): Promise<{ name: string; bytes: Uint8Array }[]> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const count = src.getPageCount();
  const files: { name: string; bytes: Uint8Array }[] = [];
  for (let i = 0; i < count; i += 1) {
    const out = await PDFDocument.create();
    const [page] = await out.copyPages(src, [i]);
    out.addPage(page);
    files.push({
      name: `page-${String(i + 1).padStart(3, "0")}.pdf`,
      bytes: await out.save(),
    });
  }
  return files;
}

export async function splitByChunk(
  bytes: Uint8Array,
  chunkSize: number,
): Promise<{ name: string; bytes: Uint8Array }[]> {
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new Error("Chunk size must be a whole number of 1 or more.");
  }
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const count = src.getPageCount();
  const files: { name: string; bytes: Uint8Array }[] = [];
  let part = 1;
  for (let start = 0; start < count; start += chunkSize) {
    const indices = Array.from({ length: Math.min(chunkSize, count - start) }, (_, i) => start + i);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach((page) => out.addPage(page));
    files.push({
      name: `part-${String(part).padStart(2, "0")}.pdf`,
      bytes: await out.save(),
    });
    part += 1;
  }
  return files;
}

/** `order` is 0-based original indices. Missing indices are dropped. */
export async function rearrangePdf(bytes: Uint8Array, order: number[]): Promise<Uint8Array> {
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const count = src.getPageCount();
  const cleaned = order.filter((i) => Number.isInteger(i) && i >= 0 && i < count);
  if (cleaned.length === 0) throw new Error("Keep at least one page.");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, cleaned);
  copied.forEach((page) => out.addPage(page));
  return out.save();
}

export type StampOptions = {
  watermark?: string;
  pageNumbers?: boolean;
  batesPrefix?: string;
  batesStart?: number;
};

function drawCenteredWatermark(page: PDFPage, text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const { width, height } = page.getSize();
  const size = Math.min(48, Math.max(18, width / 12));
  const tw = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (width - tw) / 2,
    y: height / 2 - size / 3,
    size,
    font,
    color: rgb(0.55, 0.18, 0.18),
    opacity: 0.22,
    rotate: degrees(32),
  });
}

export async function stampPdf(bytes: Uint8Array, options: StampOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const total = pages.length;
  const start = options.batesStart ?? 1;
  pages.forEach((page, i) => {
    const { width } = page.getSize();
    if (options.watermark?.trim()) {
      drawCenteredWatermark(page, options.watermark.trim(), bold);
    }
    if (options.pageNumbers) {
      const label = `${i + 1} of ${total}`;
      const size = 9;
      const tw = font.widthOfTextAtSize(label, size);
      page.drawText(label, {
        x: (width - tw) / 2,
        y: 18,
        size,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    if (options.batesPrefix != null && options.batesPrefix !== "") {
      const n = String(start + i).padStart(6, "0");
      const label = `${options.batesPrefix}${n}`;
      const size = 9;
      const tw = font.widthOfTextAtSize(label, size);
      page.drawText(label, {
        x: width - tw - 18,
        y: 18,
        size,
        font,
        color: rgb(0.15, 0.15, 0.18),
      });
    }
  });
  return doc.save();
}

export type PageFit = "a4" | "letter" | "original";

export async function imagesToPdf(
  images: { bytes: Uint8Array; mime: string }[],
  fit: PageFit,
): Promise<Uint8Array> {
  if (images.length === 0) throw new Error("Add at least one image.");
  const doc = await PDFDocument.create();
  for (const image of images) {
    const mime = image.mime.toLowerCase();
    const embedded = mime.includes("png")
      ? await doc.embedPng(image.bytes)
      : await doc.embedJpg(image.bytes);
    const iw = embedded.width;
    const ih = embedded.height;
    let pageW: number;
    let pageH: number;
    if (fit === "a4") {
      [pageW, pageH] = PageSizes.A4;
    } else if (fit === "letter") {
      [pageW, pageH] = PageSizes.Letter;
    } else {
      pageW = iw;
      pageH = ih;
    }
    const page = doc.addPage([pageW, pageH]);
    const margin = fit === "original" ? 0 : 36;
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / iw, maxH / ih);
    const w = iw * scale;
    const h = ih * scale;
    page.drawImage(embedded, {
      x: (pageW - w) / 2,
      y: (pageH - h) / 2,
      width: w,
      height: h,
    });
  }
  return doc.save();
}

export async function pageCount(bytes: Uint8Array): Promise<number> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
