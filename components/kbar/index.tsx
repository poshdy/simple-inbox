"use client";
import {
  KBarProvider,
  KBarPositioner,
  KBarSearch,
  KBarAnimator,
  KBarPortal,
  Action,
} from "kbar";

import React from "react";
import { useLocalStorage } from "usehooks-ts";
import RenderResults from "./render-results";
import useThemeToggle from "./use-theme-toggle";
import useAccountSwitching from "./use-switch-account";

const KbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [_, setTab] = useLocalStorage("simple-inbox-tab", "");
  const actions: Action[] = [
    {
      id: "inbox",
      name: "Inbox",
      section: "Navigation",
      shortcut: ["i"],

      perform: () => setTab("inbox"),
    },
    {
      id: "sent",
      name: "Sent",
      shortcut: ["s"],
      section: "Navigation",

      perform: () => setTab("sent"),
    },
    {
      id: "draft",
      name: "Draft",
      shortcut: ["d"],
      section: "Navigation",

      perform: () => setTab("draft"),
    },
  ];
  return (
    <KBarProvider actions={actions}>
      <Child>{children}</Child>
    </KBarProvider>
  );
};

export default KbarProvider;

const Child = ({ children }: { children: React.ReactNode }) => {
  useThemeToggle();
  useAccountSwitching();
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[999]">
          <KBarAnimator className="max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-600 rounded-lg overflow-hidden relative !-translate-y-12 ">
            <div className="bg-white dark:bg-gray-800">
              <div className="border-x-0 border-b-2 dark:border-gray-700">
                <KBarSearch className="px-6 py-4 w-full bg-white dark:bg-gray-800 outline-none focus:ring-0 border-none" />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
