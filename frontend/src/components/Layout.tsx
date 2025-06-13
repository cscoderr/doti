"use client";
import { PropsWithChildren, useState } from "react";
import SideBar from "@/components/SideBar";
import Header from "@/components/Header";
import { useAccount } from "wagmi";
import React from "react";

const Layout = ({ children }: PropsWithChildren) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const account = useAccount();

  if (account.isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <SideBar isOpen={sidebarOpen} />
        <Header
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main
          className={`pt-20 pb-20 md:pb-0 transition-all duration-200 ${
            sidebarOpen ? "md:ml-56" : "md:ml-16"
          }`}
        >
          {children}
        </main>
      </div>
    );
  }
  return <React.Fragment>{children}</React.Fragment>;
};
export default Layout;
