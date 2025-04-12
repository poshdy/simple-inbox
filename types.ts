// export type EmailMessage = {
//   id: string | null | undefined;
//   threadId: string | null | undefined;
//   subject: string;
//   from: { emailAddress: string; name: string };
//   to: { emailAddress: string; name: string };
//   snippet: string | null | undefined;
//   date: string;
//   body: string;
// };

import { z } from "zod";

export interface SyncResponse {
  syncUpdatedToken: string;
  syncDeletedToken: string;
  ready: boolean;
}
export interface SyncUpdatedResponse {
  nextPageToken?: string;
  nextDeltaToken: string;
  records: EmailMessage[];
}

export const emailAddressSchema = z.object({
  name: z.string(),
  address: z.string(),
});

export interface EmailMessage {
  id: string;
  threadId: string;
  createdTime: string;
  sentAt: string;
  receivedAt: string;
  internetMessageId: string;
  subject: string;
  sysLabels: string[];
  //   Array<
  //   | "junk"
  //   | "trash"
  //   | "sent"
  //   | "inbox"
  //   | "unread"
  //   | "flagged"
  //   | "important"
  //   | "draft"
  // >;
  sysClassifications: string[];
  // sensitivity: "normal" | "private" | "personal" | "confidential";
  // meetingMessageMethod?: "request" | "reply" | "cancel" | "counter" | "other";
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[] 
  bcc: EmailAddress[] 
  replyTo: EmailAddress[];
  hasAttachments: boolean;
  body?: string;
  bodySnippet?: string;
  attachments: EmailAttachment[];
  inReplyTo?: string;
  references?: string;
  threadIndex?: string;
  internetHeaders: EmailHeader[];
  folderId?: string;
}

export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface EmailHeader {
  name: string;
  value: string;
}
