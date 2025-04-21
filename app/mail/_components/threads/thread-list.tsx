import useThreads from "@/hooks/use-threads";
import { timeFromNow } from "@/lib/date";
import React from "react";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import Skeleton from "@/components/skeleton";

const ThreadList = () => {
  const { threads, isPending, threadId, setThreadId } = useThreads();

  if (isPending) {
    return <Skeleton count={5} />;
  }

  const groupByDate = threads?.reduce((acc, thread) => {
    const date = dayjs(thread?.emails[0]?.sentAt ?? new Date()).format(
      "DD MMM YYYY"
    );
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(thread);
    return acc;
  }, {} as Record<string, typeof threads>);

  const data = Object.entries(groupByDate ?? {});

  return (
    <div className="max-w-full overflow-y-scroll max-h-[calc(100vh-120px)] ">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {data?.map(([date, threads]) => {
          return (
            <React.Fragment key={date}>
              <span className="text-xs font-semibold first:mt-2 text-muted-foreground">
                {date}
              </span>
              {threads.map((thread) => (
                <div
                  onClick={() => setThreadId(thread.id)}
                  className={cn(
                    "rounded-xl cursor-pointer max-h-36 h-32 flex flex-col items-start gap-2 border p-4 text-left text-sm",
                    {
                      "bg-accent": threadId == thread.id,
                    }
                  )}
                  key={thread?.id}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center  justify-between">
                      <h2 className="font-bold text-sm">
                        {thread.emails[0].from.name ||
                          thread.emails[0].from.raw
                            ?.split(" ")
                            .slice(0, -1)
                            .join() ||
                          thread.emails[0].from.address}
                      </h2>
                      <span className="text-xs font-medium text-zinc-700">
                        {timeFromNow(thread.emails[0].sentAt)}
                      </span>
                    </div>

                    <span className="font-semibold line-clamp-1 text-[12px] text-zinc-500 ">
                      {thread.subject}
                    </span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: thread.emails[0].bodySnippet,
                    }}
                    className="text-xs line-clamp-3 text-zinc-500"
                  />

                  <div className="space-x-2">
                    {thread.emails[0].sysLabels.map((label, key) => (
                      <Badge variant={"secondary"} key={key}>
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ThreadList;
