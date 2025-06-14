import React, { useState, useEffect } from "react";
import { Sun, Moon, SidebarOpen, SidebarClose } from "lucide-react";
import { env } from "@/lib/env";

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const Header = ({ sidebarOpen, onSidebarToggle }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

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
    <header
      className={`fixed top-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-background text-textLight border-b border-neutral-800 transition-all duration-200
        ${sidebarOpen ? "md:left-56" : "md:left-16"} left-0`}
    >
      {/* Left Section - Title and Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle - Only show on desktop */}
        <button
          onClick={onSidebarToggle}
          aria-label={sidebarOpen ? "Minimize sidebar" : "Maximize sidebar"}
          className="hidden md:flex p-2 rounded hover-primary"
        >
          {sidebarOpen ? (
            <SidebarOpen size={22} className="text-primary" />
          ) : (
            <SidebarClose size={22} className="text-primary" />
          )}
        </button>

        {/* Title - Show on mobile */}
        <div className="md:hidden flex items-center">
          <span className="text-xl font-bold text-primary">
            {env.appName.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Right Section - Theme Toggle and Wallet Balance */}
      <div className="flex items-center gap-4">
        {/* Wallet Balance */}
        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="p-2 rounded-full hover-primary"
        >
          {darkMode ? (
            <Sun size={20} className="text-accent" />
          ) : (
            <Moon size={20} className="text-primary" />
          )}
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-primary">
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-background border border-neutral-200 dark:border-neutral-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[50%] after:start-[2px] after:-translate-y-[50%] after:bg-white after:border-neutral-200 dark:after:border-neutral-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-primary"></div>
            <span className="ms-3 text-sm font-medium text-primary">
              Testnet
            </span>
          </label>
        </div>

        {/* <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
          <Wallet size={18} />
          <span className="font-medium">
            {walletBalance} {env.defaultToken}
          </span>
        </div> */}
      </div>
    </header>
  );
};

export default Header;
