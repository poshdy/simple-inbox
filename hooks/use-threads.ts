import { useTRPC } from "@/trpc/root";
import { EmailLabel } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useLocalStorage } from "usehooks-ts";

const threadAtom = atom<string | null>(null);

const useThreads = () => {
  const trpc = useTRPC();
  const { data: accounts } = useQuery(
    trpc.accounts.get.queryOptions(undefined)
  );

  const [threadId, setThreadId] = useAtom(threadAtom);
  const [accountId] = useLocalStorage("accountId", "");
  const [tab] = useLocalStorage<EmailLabel>(
    "simple-inbox-tab",
    EmailLabel.inbox
  );
  // TODO ADD DONE STATE AND SEND IT TO BACKEND
  const {
    data: threads,
    isPending,
    refetch,
  } = useQuery(
    trpc.mails.listThreads.queryOptions(
      { accountId, done: false, tab },
      {
        enabled: !!accountId && !!tab,
        placeholderData: (e) => e,
        refetchInterval: 60000,
      }
    )
  );

  return {
    threads,
    isPending,
    refetch,
    accountId,
    threadId,
    setThreadId,
    account: accounts?.find((acc) => acc.id == accountId),
  };
};

export default useThreads;
