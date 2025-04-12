import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { authorizeAccountAccess } from "./accounts";
import { Prisma } from "@prisma/client";

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
        const threads = await ctx.db.thread.findMany({
          where: filter,
          take: 15,
          include: {
            emails: {
              orderBy: { sentAt: "asc" },
              take: 1,
              select: {
                id: true,
                from: true,
                to: true,
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

        return threads.map(({ emails, ...rest }) => {
          const { sysLabels, sysClassifications, ...email } = emails[0];
          return {
            ...rest,
            lastMessage: {
              ...email,
              label: sysLabels.concat(sysClassifications),
            },
          };
        });
      } catch (error) {
        console.error("ERROR FETCHING THREADS", error);
      }
    }),
});
