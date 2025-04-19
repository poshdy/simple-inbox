import { db } from "@/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
// import { EmailLabel } from "@prisma/client";

export const authorizeAccountAccess = async (
  accountId: string,
  userId: string
) => {
  const account = await db.account.findUnique({
    where: {
      userId,
      id: accountId,
    },
    select: {
      accessToken: true,
      refreshToken: true,
      name: true,
      emailAddress: true,
      id: true,
    },
  });

  if (!account) {
    throw new Error("Account Not Found");
  }
  return account;
};

export const accountsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.account.findMany({
      where: {
        userId: ctx.auth.userId,
      },
      select: {
        emailAddress: true,
        id: true,
        name: true,
      },
    });
  }),

  getThreadCount: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .query(async ({ ctx, input }) => {
      const account = await authorizeAccountAccess(
        input.accountId,
        ctx.auth.userId
      );

      const [inbox, sent, draft] = await Promise.all([
        ctx.db.thread.count({
          where: { accountId: account.id, inboxStatus: true },
        }),
        ctx.db.thread.count({
          where: { accountId: account.id, sentStatus: true },
        }),
        ctx.db.thread.count({
          where: { accountId: account.id, draftStatus: true },
        }),
      ]);

      return {
        inbox,
        sent,
        draft,
      };
    }),
});
