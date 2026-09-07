import { PDFDocument } from "@cantoo/pdf-lib";

export type EncryptionInfo = {
  encrypted: boolean;
  pageCount: number;
};

export async function inspectPdfEncryption(bytes: Uint8Array): Promise<EncryptionInfo> {
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  return { encrypted: doc.isEncrypted, pageCount: doc.getPageCount() };
}

export async function protectPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const trimmed = password.trim();
  if (trimmed.length < 4) throw new Error("Use a password of at least 4 characters.");
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  if (doc.isEncrypted) {
    throw new Error("This file is already locked. Unlock it first, or pick another PDF.");
  }
  doc.encrypt({
    userPassword: trimmed,
    ownerPassword: trimmed,
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });
  return doc.save();
}

export async function unprotectPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const trimmed = password.trim();
  if (!trimmed) throw new Error("Enter the password for this PDF.");
  let locked: PDFDocument;
  try {
    locked = await PDFDocument.load(bytes, { password: trimmed });
  } catch {
    throw new Error("That password did not open the file.");
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(locked, locked.getPageIndices());
  copied.forEach((page) => out.addPage(page));
  return out.save();
}
