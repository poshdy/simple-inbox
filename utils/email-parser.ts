import { gmail_v1 } from "googleapis";
import { toISOString } from "@/lib/date";
import { EmailAddress, EmailHeader, EmailMessage } from "@/types";
export interface IEmailParser {
  decodeBase64: (base64: string) => string;
  extractEmailBody: (
    payload: gmail_v1.Schema$MessagePart | undefined
  ) => string;
  parseEmailInfo: (email: gmail_v1.Schema$Message) => void;
}

export class EmailParser implements IEmailParser {
  decodeBase64(base64: string) {
    return Buffer.from(base64, "base64").toString("utf-8");
  }

  extractEmailBody(payload: gmail_v1.Schema$MessagePart | undefined) {
    if (!payload?.parts) {
      return payload?.body?.data
        ? this.decodeBase64(payload.body.data)
        : "No Content";
    }

    for (const part of payload?.parts) {
      if (part.mimeType === "text/html") {
        return this.decodeBase64(part?.body?.data as string);
      }
    }

    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        return this.decodeBase64(part?.body?.data as string);
      }
    }

    return "No Content";
  }

  getAttachments(parts: gmail_v1.Schema$MessagePart[] | undefined) {
    const results = [];
    for (const part of parts || []) {
      if (part.filename && part.body?.attachmentId) {
        console.log(`📎 Found Attachment: ${part.filename}`);

        const attachmentInfo = {
          name: part.filename,
          mimeType: part.mimeType || "unknown",
          size: part.body.size || 0,
          id: part.body.attachmentId,
        };
        results.push(attachmentInfo);
      }
    }
    return {
      attachments: results,
      hasAttachments: results.length > 0,
    };
  }
  getLabels(values: string[] | undefined | null) {
    const labels: string[] = [];
    const sysClassifications: string[] = [];

    if (!values || values.length < 0) {
      return {
        labels,
        sysClassifications,
      };
    }
    values.map((classification) => {
      const underScoreIdx = classification.indexOf("_");
      if (underScoreIdx == -1) {
        labels.push(classification.toLowerCase());
      } else {
        sysClassifications.push(
          classification.slice(underScoreIdx + 1).toLowerCase()
        );
      }
    });

    return { labels, sysClassifications };
  }
  extractCc(text?: string | null) {
    if (!text) {
      return null;
    }

    const array = text.split(",");

    const formatted = array.map((record) => {
      const idx = record.indexOf("<");
      const name = record.slice(0, idx).replace("<", "").trim();
      const emailAddress = record
        .slice(idx)
        .replace("<", "")
        .replace(">", "")
        .trim();

      return {
        name,
        address: emailAddress,
      };
    });

    return formatted;
  }

  private getHeader(
    headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
    key: string
  ) {
    const header = headers?.find((h) => h.name?.toLowerCase() === key);

    return header?.value;
  }

  private getReplyTo(header: string | null | undefined): EmailAddress[] {
    if (!header) return [];

    return header
      .split(",")
      .map((value: string) => ({ address: value.trim(), name: "" }));
  }
  extractEmail(text: string): EmailAddress[] | EmailAddress {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const delimiter = text.indexOf(",");
    if (delimiter != -1) {
      console.log("mutiple", text);
      const arr = text.split(",");
      const result = arr.map((record) => {
        const arr2 = record.split(" ");
        const email = arr2.pop();
        const address = email ? email : "";
        const name = arr2.join(" ").trim();
        return { address: address.replace("<", "").replace(">", ""), name };
      });

      console.log("mutiple result", result);
      return result;
    }
    const content = text?.split(" ");

    const email = content.pop();
    const name = content.join(" ");
    console.log({
      single: "single",
      name,
      email: email?.replace("<", "").replace(">", "").trim(),
    });
    return {
      name,
      address: email?.replace("<", "").replace(">", "").trim() ?? "",
    };
  }
  async parseEmailInfo(email: gmail_v1.Schema$Message) {
    const headers: gmail_v1.Schema$MessagePartHeader[] | undefined =
      email.payload?.headers;

    const sentAt = toISOString(this.getHeader(headers, "date") as string);

    const subject = this.getHeader(headers, "subject");
    const receivedAt = toISOString(Number(email.internalDate));

    const from = this.extractEmail(this.getHeader(headers, "from") as string);
    const to = this.extractEmail(this.getHeader(headers, "to") as string);

    const cc = this.extractCc(this.getHeader(headers, "cc"));
    const bcc = this.extractCc(this.getHeader(headers, "bcc"));

    const internetMessageId = this.getHeader(headers, "message-id");
    const inReplyTo = this.getHeader(headers, "in-reply-to");

    const replyTo = this.getReplyTo(this.getHeader(headers, "reply-to"));

    const { labels, sysClassifications } = this.getLabels(email.labelIds);

    const { attachments, hasAttachments } = this.getAttachments(
      email.payload?.parts
    );

    const emailInfo = {
      id: email.id as string,
      threadId: email.threadId as string,
      bodySnippet: email.snippet as string,
      subject: subject ? subject : "",
      from: from as EmailAddress,
      to: Array.isArray(to) ? to : ([to] as EmailAddress[]),
      sentAt,
      cc: cc ?? [],
      bcc: bcc ?? [],
      replyTo: replyTo ?? [],
      references: inReplyTo ? inReplyTo : undefined,
      internetMessageId: internetMessageId as string,
      receivedAt,
      internetHeaders: headers as EmailHeader[],
      sysLabels: labels,
      sysClassifications,
      attachments,
      createdTime: receivedAt,
      hasAttachments,
      inReplyTo: inReplyTo ? inReplyTo : undefined,
      body: this.extractEmailBody(email?.payload),
    } satisfies EmailMessage;

    // console.log("email INFO", emailInfo);
    return emailInfo;
  }
}
