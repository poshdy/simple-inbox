"use client";
import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import AccountSwitcher from "./account-swicher";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import SearchMails from "./search-mails";
import ThreadList from "./threads/thread-list";

import MessageActions from "./message/message-actions";

import Messages from "./message/messages";
import { ModeToggle } from "@/components/toggle-theme";
import ComposeDrawer from "./compose-drawer";

const Sidebar = dynamic(
  () => {
    return import("./sidebar");
  },
  { ssr: false }
);

type Props = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed: boolean;
};

const Mail = ({
  defaultLayout = [20, 32, 48],
  navCollapsedSize,
  defaultCollapsed = false,
}: Props) => {
  // const [accountId] = useLocalStorage("accountId", "");
  // const [tab] = useLocalStorage<EmailLabel>(
  //   "simple-inbox-tab",
  //   EmailLabel.inbox
  // );
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        className="items-stretch h-hull min-h-screen"
        direction="horizontal"
        onLayout={(sizes: number[]) => console.log(sizes)}
      >
        {/* SIDE BAR */}
        <ResizablePanel
          collapsedSize={navCollapsedSize}
          defaultSize={defaultLayout[0]}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => setIsCollapsed(true)}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
          onResize={() => setIsCollapsed(false)}
        >
          <div className="flex flex-col h-full flex-1">
            <div
              className={cn(
                isCollapsed ? "h-[52px]" : "px-2",
                "flex h-[52px] items-center justify-between"
              )}
            >
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            <div className="flex-1">
              <Sidebar isCollapsed={isCollapsed} />
            </div>
            {/* ASK AI  */}
            ASK AI
            <div className="flex items-center gap-1 py-2 border-y-2 border-y-border">
              <div>account</div>
              <ModeToggle />
              <ComposeDrawer />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-muted" />

        {/* THREAD LIST */}
        <ResizablePanel
          className="mt-2"
          defaultSize={defaultLayout[1]}
          minSize={30}
        >
          <Tabs defaultValue="inbox">
            <div className="flex items-center px-4 ">
              <h1 className="text-md font-bold p-0">Inbox</h1>

              <TabsList className="ml-auto">
                <TabsTrigger className="" value="inbox">
                  Inbox
                </TabsTrigger>
                <TabsTrigger className="" value="done">
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <SearchMails />

            {/* TODO REMOVE TAB CONTENT AND LEAVE THREAD LIST IT WILL BE CHANGED DEPENDING ON QUERY STATES (tab, and done) */}
            <TabsContent value="inbox">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done">
              {/* <ThreadList /> */}
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-muted" />

        <ResizablePanel defaultSize={defaultLayout[2]} minSize={40}>
          <div className="overflow-y-scroll h-screen">
            <MessageActions />
            <Messages />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Mail;
