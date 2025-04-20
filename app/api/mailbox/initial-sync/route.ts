import { Account } from "@/lib/account";
import { db } from "@/server/db";
import dayjs from "dayjs";
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

  const startDate = dayjs().subtract(14, "days");

  const response = await account.syncEmails(accountId, startDate);
  if (!response) {
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }

  await account.performSync(accountId, startDate);

  return NextResponse.json({ success: true }, { status: 200 });
}
