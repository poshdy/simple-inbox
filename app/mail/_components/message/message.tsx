import useThreads from "@/hooks/use-threads";
import { timeFromNow } from "@/lib/date";
import { cn } from "@/lib/utils";
import { RouterOutputs } from "@/trpc/react";
import React from "react";
import { Letter } from "react-letter";
type MessageProps = {
  email: RouterOutputs["mails"]["getThread"];
};

const Message = ({ email }: MessageProps) => {
  const { account } = useThreads();
  const isMe = account?.emailAddress === email?.from.address;
  return (
    <section
      className={cn(
        "border rounded-md p-4 transition-all hover:translate-x-2",
        {
          "border-l-4 border-gray-950": isMe,
        }
      )}
    >
      <div className="w-full flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {!isMe && (
              <span className="size-10 rounded-full flex bg-muted items-center justify-center shrink-0">
                {email?.from?.name
                  ?.split(" ")
                  .map((c) => c[0])
                  .join("")}
              </span>
            )}
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {isMe ? "Me" : email?.from.address}
              </span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            {timeFromNow(email?.sentAt ?? new Date())}
          </span>
        </div>

        <Letter
          className=" rounded-md w-[85%] mx-auto"
          html={email?.body ?? ""}
        />
      </div>
    </section>
  );
};

export default Message;
