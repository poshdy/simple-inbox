"use client";
import { Action, useRegisterActions } from "kbar";
import { useTheme } from "next-themes";

const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const ToggleTheme = () => setTheme(theme == "dark" ? "light" : "dark");

  const themeActions: Action[] = [
    {
      id: "toggleTheme",
      name: "Toggle theme",
      shortcut: ["f"],
      section: "Themes",
      perform: () => ToggleTheme(),
    },
    {
      id: "darkMode",
      name: "Set dark mode",
      shortcut: ["t", "d"],
      section: "Themes",
      perform: () => setTheme("dark"),
    },
    {
      id: "ligthMode",
      name: "Set light mode",
      shortcut: ["t", "l"],
      section: "Themes",
      perform: () => setTheme("light"),
    },
  ];

  useRegisterActions(themeActions, [theme]);
};

export default useThemeToggle;
