import { GoogleService } from "./google";
import { db } from "@/server/db";
// import { auth } from "@clerk/nextjs/server";
import { EmailMessage } from "../types";
import dayjs, { Dayjs } from "dayjs";
import { DatabaseSync } from "./sync-to-db";
// import { auth } from "@clerk/nextjs/server";

// type SyncResponse = {
//   allEmails: EmailMessage[];
//   nextPageToken: string | undefined | null;
// };

export class Account {
  private token: string;
  private google: GoogleService;
  constructor(token: string) {
    this.token = token;
    this.google = new GoogleService();
  }

  async performSync(accountId: string, startDate: Dayjs) {
    const response = await this.syncEmails(accountId, startDate);

    if (!response) {
      throw new Error("Failed to sync emails");
    }
    const { allEmails, mostRecentDate } = response;
    console.log("most recent date", dayjs.unix(mostRecentDate).toISOString());
    await db.account.update({
      where: { id: accountId },
      data: {
        lastSyncAt: mostRecentDate,
      },
    });

    const sync = new DatabaseSync();
    await sync.syncEmailsToDatabase(allEmails, accountId);
  }
  async syncEmails(accountId: string, startDate: Dayjs) {
    // get the last synced date from db by account ID

    try {
      const account = await db.account.findUnique({
        where: { id: accountId },
        select: { lastSyncAt: true, accessToken: true },
      });

      if (!account) throw new Error("Account Not Found");

      let lastSyncedDate = Number(account?.lastSyncAt);

      const unixTimeStampStartDate = startDate.unix();

      console.log("start date unix", unixTimeStampStartDate);
      console.log(
        "start date string",
        dayjs.unix(unixTimeStampStartDate).toISOString()
      );

      console.log("last synced date db", lastSyncedDate);
      // if there is no last synced date, set it to start date
      if (!lastSyncedDate) {
        console.log("runs");
        lastSyncedDate = unixTimeStampStartDate;
      }

      const afterTimestamp = lastSyncedDate;

      let allEmails: EmailMessage[] = [];

      let nextPageToken = null;

      let mostRecentDate = lastSyncedDate;

      do {
        const data = await this.google.getMessages(
          account?.accessToken,
          afterTimestamp,
          nextPageToken
        );

        if (data.messages && data.messages.length > 0) {
          const messages = data.messages;
          nextPageToken = data.nextPageToken;
          const emails = await Promise.all(
            messages.map(async (message) => {
              const emailInfo = await this.google.getMessage(
                message?.id as string
              );

              console.log("subject", emailInfo.subject);

              const internalUnix = dayjs(emailInfo.sentAt).unix();

              if (internalUnix <= lastSyncedDate) {
                return null;
              }

              if (internalUnix > mostRecentDate) {
                mostRecentDate = internalUnix;
              }
              return emailInfo;
            })
          );
          allEmails = [
            ...allEmails,
            ...emails.filter((email) => email !== null),
          ];
        }
      } while (nextPageToken);
      return {
        allEmails,
        nextPageToken,
        mostRecentDate,
      };
    } catch (error) {
      if (error instanceof Error) {
        // if (error?.message == "Invalid Credentials") {
        //   const { userId } = await auth();
        //   const user = await db.user.findUnique({
        //     where: { id: userId as string },
        //     select: { accounts: { select: { refreshToken: true } } },
        //   });
        //   const data = await this.google.refreshAccessToken(
        //     user?.accounts[0]?.refreshToken as string
        //   );
        //   await db.account.update({
        //     where: { accessToken: this.token },
        //     data: { accessToken: data.access_token },
        //   });
        // }
      }
    }
  }
}
