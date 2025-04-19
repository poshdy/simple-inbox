import { GoogleService } from "./google";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { EmailMessage } from "../types";

type SyncResponse = {
  allEmails: EmailMessage[];
  nextPageToken: string | undefined | null;
};

export class Account {
  private token: string;
  private google: GoogleService;
  constructor(token: string) {
    this.token = token;
    this.google = new GoogleService();
  }

  private async getUpdated(
    daysWithin: number,
    pageToken: string | undefined | null
  ) {
    const { emails, nextPageToken } = await this.google.getMessages(
      this.token,
      daysWithin,
      pageToken
    );

    return {
      emails,
      nextPageToken,
    };
  }
  private async startSync(days: number) {
    try {
      const { emails, nextPageToken } = await this.google.getMessages(
        this.token,
        days
      );

      return {
        emails,
        nextPageToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error?.message == "Invalid Credentials") {
          const { userId } = await auth();
          const user = await db.user.findUnique({
            where: { id: userId as string },
            select: { accounts: { select: { refreshToken: true } } },
          });
          const data = await this.google.refreshAccessToken(
            user?.accounts[0]?.refreshToken as string
          );
          await db.account.update({
            where: { accessToken: this.token },
            data: { accessToken: data.access_token },
          });
        }
      }
    }
  }

  async performInitialSync(): Promise<SyncResponse | undefined> {
    try {
      const daysWithin = Math.floor(
        (Date.now() - 14 * 24 * 60 * 60 * 1000) / 1000
      );
      const response = await this.startSync(daysWithin);

      let nextPageToken: string | undefined | null = response?.nextPageToken;

      console.log("first page token", nextPageToken);

      let updatedResponse = await this.getUpdated(daysWithin, nextPageToken);

      if (updatedResponse?.nextPageToken) {
        nextPageToken = updatedResponse.nextPageToken;
      }
      console.log("updated response", updatedResponse.nextPageToken);

      const initalEmail = response?.emails as EmailMessage[];

      console.log("initial emails", initalEmail.length);

      let allEmails = [
        ...initalEmail,
        ...(updatedResponse?.emails as EmailMessage[]),
      ];

      while (updatedResponse?.nextPageToken) {
        console.log("enterd the loop");
        updatedResponse = await this.getUpdated(
          daysWithin,
          updatedResponse.nextPageToken
        );
        allEmails = allEmails?.concat(updatedResponse?.emails);
        console.log("emails are saved");
      }

      console.log(`initial sync done with ${allEmails.length} emails!`);
      return {
        nextPageToken,
        allEmails,
      };
    } catch (error) {
      console.log("ERROR IN PERFORM INIAL SYNC", error);
    }
  }
}
