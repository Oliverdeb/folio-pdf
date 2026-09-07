import JSZip from "jszip";
import { downloadBytes } from "./download";

export async function downloadZip(files: { name: string; bytes: Uint8Array }[], zipName: string) {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.bytes);
  }
  const blob = await zip.generateAsync({ type: "uint8array" });
  downloadBytes(blob, zipName, "application/zip");
}
