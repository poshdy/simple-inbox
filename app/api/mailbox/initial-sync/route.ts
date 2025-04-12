import { Account } from "@/lib/account";
import { DatabaseSync } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { accountId, userId } = await request.json();

  if (!userId || !accountId) {
    return NextResponse.json(
      { error: "Missing account id or userId" },
      { status: 400 }
    );
  }

  const dbAccount = await db.account.findUnique({
    where: { id: accountId, userId },
  });

  if (!dbAccount) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }

  const account = new Account(dbAccount.accessToken);

  const response = await account.performInitialSync();
  if (!response) {
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
  const { allEmails, nextPageToken } = response;

  const sync = new DatabaseSync();
  await sync.syncEmailsToDatabase(allEmails, accountId);

  await db.account.update({
    where: {
      accessToken: dbAccount.accessToken,
    },
    data: {
      nextPageToken: nextPageToken,
    },
  });
  console.log("sync complete", nextPageToken);
  return NextResponse.json({ success: true, nextPageToken }, { status: 200 });
}
