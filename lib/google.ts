import { EmailParser } from "@/utils/email-parser";
import axios from "axios";
import * as googleApis from "googleapis";
const { GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_ID, CALLBACK_URL } = process.env;

export class GoogleService {
  client: googleApis.Common.OAuth2Client;
  gmail: googleApis.gmail_v1.Gmail;
  constructor() {
    this.client = new googleApis.google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: CALLBACK_URL,
      forceRefreshOnFailure: true,
    });

    this.gmail = googleApis.google.gmail({
      version: "v1",
      auth: this.client,
    });
  }

  async getUser() {
    const oauth2 = googleApis.google.oauth2({
      auth: this.client,
      version: "v2",
    });
    const { data } = await oauth2.userinfo.get();
    return data;
  }

  async getThread(userId: string, threadId: string) {
    const response = await this.gmail.users.threads.get({
      auth: this.client,
      userId: "me",
      id: threadId,
    });

    const thread = response.data;

    return {
      subject: thread.snippet,
      lastMessageDate: thread.messages?.reduce((latest, message) =>
        Number(latest.internalDate) > Number(message.internalDate)
          ? message
          : latest
      ),
    };
  }
  async getMessages(
    token: string,
    days: number | undefined = undefined,
    pageToken: string | undefined | null = undefined
  ) {
    this.client.setCredentials({ access_token: token });

    const response = await this.gmail.users.messages.list({
      auth: this.client,
      q: `after:${days}`,
      userId: "me",
      maxResults: 20,
      pageToken: pageToken ? pageToken : undefined,
    });

    const inital = response.data;

    const messages = inital.messages;
    const nextPageToken = inital.nextPageToken;

    const emails = [];

    if (messages && messages?.length > 0) {
      for (let i = 0; i < messages?.length; i++) {
        const message = messages[i];

        const emailInfo = await this.getMessage(message?.id as string);
        emails.push(emailInfo);
      }
    }

    return {
      emails,
      nextPageToken,
    };
  }

  async getMessage(messageId: string) {
    const emailParser = new EmailParser();
    const response = await this.gmail.users.messages.get({
      auth: this.client,
      userId: "me",
      id: messageId as string,
    });

    const email = response.data;

    const emailInfo = await emailParser.parseEmailInfo(email);

    return emailInfo;
  }

  async refreshAccessToken(refreshToken: string) {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.status != 200) {
      throw new Error(`Failed to refresh token: ${response.data}`);
    }

    return response.data;
  }
}
