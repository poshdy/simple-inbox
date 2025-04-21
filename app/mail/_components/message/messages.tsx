import useThreads from "@/hooks/use-threads";
import React from "react";
import { Separator } from "@/components/ui/separator";
import MessageHeader from "./message-header";
import Message from "./message";
import ReplyBox from "./reply-box";
import Skeleton from "@/components/skeleton";

const Messages = () => {
  const { threads, threadId, isPending } = useThreads();

  if (isPending)
    return (
      <div className="w-full h-screen pt-5 space-y-10">
        <Skeleton count={1} avatar />
        <Skeleton avatar count={1} body title={false} paragraph={false} />
      </div>
    );
  const thread = threads?.find((t) => t?.id == threadId);

  return (
    <section className="h-full border flex-1 overflow-y-scroll hide-scrollbar">
      {thread ? (
        <div className="w-full h-full flex flex-col">
          <MessageHeader data={thread.emails[0]} />
          <Separator />
          <div className="flex-1  flex flex-col">
            <div className="p-6 flex flex-col gap-1">
              {thread.emails.map((email) => (
                <Message key={email.id} email={email} />
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex-1"></div>
          <ReplyBox threadId={thread.id} accountId={thread.accountId} />
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          No Message selected
        </div>
      )}
    </section>
  );
};

export default Messages;
