import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import mammoth from "mammoth";

function htmlToPlainParagraphs(html: string): string[] {
  const stripped = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/"/g, '"');
  return stripped
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+\n/g, "\n").trim())
    .filter(Boolean);
}

function wrapLine(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  max: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= max) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function docxToPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const { value: html } = await mammoth.convertToHtml({
    arrayBuffer: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
  });
  const paragraphs = htmlToPlainParagraphs(html);
  if (paragraphs.length === 0) throw new Error("That Word file had no readable text.");

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const [pageW, pageH] = PageSizes.A4;
  const margin = 72;
  const size = 11;
  const leading = 16;
  const maxW = pageW - margin * 2;

  let page = doc.addPage([pageW, pageH]);
  let y = pageH - margin;

  const ensure = () => {
    if (y < margin + leading) {
      page = doc.addPage([pageW, pageH]);
      y = pageH - margin;
    }
  };

  paragraphs.forEach((para, i) => {
    const useBold = i === 0;
    const face = useBold ? bold : font;
    const lines = wrapLine(para.replace(/\s+/g, " "), face, size, maxW);
    for (const line of lines) {
      ensure();
      page.drawText(line, {
        x: margin,
        y,
        size,
        font: face,
        color: rgb(0.12, 0.1, 0.08),
      });
      y -= leading;
    }
    y -= 8;
  });

  return doc.save();
}
