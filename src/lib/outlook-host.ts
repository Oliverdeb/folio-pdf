import { isPdfAttachmentName, looksPasswordProtectedPdf } from "./pdf-encrypted.ts";

export type OutlookAttachment = {
  id: string;
  name: string;
  isInline: boolean;
  bytes?: Uint8Array;
};

export type OutlookHost = {
  listAttachments: () => Promise<OutlookAttachment[]>;
  readAttachment: (id: string) => Promise<Uint8Array>;
  replaceAttachment: (id: string, name: string, bytes: Uint8Array) => Promise<void>;
};

export async function findUnprotectedPdfAttachments(host: OutlookHost): Promise<OutlookAttachment[]> {
  const atts = await host.listAttachments();
  const found: OutlookAttachment[] = [];
  for (const att of atts) {
    if (att.isInline) continue;
    if (!isPdfAttachmentName(att.name)) continue;
    const bytes = att.bytes ?? (await host.readAttachment(att.id));
    if (!looksPasswordProtectedPdf(bytes)) found.push({ ...att, bytes });
  }
  return found;
}

export function createMemoryHost(initial: OutlookAttachment[]): OutlookHost & { snapshot: () => OutlookAttachment[] } {
  let items = initial.map((a) => ({ ...a, bytes: a.bytes ? new Uint8Array(a.bytes) : undefined }));
  return {
    async listAttachments() {
      return items.map((a) => ({ ...a }));
    },
    async readAttachment(id) {
      const found = items.find((a) => a.id === id);
      if (!found?.bytes) throw new Error("Attachment is no longer on the draft.");
      return found.bytes;
    },
    async replaceAttachment(id, name, bytes) {
      items = items.map((a) => (a.id === id ? { ...a, id: id + "-locked", name, bytes: new Uint8Array(bytes) } : a));
    },
    snapshot() {
      return items.map((a) => ({ ...a }));
    },
  };
}
