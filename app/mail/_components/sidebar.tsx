"use client";
import { File, Inbox, Send } from "lucide-react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

import { EmailLabel } from "@prisma/client";
import { Nav } from "./nav";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/root";

type Props = {
  isCollapsed: boolean;
};

const Sidebar = ({ isCollapsed }: Props) => {
  const trpc = useTRPC();
  const [accountId] = useLocalStorage("accountId", "");

  const [tab] = useLocalStorage<EmailLabel>(
    "simple-inbox-tab",
    EmailLabel.inbox
  );

  const { data: threadCount } = useQuery(
    trpc.accounts.getThreadCount.queryOptions({ accountId })
  );

  const NAV_ITEMS = [
    {
      title: "Inbox",
      label: threadCount?.inbox.toString() ?? "0",
      icon: Inbox,
      variant:
        tab === EmailLabel.inbox ? "default" : ("ghost" as "default" | "ghost"),
    },
    {
      title: "Sent",
      label: threadCount?.sent.toString() ?? "0",
      icon: Send,
      variant:
        tab === EmailLabel.sent ? "default" : ("ghost" as "default" | "ghost"),
    },
    {
      title: "Draft",
      label: threadCount?.draft.toString() ?? "0",
      icon: File,
      variant:
        tab === EmailLabel.draft ? "default" : ("ghost" as "default" | "ghost"),
    },
  ];
  return <Nav isCollapsed={isCollapsed} links={NAV_ITEMS} />;
};

export default Sidebar;
