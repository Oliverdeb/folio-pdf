import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

let workerReady = false;

function ensureWorker() {
  if (workerReady) return;
  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerReady = true;
}

export async function renderPdfPageThumb(bytes: Uint8Array, pageNumber: number, width = 160): Promise<string> {
  ensureWorker();
  const task = getDocument({ data: Uint8Array.from(bytes), verbosity: 0 });
  const pdf = await task.promise;
  try {
    const page = await pdf.getPage(pageNumber);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = width / unscaled.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return canvas.toDataURL("image/png");
  } finally {
    await pdf.destroy();
  }
}

export async function pdfPageCount(bytes: Uint8Array): Promise<number> {
  ensureWorker();
  const task = getDocument({ data: Uint8Array.from(bytes), verbosity: 0 });
  const pdf = await task.promise;
  try {
    return pdf.numPages;
  } finally {
    await pdf.destroy();
  }
}

export async function renderAllPagesPng(bytes: Uint8Array, scale = 1.5): Promise<{ name: string; bytes: Uint8Array }[]> {
  ensureWorker();
  const task = getDocument({ data: Uint8Array.from(bytes), verbosity: 0 });
  const pdf = await task.promise;
  const out: { name: string; bytes: Uint8Array }[] = [];
  try {
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available.");
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not export PNG."))), "image/png");
      });
      out.push({
        name: `page-${String(i).padStart(3, "0")}.png`,
        bytes: new Uint8Array(await blob.arrayBuffer()),
      });
    }
  } finally {
    await pdf.destroy();
  }
  return out;
}
