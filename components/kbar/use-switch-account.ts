import { useTRPC } from "@/trpc/root";
import { useQuery } from "@tanstack/react-query";
import { useRegisterActions } from "kbar";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useAccountSwitching = () => {
  const trpc = useTRPC();
  const { data: accounts } = useQuery(trpc.accounts.get.queryOptions());

  const mainAction = [
    {
      id: "accountsAction",
      name: "Switch Account",
      shortcut: ["e", "s"],
      section: "Accounts",
    },
  ];
  const [_, setAccountId] = useLocalStorage("accountId", "");

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const index = parseInt(event.key) - 1;
        if (accounts && accounts.length > index) {
          setAccountId(accounts[index]!.id);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [accounts, setAccountId]);

  useRegisterActions(
    mainAction.concat(
      accounts?.map((account) => {
        return {
          id: account.id,
          name: account.name,
          parent: "accountsAction",
          perform: () => {
            console.log("perform", account.id);
            setAccountId(account.id);
          },
          keywords: [account.name, account.emailAddress].filter(
            Boolean
          ) as string[],
          shortcut: [],
          section: "Accounts",
          subtitle: account.emailAddress,
          priority: 1000,
        };
      }) || []
    ),
    [accounts]
  );
};

export default useAccountSwitching;
