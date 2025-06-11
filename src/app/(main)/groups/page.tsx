"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import {
  Search,
  Star,
  StarOff,
  Plus,
  MessageSquare,
  FileText,
  Users,
  Filter,
  AlertCircle,
  Wallet,
} from "lucide-react";
import blockies from "blockies-ts";
import { useRouter } from "next/navigation";

interface Group {
  id: string;
  title: string;
  purpose: string;
  unreadCount: number;
  isFavorite: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  members: number;
  icon?: string;
  price?: {
    amount: number;
    period: "one-time" | "weekly" | "monthly" | "yearly";
    chain: string;
  };
}

export default function Groups() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "favorites">("all");
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const router = useRouter();

  // Generate dummy groups data
  useEffect(() => {
    const dummyGroups: Group[] = Array.from({ length: 10 }, (_, index) => ({
      id: `group-${index + 1}`,
      title: `Group ${String.fromCharCode(65 + (index % 26))}${
        Math.floor(index / 26) + 1
      }`,
      purpose: [
        "General Discussion",
        "Project Planning",
        "Team Updates",
        "Knowledge Sharing",
        "Social Chat",
      ][index % 5],
      unreadCount: Math.floor(Math.random() * 20),
      isFavorite: Math.random() > 0.7,
      lastMessage: "Last message in the group...",
      lastMessageTime: new Date(Date.now() - Math.random() * 86400000),
      members: Math.floor(Math.random() * 50) + 5,
      price:
        Math.random() > 0.5
          ? {
              amount: Math.floor(Math.random() * 100) + 1,
              period: ["one-time", "weekly", "monthly", "yearly"][
                Math.floor(Math.random() * 4)
              ] as "one-time" | "weekly" | "monthly" | "yearly",
              chain: ["USDC on Base", "ETH on Base", "USDC on Optimism"][
                Math.floor(Math.random() * 3)
              ],
            }
          : undefined,
    }));
    setGroups(dummyGroups);
    setFilteredGroups(dummyGroups);
  }, []);

  // Filter groups based on search query and filter
  useEffect(() => {
    let filtered = groups;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (group) =>
          group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    switch (filter) {
      case "unread":
        filtered = filtered.filter((group) => group.unreadCount > 0);
        break;
      case "favorites":
        filtered = filtered.filter((group) => group.isFavorite);
        break;
      default:
        break;
    }

    setFilteredGroups(filtered);
  }, [searchQuery, filter, groups]);

  const toggleFavorite = (groupId: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? { ...group, isFavorite: !group.isFavorite }
          : group
      )
    );
  };

  const handleCreateGroup = () => {
    // Add create group logic here
    console.log("Create group clicked");
    router.push("/groups/create");
  };

  const handleGroupClick = (e: React.MouseEvent, group: Group) => {
    e.preventDefault();
    if (group.price) {
      setSelectedGroup(group);
      setShowConfirmDialog(true);
    } else {
      router.push(`/groups/${group.id}`);
    }
  };

  const handleConfirmJoin = async () => {
    if (!selectedGroup?.price) return;

    setIsProcessingPayment(true);
    try {
      // Here you would integrate with your wallet provider
      // For example, using ethers.js or web3.js
      // const provider = new ethers.providers.Web3Provider(window.ethereum);
      // const signer = provider.getSigner();
      // const tx = await signer.sendTransaction({
      //   to: "RECIPIENT_ADDRESS",
      //   value: ethers.utils.parseEther(selectedGroup.price.amount.toString())
      // });
      // await tx.wait();

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // After successful payment, redirect to group
      window.location.href = `/groups/${selectedGroup.id}`;
    } catch (error) {
      console.error("Payment failed:", error);
      // Handle payment error
    } finally {
      setIsProcessingPayment(false);
      setShowConfirmDialog(false);
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
        <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Groups</h1>
            <button
              onClick={handleCreateGroup}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
            >
              <Plus size={20} />
              <span>Create Group</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDark/60"
                  size={20}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                {(["all", "unread", "favorites"] as const).map(
                  (filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        filter === filterOption
                          ? "bg-primary text-textLight"
                          : "border border-neutral-200 dark:border-neutral-800 hover:bg-primary/10"
                      }`}
                    >
                      <Filter size={20} />
                      <span className="capitalize">{filterOption}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Groups Grid */}
          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => {
                const groupIcon = group.icon
                  ? group.icon
                  : blockies
                      .create({
                        seed: group.id,
                        size: 8,
                        scale: 4,
                      })
                      .toDataURL();

                return (
                  <div
                    key={group.id}
                    onClick={(e) => handleGroupClick(e, group)}
                    className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-primary transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Group Icon */}
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        {group.icon ? (
                          <span className="text-2xl">{group.icon}</span>
                        ) : (
                          <img
                            src={groupIcon}
                            alt={group.title}
                            className="w-12 h-12 rounded-lg"
                          />
                        )}
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {group.title}
                            </h3>
                            <p className="text-sm text-textDark/60 dark:text-textLight/60">
                              {group.purpose}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {group.price && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full">
                                <span className="text-xs font-medium text-accent">
                                  {group.price.amount} {group.price.chain} /
                                  {group.price.period}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(group.id);
                              }}
                              className={`p-2 rounded-full transition-colors ${
                                group.isFavorite
                                  ? "text-accent hover:bg-accent/10"
                                  : "text-textDark/60 hover:bg-primary/10"
                              }`}
                            >
                              {group.isFavorite ? (
                                <Star size={20} />
                              ) : (
                                <StarOff size={20} />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-textDark/60 dark:text-textLight/60">
                          <div className="flex items-center gap-1">
                            <Users size={16} />
                            <span>{group.members} members</span>
                          </div>
                          {group.unreadCount > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageSquare size={16} />
                              <span>{group.unreadCount} unread</span>
                            </div>
                          )}
                          {group.lastMessageTime && (
                            <span>
                              {group.lastMessageTime.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText
                size={64}
                className="text-textDark/20 dark:text-textLight/20 mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">No Groups Found</h3>
              <p className="text-textDark/60 dark:text-textLight/60 mb-6 max-w-md">
                {searchQuery || filter !== "all"
                  ? "No groups match your search criteria. Try adjusting your filters."
                  : "You haven't joined any groups yet. Create a new group to get started."}
              </p>
              <button
                onClick={handleCreateGroup}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
              >
                <Plus size={20} />
                <span>Create Group</span>
              </button>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmDialog && selectedGroup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[var(--background)] rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={24} className="text-accent" />
                  <h3 className="text-lg font-semibold">Join Group</h3>
                </div>
                <p className="text-textDark/80 dark:text-textLight/80 mb-6">
                  This group requires a payment of {selectedGroup.price?.amount}{" "}
                  {selectedGroup.price?.chain} ({selectedGroup.price?.period})
                  to join. Would you like to proceed with the payment?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-primary/10 transition-colors"
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmJoin}
                    disabled={isProcessingPayment}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-textLight border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet size={20} />
                        Pay & Join
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
