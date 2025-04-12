import { EmailMessage, EmailAddress, EmailAttachment } from "@/types";
import { db } from "@/server/db";
import cleanHtml from "sanitize-html";
export class DatabaseSync {
  async syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log("syncing emails to database", emails.length);

    try {
      const syncToDB = async () => {
        for (const [index, email] of emails.entries()) {
          await this.upsertEmail(email, accountId, index);
        }
      };
      await Promise.all([syncToDB()]);
    } catch (error) {
      console.log("error", error);
    }
  }

  private async upsertEmail(
    email: EmailMessage,
    accountId: string,
    idx: number
  ) {
    console.log(`upserting email number ${idx}`);
    try {
      let emailLabelType: "inbox" | "sent" | "draft" = "inbox";

      if (
        email.sysLabels.includes("inbox") ||
        email.sysLabels.includes("important")
      ) {
        emailLabelType = "inbox";
      } else if (email.sysLabels.includes("draft")) {
        emailLabelType = "draft";
      } else if (email.sysLabels.includes("sent")) {
        emailLabelType = "sent";
      }

      const addressesToUpsert = new Map();

      for (const address of [
        email.from,
        ...email.to,
        ...email.cc,
        ...email.bcc,
        ...email.replyTo,
      ]) {
        addressesToUpsert.set(address.address, address);
      }

      const upsertedAddresses: Awaited<
        ReturnType<typeof this.upsertEmailAddresses>
      >[] = [];

      for (const address of addressesToUpsert.values()) {
        const upsertedAddress = await this.upsertEmailAddresses(
          address,
          accountId
        );

        upsertedAddresses.push(upsertedAddress);
      }

      const addressMap = new Map(
        upsertedAddresses
          .filter(Boolean)
          .map((address) => [address!.address, address])
      );

      const fromAddress = addressMap.get(email.from.address);
      if (!fromAddress) {
        console.log(
          `Failed to upsert from address for email ${email.bodySnippet}`
        );
      }
      const toAddresses = email.to
        .map((addr) => addressMap.get(addr.address))
        .filter(Boolean);

      const ccAddresses = email.cc
        .map((addr) => addressMap.get(addr.address))
        .filter(Boolean);

      const bccAddresses = email.bcc
        .map((addr) => addressMap.get(addr.address))
        .filter(Boolean);

      const replyToAddresses = email.replyTo
        .map((addr) => addressMap.get(addr.address))
        .filter(Boolean);

      // upsert thread

      const thread = await db.thread.upsert({
        where: {
          id: email.threadId,
        },
        update: {
          accountId,
          done: false,
          subject: email.subject,
          participantIds: [
            ...new Set([
              fromAddress!.id,
              ...toAddresses.map((addr) => addr!.id),
              ...ccAddresses.map((addr) => addr!.id),
              ...bccAddresses.map((addr) => addr!.id),
            ]),
          ],
        },
        create: {
          subject: email.subject,
          accountId,
          id: email.threadId,
          done: false,
          draftStatus: emailLabelType == "draft",
          inboxStatus: emailLabelType == "inbox",
          sentStatus: emailLabelType == "sent",
          participantIds: [
            ...new Set([
              fromAddress!.id,
              ...toAddresses.map((addr) => addr!.id),
              ...ccAddresses.map((addr) => addr!.id),
              ...bccAddresses.map((addr) => addr!.id),
            ]),
          ],
        },
      });

      // upsert Email

      const {
        internetMessageId,
        createdTime,
        receivedAt,
        internetHeaders,
        hasAttachments,
        inReplyTo,
        references,

        sentAt,
        subject,
        sysClassifications,
        sysLabels,
        body,
        bodySnippet,
      } = email;
      await db.email.upsert({
        where: {
          id: email.id,
        },
        update: {
          threadId: thread.id,
          createdTime,
          lastModifiedTime: new Date(),
          sentAt,
          receivedAt,
          internetMessageId,
          subject,
          sysLabels,
          sysClassifications,

          fromId: fromAddress?.id,
          to: { set: toAddresses.map((a) => ({ id: a!.id })) },
          cc: { set: ccAddresses.map((a) => ({ id: a!.id })) },
          bcc: { set: bccAddresses.map((a) => ({ id: a!.id })) },
          replyTo: { set: replyToAddresses.map((a) => ({ id: a!.id })) },
          hasAttachments,
          body: cleanHtml(body as string),
          bodySnippet: cleanHtml(bodySnippet as string),
          inReplyTo,
          references,
          folderId: emailLabelType,
          emailLabel: emailLabelType,
          internetHeaders: internetHeaders.map((header) => ({
            name: header.name,
            value: header.value,
          })),
        },
        create: {
          id: email.id,
          emailLabel: emailLabelType,
          threadId: thread.id,
          createdTime: new Date(email.createdTime),
          lastModifiedTime: new Date(),
          sentAt: new Date(email.sentAt),
          receivedAt: new Date(email.receivedAt),
          internetMessageId: email.internetMessageId,
          subject: email.subject,
          sysLabels: email.sysLabels,
          internetHeaders: internetHeaders.map((header) => ({
            name: header.name,
            value: header.value,
          })),

          sysClassifications: email.sysClassifications,
          fromId: fromAddress?.id as string,
          to: { connect: toAddresses.map((a) => ({ id: a!.id })) },
          cc: { connect: ccAddresses.map((a) => ({ id: a!.id })) },
          bcc: { connect: bccAddresses.map((a) => ({ id: a!.id })) },
          replyTo: { connect: replyToAddresses.map((a) => ({ id: a!.id })) },
          hasAttachments: email.hasAttachments,
          body: body as string,
          bodySnippet: bodySnippet as string,
          inReplyTo: email.inReplyTo,
          references: email.references,
          threadIndex: email.threadIndex,
          folderId: emailLabelType,
        },
      });

      if (email.hasAttachments) {
        for (const attachment of email.attachments) {
          await this.upsertAttachment(email.id, attachment);
        }
      }

      const threadEmails = await db.email.findMany({
        where: { threadId: thread.id },
      });
      let threadFolderType = "sent";

      for (const threadEmail of threadEmails) {
        if (threadEmail.emailLabel === "inbox") {
          threadFolderType = "inbox";
          break;
        } else if (threadEmail.emailLabel == "draft") {
          threadFolderType = "draft";
        }
      }

      await db.thread.update({
        where: {
          id: thread.id,
        },
        data: {
          inboxStatus: threadFolderType === "inbox",
          sentStatus: threadFolderType === "sent",
          draftStatus: threadFolderType === "draft",
        },
      });
    } catch (error) {
      console.log("ERROR", error);
    }
  }

  private async upsertEmailAddresses(email: EmailAddress, accountId: string) {
    const existingAddress = await db.emailAddress.findUnique({
      where: {
        accountId_address: {
          accountId,
          address: email.address ?? "",
        },
      },
    });

    if (existingAddress) {
      return db.emailAddress.update({
        where: {
          id: existingAddress.id,
        },
        data: {
          name: email.name,
          raw: `${email.name} ${email.address}`,
        },
      });
    } else {
      return await db.emailAddress.create({
        data: {
          address: email.address,
          accountId,
          name: email.name,
          raw: `${email.name} ${email.address}`,
        },
      });
    }
  }

  private async upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try {
      await db.emailAttachment.upsert({
        where: {
          id: attachment.id ?? "",
        },
        update: {
          name: attachment.name,
          mimeType: attachment.mimeType,
          size: attachment.size,
        },
        create: {
          id: attachment.id,
          mimeType: attachment.mimeType,
          emailId,
          size: attachment.size,
          name: attachment.name,
        },
      });
    } catch (e) {
      console.log("error", e);
    }
  }
}
