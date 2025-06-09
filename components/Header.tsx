import React, { useState, useEffect } from "react";
import { Sun, Moon, Wallet, SidebarOpen, SidebarClose } from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const Header = ({ sidebarOpen, onSidebarToggle }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [walletBalance] = useState("0.00");

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
          <span className="text-xl font-bold text-primary">DOTI</span>
        </div>
      </div>

      {/* Right Section - Theme Toggle and Wallet Balance */}
      <div className="flex items-center gap-4">
        {/* Wallet Balance */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
          <Wallet size={18} />
          <span className="font-medium">{walletBalance} USDC</span>
        </div>

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
      </div>
    </header>
  );
};

export default Header;
