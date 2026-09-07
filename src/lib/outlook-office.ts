import type { OutlookAttachment, OutlookHost } from "./outlook-host";

type OfficeMailboxItem = {
  getAttachmentsAsync: (cb: (result: { status: string; value?: OfficeAttachment[] }) => void) => void;
  getAttachmentContentAsync: (
    id: string,
    cb: (result: { status: string; value?: { format: string; content: string } }) => void,
  ) => void;
  removeAttachmentAsync: (id: string, cb: (result: { status: string; error?: { message: string } }) => void) => void;
  addFileAttachmentFromBase64Async: (
    base64: string,
    name: string,
    options: { isInline: boolean },
    cb: (result: { status: string; error?: { message: string } }) => void,
  ) => void;
};

type OfficeAttachment = {
  id: string;
  name: string;
  isInline?: boolean;
};

function mailboxItem(): OfficeMailboxItem {
  const office = (globalThis as { Office?: { context?: { mailbox?: { item?: OfficeMailboxItem } } } }).Office;
  const item = office?.context?.mailbox?.item;
  if (!item) throw new Error("Open this pane from a draft in Outlook.");
  return item;
}

function asPromise<T>(run: (cb: (result: { status: string; value?: T; error?: { message: string } }) => void) => void) {
  return new Promise<T>((resolve, reject) => {
    run((result) => {
      if (String(result.status).toLowerCase() !== "succeeded") {
        reject(new Error(result.error?.message || "Outlook could not finish that step."));
        return;
      }
      resolve(result.value as T);
    });
  });
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function createOfficeHost(): OutlookHost {
  return {
    async listAttachments() {
      const item = mailboxItem();
      const list = await asPromise<OfficeAttachment[]>((cb) => item.getAttachmentsAsync(cb));
      return (list || []).map((a) => ({
        id: a.id,
        name: a.name,
        isInline: Boolean(a.isInline),
      }));
    },
    async readAttachment(id) {
      const item = mailboxItem();
      const content = await asPromise<{ format: string; content: string }>((cb) =>
        item.getAttachmentContentAsync(id, cb),
      );
      const format = (content.format || "").toLowerCase();
      if (format !== "base64") throw new Error("That attachment is not a file Folio can lock in Outlook.");
      return base64ToBytes(content.content);
    },
    async replaceAttachment(id, name, bytes) {
      const item = mailboxItem();
      await asPromise<void>((cb) => item.removeAttachmentAsync(id, cb));
      await asPromise<void>((cb) =>
        item.addFileAttachmentFromBase64Async(bytesToBase64(bytes), name, { isInline: false }, cb),
      );
    },
  };
}

export function officeIsAvailable(): boolean {
  const office = (globalThis as { Office?: { context?: { mailbox?: { item?: unknown } } } }).Office;
  return Boolean(office?.context?.mailbox?.item);
}
