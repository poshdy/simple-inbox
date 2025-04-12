"use client";
import { useTRPC } from "@/trpc/root";
import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "usehooks-ts";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Authorize from "@/lib/authorize";
import { Plus } from "lucide-react";
type Props = {
  isCollapsed: boolean;
};

const AccountSwitcher = ({ isCollapsed = false }: Props) => {
  const trpc = useTRPC();

  // TODO CONFIGURE TRPC TO RE-FETCH DATA ON CHANGE OR WHEN WE HAVE A NEW DATA
  const { data: accounts, isPending } = useQuery(
    trpc.accounts.get.queryOptions(undefined, {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    })
  );
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      if (accountId) return;
      setAccountId(accounts[0]!.id);
    } else if (accounts && accounts.length === 0) {
      toast("Link an Account to continue!", {
        action: {
          label: "Add an Account!",
          onClick: async () => {
            try {
              const url = await Authorize("Google");
              if (url) {
                window.location.href = url;
              }
            } catch (error) {
              toast.error((error as Error).message);
            }
          },
        },
      });
    }
  }, [accounts, accountId, setAccountId]);

  if (!accounts) return <></>;
  return (
    <div className="items-center gap-2 flex w-full">
      <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger
          className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
              "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select account"
        >
          <SelectValue placeholder="Select an account">
            <span className={cn({ hidden: !isCollapsed })}>
              {
                accounts?.find((account) => account.id === accountId)
                  ?.emailAddress[0]
              }
            </span>
            <span className={cn("ml-2", { hidden: isCollapsed })}>
              {
                accounts?.find((account) => account.id === accountId)
                  ?.emailAddress
              }
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isPending ? (
            <SelectItem value="loading">Loading...</SelectItem>
          ) : (
            accounts?.map((account) => {
              return (
                <SelectItem key={account.id} value={account.id}>
                  {account.emailAddress}
                </SelectItem>
              );
            })
          )}

          <div
            onClick={async () => {
              try {
                const url = await Authorize("Google");
                if (url) {
                  window.location.href = url;
                }
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
            className="relative flex hover:bg-gray-50 w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <Plus className="size-4 mr-1" />
            Add account
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AccountSwitcher;
