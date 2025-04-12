import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";

export async function POST(request: NextRequest) {
  const payload: WebhookEvent = await request.json();

  if (payload.type == "user.created") {
    console.log("data", payload.data);
    const {
      first_name: firstName,
      last_name: lastName,
      has_image,
      image_url,
      id,
      email_addresses,
    } = payload.data;
    const emailAddress = email_addresses[0].email_address;

    await db.user.create({
      data: {
        id,
        emailAddress,
        firstName: firstName as string,
        lastName: lastName as string,
        imageUrl: has_image ? image_url : null,
      },
    });
  }

  return new NextResponse("webhook recieved", { status: 200 });
}
