"use client";

import { createContext, PropsWithChildren, useEffect, useState } from "react";

type ThemeProviderContextType = {
  toggleMode?: () => void;
};
const ThemeProviderContext = createContext<ThemeProviderContextType>({});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark || darkMode) {
      document.documentElement.classList.add("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", String(newMode));
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", newMode);
      }
      return newMode;
    });
  };
  return (
    <ThemeProviderContext.Provider value={{ toggleMode: toggleDarkMode }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

export const useTheme = () => {
  const context = ThemeProviderContext;
  if (!context) {
    throw Error("ThemeProviderContext should be used within ThemeProvider");
  }
  return context;
};
