export type ToolId =
  | "merge"
  | "split"
  | "compress"
  | "stamp"
  | "rearrange"
  | "images-to-pdf"
  | "pdf-to-images"
  | "word-to-pdf"
  | "protect"
  | "unlock";

export type ToolDef = {
  id: ToolId;
  href: string;
  title: string;
  blurb: string;
  detail: string;
};

export const TOOLS: ToolDef[] = [
  {
    id: "merge",
    href: "/merge",
    title: "Combine PDFs",
    blurb: "Join several files into one bundle, in the order you set.",
    detail: "Drop two or more PDFs. Reorder them, then download a single file.",
  },
  {
    id: "split",
    href: "/split",
    title: "Split / extract",
    blurb: "Pull pages out, or break a bundle into separate files.",
    detail: "Extract a range, one file per page, or chunks of N pages.",
  },
  {
    id: "compress",
    href: "/compress",
    title: "Compress",
    blurb: "Shrink a PDF for email without sending it anywhere.",
    detail: "Keep selectable text, or flatten pages to images when size matters more.",
  },
  {
    id: "stamp",
    href: "/stamp",
    title: "Stamp & Bates",
    blurb: "Watermark, page numbers, and sequential exhibit labels.",
    detail: "CONFIDENTIAL, Page n of n, or BATES000001 — drawn onto every page.",
  },
  {
    id: "rearrange",
    href: "/rearrange",
    title: "Rearrange",
    blurb: "Reorder or drop pages before you file.",
    detail: "Move pages, remove extras, download the trimmed document.",
  },
  {
    id: "images-to-pdf",
    href: "/images-to-pdf",
    title: "Photos to PDF",
    blurb: "Turn scans and photos into an A4 or letter PDF.",
    detail: "JPEG or PNG. Fit to A4, letter, or keep the original size.",
  },
  {
    id: "pdf-to-images",
    href: "/pdf-to-images",
    title: "PDF to images",
    blurb: "Export each page as a PNG for markup or a brief.",
    detail: "Downloads a zip of page images. Work stays on this device.",
  },
  {
    id: "word-to-pdf",
    href: "/word-to-pdf",
    title: "Word to PDF",
    blurb: "Convert a .docx letter to PDF in the browser.",
    detail: "Text and basic formatting. Complex Word art is skipped.",
  },
  {
    id: "protect",
    href: "/protect",
    title: "Password protect",
    blurb: "Lock a PDF with AES-256 so it cannot be opened cold.",
    detail: "The password never leaves this tab. Printing stays allowed; editing is not.",
  },
  {
    id: "unlock",
    href: "/unlock",
    title: "Remove password",
    blurb: "Open a locked PDF you already have the password for.",
    detail: "Produces an unlocked copy. The original file is not changed.",
  },
];

export function toolById(id: ToolId): ToolDef {
  const found = TOOLS.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown tool: ${id}`);
  return found;
}
