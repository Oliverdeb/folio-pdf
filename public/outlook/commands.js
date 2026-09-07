/* Folio Outlook event runtime. Classic Outlook loads this file directly — no imports, no DOM. */
/* Keep encryption detection in sync with src/lib/pdf-encrypted.ts */

var NOTICE_KEY = "folioUnlockedPdf";
var PANE_COMMAND = "msgComposeOpenPaneButton";

function isPdfName(name) {
  return /\.pdf$/i.test(name || "");
}

function latin1Slice(bytes, start, end) {
  var out = "";
  var i;
  for (i = start; i < end; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function looksEncryptedPdf(bytes) {
  if (!bytes || bytes.length < 5) return false;
  if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) return false;
  var windowSize = 96 * 1024;
  var headEnd = Math.min(bytes.length, windowSize);
  var tailStart = Math.max(0, bytes.length - windowSize);
  var encrypt = /\/Encrypt[\s/\[>)]/;
  return encrypt.test(latin1Slice(bytes, 0, headEnd)) || encrypt.test(latin1Slice(bytes, tailStart, bytes.length));
}

function b64ToBytes(b64) {
  if (typeof atob !== "function") return null;
  var binary = atob(b64);
  var bytes = new Uint8Array(binary.length);
  var i;
  for (i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function item() {
  return Office.context.mailbox.item;
}

function notifyUnlocked(names, done) {
  var message;
  if (names.length === 1) {
    message = names[0] + " is not password-protected. Lock it with Folio before it leaves?";
  } else {
    message = names.length + " PDFs are not password-protected. Lock them with Folio before they leave?";
  }
  if (message.length > 140) message = "Unlocked PDFs attached. Lock them with Folio before they leave?";
  var details = {
    type: "insightMessage",
    message: message,
    icon: "Icon.16x16",
    actions: [
      {
        actionText: "Lock PDFs",
        actionType: "showTaskPane",
        commandId: PANE_COMMAND,
        contextData: { names: names },
      },
    ],
  };
  try {
    details.type = Office.MailboxEnums.ItemNotificationMessageType.InsightMessage;
    details.actions[0].actionType = Office.MailboxEnums.ActionType.ShowTaskPane;
  } catch (e) {
    /* enums missing in some runtimes */
  }
  item().notificationMessages.replaceAsync(NOTICE_KEY, details, function (result) {
    if (result && result.status === Office.AsyncResultStatus.Failed) {
      item().notificationMessages.replaceAsync(
        NOTICE_KEY,
        {
          type: "informationalMessage",
          message: message,
          icon: "Icon.16x16",
          persistent: true,
        },
        function () {
          if (done) done();
        },
      );
      return;
    }
    if (done) done();
  });
}

function clearNotice(done) {
  item().notificationMessages.removeAsync(NOTICE_KEY, function () {
    if (done) done();
  });
}

function readContent(id, callback) {
  item().getAttachmentContentAsync(id, function (result) {
    if (result.status !== Office.AsyncResultStatus.Succeeded) {
      callback(null);
      return;
    }
    var value = result.value || {};
    var format = value.format;
    var isBase64 =
      format === "base64" ||
      (Office.MailboxEnums &&
        Office.MailboxEnums.AttachmentContentFormat &&
        format === Office.MailboxEnums.AttachmentContentFormat.Base64);
    if (!isBase64) {
      callback(null);
      return;
    }
    callback(b64ToBytes(value.content));
  });
}

function collectUnlocked(attachments, index, names, callback) {
  if (index >= attachments.length) {
    callback(names);
    return;
  }
  var att = attachments[index];
  if (att.isInline || !isPdfName(att.name)) {
    collectUnlocked(attachments, index + 1, names, callback);
    return;
  }
  readContent(att.id, function (bytes) {
    if (!bytes || !looksEncryptedPdf(bytes)) names.push(att.name);
    collectUnlocked(attachments, index + 1, names, callback);
  });
}

function scanUnlocked(callback) {
  item().getAttachmentsAsync(function (result) {
    if (result.status !== Office.AsyncResultStatus.Succeeded) {
      callback([]);
      return;
    }
    collectUnlocked(result.value || [], 0, [], callback);
  });
}

function onMessageAttachmentsChangedHandler(event) {
  try {
    var args = event && event.item ? event : event;
    var status = args.attachmentStatus;
    var removed =
      status === "removed" ||
      (Office.MailboxEnums &&
        Office.MailboxEnums.AttachmentStatus &&
        status === Office.MailboxEnums.AttachmentStatus.Removed);
    scanUnlocked(function (names) {
      if (!names.length) {
        clearNotice(function () {
          event.completed();
        });
        return;
      }
      if (removed) {
        notifyUnlocked(names, function () {
          event.completed();
        });
        return;
      }
      notifyUnlocked(names, function () {
        event.completed();
      });
    });
  } catch (err) {
    event.completed();
  }
}

function onMessageSendHandler(event) {
  try {
    scanUnlocked(function (names) {
      if (!names.length) {
        event.completed({ allowEvent: true });
        return;
      }
      var message =
        names.length === 1
          ? names[0] + " is not password-protected. Lock it with Folio, or send it unlocked."
          : names.length + " PDFs are not password-protected. Lock them with Folio, or send them unlocked.";
      event.completed({
        allowEvent: false,
        cancelLabel: "Lock PDFs",
        commandId: PANE_COMMAND,
        errorMessage: message,
        sendModeOverride: "promptUser",
      });
    });
  } catch (err) {
    event.completed({ allowEvent: true });
  }
}

if (typeof Office !== "undefined" && Office.actions && Office.actions.associate) {
  Office.actions.associate("onMessageAttachmentsChangedHandler", onMessageAttachmentsChangedHandler);
  Office.actions.associate("onMessageSendHandler", onMessageSendHandler);
}
