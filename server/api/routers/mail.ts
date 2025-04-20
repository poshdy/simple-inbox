import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authorizeAccountAccess } from "./accounts";
import { Prisma } from "@prisma/client";
import { GoogleService } from "@/lib/google";
import { MailOptions } from "nodemailer/lib/json-transport";
import nodemailer from "nodemailer";
import { Account } from "@/lib/account";
import dayjs from "dayjs";

const threadSchema = z.object({
  q: z.string().optional(),
  tab: z.string().optional().default("Inbox"),
  accountId: z.string(),
  done: z.boolean(),
});

export const mailsRouter = createTRPCRouter({
  listThreads: protectedProcedure
    .input(threadSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { accountId, tab, done } = input;
        const userId = ctx.auth.userId;

        const authorizedAccount = await authorizeAccountAccess(
          accountId,
          userId
        );

        const account = new Account(authorizedAccount.accessToken);
        await account.performSync(authorizedAccount.id, dayjs());

        const filter: Prisma.ThreadWhereInput = { accountId };

        if (tab === "Inbox") {
          filter.inboxStatus = true;
        } else if (tab === "draft") {
          filter.draftStatus = true;
        } else if (tab === "sent") {
          filter.sentStatus = true;
        } else {
          filter.inboxStatus = true;
        }

        filter.done = {
          equals: done,
        };
        const threads = await ctx.db.thread.findMany({
          where: filter,
          take: 10,
          include: {
            emails: {
              orderBy: { sentAt: "desc" },
              select: {
                id: true,
                from: true,
                to: true,
                subject: true,
                body: true,
                bodySnippet: true,
                sysClassifications: true,
                sysLabels: true,
                sentAt: true,
              },
            },
            account: {
              select: {
                name: true,
                emailAddress: true,
              },
            },
          },
        });

        return threads;
      } catch (error) {
        console.error("ERROR FETCHING THREADS", error);
      }
    }),

  getThread: protectedProcedure
    .input(threadSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { accountId, tab, done } = input;
        const userId = ctx.auth.userId;

        await authorizeAccountAccess(accountId, userId);

        const filter: Prisma.ThreadWhereInput = { accountId };

        if (tab === "Inbox") {
          filter.inboxStatus = true;
        } else if (tab === "draft") {
          filter.draftStatus = true;
        } else if (tab === "sent") {
          filter.sentStatus = true;
        } else {
          filter.inboxStatus = true;
        }

        filter.done = {
          equals: done,
        };
        const thread = await ctx.db.thread.findUnique({
          where: { id: "" },
          include: {
            emails: {
              orderBy: { sentAt: "asc" },
              select: {
                id: true,
                from: true,
                to: true,
                subject: true,
                body: true,
                bodySnippet: true,
                sysClassifications: true,
                sysLabels: true,
                sentAt: true,
              },
            },
          },
        });
        return thread?.emails[0];
      } catch (error) {
        console.error("ERROR FETCHING THREADS", error);
      }
    }),

  getSuggestions: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      await authorizeAccountAccess(input.accountId, ctx.auth.userId);

      return await ctx.db.emailAddress.findMany({
        where: { accountId: input.accountId },
        select: { address: true, name: true, raw: true },
      });
    }),
  getReplyDetails: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        threadId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { accountId, threadId } = input;
      const account = await authorizeAccountAccess(accountId, ctx.auth.userId);

      const thread = await ctx.db.thread.findUnique({
        where: {
          id: threadId,
        },
        include: {
          emails: {
            orderBy: { sentAt: "asc" },
            select: {
              bcc: true,
              from: true,
              to: true,
              cc: true,
              subject: true,
              internetMessageId: true,
              sentAt: true,
            },
          },
        },
      });

      if (!thread || thread.emails.length == 0)
        throw new Error("Thread not found");

      const lastExternalMessage = thread.emails.find(
        (email) => email.from.address !== account.emailAddress
      );

      if (!lastExternalMessage) {
        throw new Error("no external mail found");
      }

      const { subject, internetMessageId, bcc, cc, from, sentAt, to } =
        lastExternalMessage;

      const replyTo = [
        from.address,
        ...to
          .filter((add) => add.address !== account.emailAddress)
          .map(({ address }) => address),
      ];
      const data = {
        subject,
        id: internetMessageId,
        to: replyTo,
        cc: cc.filter((add) => add.address !== account.emailAddress),
        bcc: bcc.filter((add) => add.address !== account.emailAddress),
        sentAt: sentAt,
      };
      return data;
    }),

  sendEmail: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        // from: z.string(),
        // to: z.string(),
        // body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { accountId } = input;
        const googleService = new GoogleService();
        const account = await authorizeAccountAccess(
          accountId,
          ctx.auth.userId
        );

        console.log("account", account);

        // const data = await googleService.refreshAccessToken(
        //   account.refreshToken as string
        // );

        // console.log("data", data);

        const transport = nodemailer.createTransport({
          streamTransport: true,
          newline: "unix",
          buffer: true,
        });

        const mailOptions = {
          from: account.emailAddress,
          to: "roshdy2810@gmail.com",
          subject: "Hello from Gmail API",
          text: "This is a test email sent via Gmail API and Node.js!",
          date: new Date(),
        } satisfies MailOptions;

        const message = await transport.sendMail(mailOptions);

        const encodedMessage = message.message
          .toString("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const response = await googleService.sendMessage(
          encodedMessage,
          account.accessToken
        );

        console.log("response", response);
      } catch (error) {
        console.error("Error sending email:", error);
      }
    }),
});
