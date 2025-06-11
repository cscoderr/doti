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
  Users,
  Filter,
  Home,
  Building2,
  Building,
} from "lucide-react";
import blockies from "blockies-ts";
import Link from "next/link";

interface House {
  id: string;
  title: string;
  type: "apartment" | "house" | "condo" | "townhouse";
  address: string;
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

export default function HouseGroups() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "favorites">("all");
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");

  // Generate dummy houses data
  useEffect(() => {
    const dummyHouses: House[] = Array.from({ length: 10 }, (_, index) => ({
      id: `house-${index + 1}`,
      title: `${
        ["Sunset", "Ocean", "Mountain", "Valley", "Riverside"][index % 5]
      } ${["Apartments", "Houses", "Condos", "Townhouses"][index % 4]}`,
      type: ["apartment", "house", "condo", "townhouse"][
        index % 4
      ] as House["type"],
      address: `${1000 + index} Main St, City, State ${10000 + index}`,
      unreadCount: Math.floor(Math.random() * 20),
      isFavorite: Math.random() > 0.7,
      lastMessage: "Last message in the group...",
      lastMessageTime: new Date(Date.now() - Math.random() * 86400000),
      members: Math.floor(Math.random() * 50) + 5,
      price:
        Math.random() > 0.5
          ? {
              amount: Math.floor(Math.random() * 1000) + 500,
              period: ["one-time", "weekly", "monthly", "yearly"][
                Math.floor(Math.random() * 4)
              ] as "one-time" | "weekly" | "monthly" | "yearly",
              chain: ["USDC on Base", "ETH on Base", "USDC on Optimism"][
                Math.floor(Math.random() * 3)
              ],
            }
          : undefined,
    }));
    setHouses(dummyHouses);
    setFilteredHouses(dummyHouses);
  }, []);

  // Filter houses based on search query and filters
  useEffect(() => {
    let filtered = houses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (house) =>
          house.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          house.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((house) => house.type === selectedType);
    }

    // Status filter
    switch (filter) {
      case "unread":
        filtered = filtered.filter((house) => house.unreadCount > 0);
        break;
      case "favorites":
        filtered = filtered.filter((house) => house.isFavorite);
        break;
      default:
        break;
    }

    setFilteredHouses(filtered);
  }, [searchQuery, filter, selectedType, houses]);

  const toggleFavorite = (houseId: string) => {
    setHouses((prev) =>
      prev.map((house) =>
        house.id === houseId
          ? { ...house, isFavorite: !house.isFavorite }
          : house
      )
    );
  };

  const handleCreateHouse = () => {
    // Add create house group logic here
    console.log("Create house group clicked");
  };

  const getHouseIcon = (type: House["type"]) => {
    switch (type) {
      case "apartment":
        return <Filter size={24} />;
      case "house":
        return <Home size={24} />;
      case "condo":
        return <Building size={24} />;
      case "townhouse":
        return <Building2 size={24} />;
      default:
        return <Home size={24} />;
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
            <h1 className="text-2xl md:text-3xl font-bold">House Groups</h1>
            <button
              onClick={handleCreateHouse}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
            >
              <Plus size={20} />
              <span>Create House Group</span>
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search house groups..."
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
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === filterOption
                          ? "bg-primary text-textLight"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Property Type Filter */}
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {["all", "apartment", "house", "condo", "townhouse"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedType === type
                        ? "bg-primary text-textLight"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Houses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHouses.map((house) => {
              // Generate blockies icon for house if no icon is available
              const houseIcon = house.icon
                ? house.icon
                : blockies
                    .create({
                      seed: house.id,
                      size: 8,
                      scale: 4,
                    })
                    .toDataURL();

              return (
                <Link
                  href={`/house/details?id=${house.id}`}
                  key={house.id}
                  className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:border-primary transition-all duration-200 cursor-pointer group block"
                >
                  <div className="flex items-start gap-4">
                    {/* House Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {house.icon ? (
                        <span className="text-2xl">{house.icon}</span>
                      ) : (
                        <div className="text-primary">
                          {getHouseIcon(house.type)}
                        </div>
                      )}
                    </div>

                    {/* House Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {house.title}
                          </h3>
                          <p className="text-sm text-textDark/60 dark:text-textLight/60">
                            {house.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {house.price && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full">
                              <span className="text-xs font-medium text-accent">
                                {house.price.amount} {house.price.chain} /
                                {house.price.period}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(house.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              house.isFavorite
                                ? "text-accent hover:bg-accent/10"
                                : "text-textDark/60 hover:bg-primary/10"
                            }`}
                          >
                            {house.isFavorite ? (
                              <Star size={20} />
                            ) : (
                              <StarOff size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-textDark/60 dark:text-textLight/60">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{house.members} members</span>
                        </div>
                        {house.unreadCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare size={16} />
                            <span>{house.unreadCount} unread</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* No Results Message */}
          {filteredHouses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-textDark/60 dark:text-textLight/60">
                No house groups found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
