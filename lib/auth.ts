import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }
};
