import React, { useCallback, useMemo } from "react";
import { Home, Users, LogOut, Search, MessageCircle, Copy } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import UserIcon from "./UserIcon";

const navItems = [
  {
    label: "Dashboard",
    icon: <Home size={20} />,
    href: "/",
  },
  {
    label: "Chat",
    icon: <MessageCircle size={20} />,
    href: "/chat",
  },
  {
    label: "Marketplace",
    icon: <Search size={20} />,
    href: "/marketplace",
  },
  {
    label: "Groups",
    icon: <Users size={20} />,
    href: "/groups",
  },
];

interface SideBarProps {
  isOpen: boolean;
}

const SideBar = ({ isOpen }: SideBarProps) => {
  const pathname = usePathname();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleSignOut = () => {
    disconnect();
    router.push("/login");
  };

  const formattedAddress = useMemo(() => {
    return (
      address?.substring(0, 6) + "...." + address?.substring(address.length - 4)
    );
  }, [address]);
  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(`${address}`);
  }, [address]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-background text-textDark dark:text-textLight border-r border-neutral-200 dark:border-neutral-800 transition-all duration-200 z-40 hidden md:flex flex-col
          ${isOpen ? "w-56" : "w-16"}`}
        style={{
          boxShadow: "0 1px 4px 0 rgba(0,0,0,0.02)",
        }}
      >
        {/* Sidebar Header */}
        {/* <div className="flex items-center justify-center px-4 py-4">
          {isOpen ? (
            <span className="text-2xl font-bold transition-all opacity-100 w-auto hover:text-accent cursor-pointer">
              DOTI
            </span>
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center hover:bg-accent transition-colors duration-200 cursor-pointer">
              <span className="text-textLight font-bold text-lg">D</span>
            </div>
          )}
        </div> */}
        <div className="flex items-center px-4 py-4 space-x-2">
          <div
            className={`w-${isOpen ? 12 : 8} h-${isOpen ? 12 : 8} rounded-${
              isOpen ? "xl" : "md"
            } bg-gradient-to-br from-primary to-secondary flex items-center justify-center transition-all`}
          >
            <span
              className={`text-${isOpen ? "2xl" : "1xl"} font-bold text-white`}
            >
              D
            </span>
          </div>
          {isOpen && (
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DOTi
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 text-textDark dark:text-textLight hover-primary
                      ${!isOpen ? "justify-center" : ""}
                      ${isActive ? "bg-primary/10 text-primary" : ""}`}
                    title={item.label}
                  >
                    <span
                      className={`transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? "text-primary" : ""
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`text-base font-medium transition-all ${
                        isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                      }`}
                      style={{ transition: "opacity 0.2s, width 0.2s" }}
                    >
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile and Logout Section */}
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 px-4 py-2 mb-2 text-textDark dark:text-textLight hover:bg-error/20 hover:text-error
                      ${!isOpen ? "justify-center" : ""}`}
        >
          <span
            className={`transition-transform duration-200 group-hover:scale-110`}
          >
            <LogOut size={20} className="text-error" />
          </span>
          <span
            className={`text-error font-medium transition-all ${
              isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
            style={{ transition: "opacity 0.2s, width 0.2s" }}
          >
            Sign out
          </span>
        </button>
        <div className="mt-auto border-t border-neutral-200 dark:border-neutral-800 p-4">
          <div
            className={`flex items-center ${
              isOpen ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserIcon size={8} />
              {isOpen && address && (
                <div className="flex flex-col">
                  <div className="flex flex-row items-center space-x-2">
                    <span className="text-sm font-medium">
                      {formattedAddress}
                    </span>
                    <Copy size={12} onClick={handleCopyAddress} />
                  </div>
                  <span className="text-xs text-textDark/60 dark:text-textLight/60">
                    csccoder.basetest.eth
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[var(--background)] border-t border-neutral-200 dark:border-neutral-800 md:hidden z-40 shadow-[0_-1px_4px_0_rgba(0,0,0,0.04)]">
        <ul className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.label} className="flex-1">
                <a
                  href={item.href}
                  className={`flex flex-col items-center justify-center py-2 px-1 text-textDark dark:text-textLight hover-primary
                    ${isActive ? "text-primary" : ""}`}
                >
                  <span className={`text-lg ${isActive ? "text-primary" : ""}`}>
                    {item.icon}
                  </span>
                  <span
                    className={`text-xs mt-1 ${isActive ? "text-primary" : ""}`}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default SideBar;
