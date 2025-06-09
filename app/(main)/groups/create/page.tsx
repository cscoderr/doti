"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateGroup() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [groupName, setGroupName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically:
      // 1. Validate the wallet address/ENS name
      // 2. Create the group in your backend
      // 3. Handle any blockchain interactions if needed

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect back to groups page
      router.push("/groups");
    } catch (error) {
      console.error("Failed to create group:", error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Create New Group</h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="groupName"
                className="block text-sm font-medium mb-2"
              >
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label
                htmlFor="walletAddress"
                className="block text-sm font-medium mb-2"
              >
                Wallet Address or ENS Name
              </label>
              <input
                type="text"
                id="walletAddress"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address or ENS name"
                required
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="mt-2 text-sm text-textDark/60 dark:text-textLight/60">
                This will be used to receive payments for group membership
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-textLight border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
