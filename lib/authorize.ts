"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleService } from "./google";

export default async function Authorize(type: "Google" | "Office 365") {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthoried");
  }

  if (type == "Google") {
    const google = new GoogleService();
    const authUrl = google.client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://mail.google.com/",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.compose",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "email",
        "profile",
      ],
    });

    console.log("authUrl", authUrl);
    return authUrl;
  }
}
