import { GoogleService } from "@/lib/google";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { after } from "next/server";
import axios from "axios";
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");

  if (!code)
    return NextResponse.json({ message: "no code provided" }, { status: 400 });

  const google = new GoogleService();
  const { tokens } = await google.client.getToken(code);
  console.log("tokens", tokens);

  google.client.setCredentials(tokens);

  const userInfo = await google.getUser();

  console.log({
    userId,
    accessToken: tokens.access_token as string,
    refresh: tokens.refresh_token as string,
    name: userInfo.name || (userInfo.given_name as string),
    emailAddress: userInfo.email as string,
    provider: "Google",
    id: userInfo.id as string,
  });
  await db.account.upsert({
    where: {
      id: userInfo.id as string,
    },
    update: {
      accessToken: tokens.access_token as string,
    },
    create: {
      userId,
      refreshToken: tokens.refresh_token as string,
      accessToken: tokens.access_token as string,
      name: userInfo.name || (userInfo.given_name as string),
      emailAddress: userInfo.email as string,
      provider: "Google",
      id: userInfo.id as string,
    },
  });

  const task = axios.post("http://localhost:3000/api/mailbox/initial-sync", {
    accountId: userInfo.id?.toString(),
    userId,
  });

  after(() => task);
  return NextResponse.redirect(new URL("/mail", request.url));
}
