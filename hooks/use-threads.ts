import { useTRPC } from "@/trpc/root";
import { EmailLabel } from "@prisma/client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import { useThread } from "./use-thread";

const useThreads = () => {
  const trpc = useTRPC();
  const { data: accounts } = useQuery(
    trpc.accounts.get.queryOptions(undefined)
  );

  const [threadId, setThreadId] = useThread();
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<EmailLabel>(
    "simple-inbox-tab",
    EmailLabel.inbox
  );

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isPending } =
    useInfiniteQuery(
      trpc.mails.listThreads.infiniteQueryOptions(
        { accountId, done: false, tab },
        {
          getNextPageParam: (data) => data?.nextCursor,
        }
      )
    );

  return {
    data,
    isPending,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    // refetch,
    accountId,
    threadId,
    setThreadId,
    account: accounts?.find((acc) => acc.id == accountId),
  };
};

export default useThreads;
