"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import CreateAgentModal from "@/components/CreateAgentModal";
import { useRouter } from "next/navigation";
import { dotiCategories } from "@/utils/categories";
import { DotiAgent } from "@/types";
import CircularProgressBar from "@/components/CircularProgressBar";

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  rating: number;
  users: number;
  price: {
    amount: number;
    period: string;
    chain: string;
  };
  icon: string;
  categories: string[];
  isDownloaded?: boolean;
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [agents, setAgents] = useState<DotiAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<DotiAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [installationFilter, setInstallationFilter] = useState<
    "all" | "installed" | "not-installed"
  >("all");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<
    | "a-z"
    | "z-a"
    | "highest-rating"
    | "lowest-rating"
    | "highest-price"
    | "lowest-price"
  >("a-z");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 1000,
  });
  const router = useRouter();

  // Filter agents based on search query and selected categories
  // useEffect(() => {
  //   let filtered = agents;

  //   // Search filter
  //   if (searchQuery) {
  //     filtered = filtered.filter(
  //       (agent) =>
  //         agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         agent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         agent.categories.some((cat) =>
  //           cat.toLowerCase().includes(searchQuery.toLowerCase())
  //         )
  //     );
  //   }

  //   // Category filter
  //   if (selectedCategories.length > 0) {
  //     filtered = filtered.filter((agent) =>
  //       agent.categories.some((cat) => selectedCategories.includes(cat))
  //     );
  //   }

  //   // Installation filter
  //   if (installationFilter !== "all") {
  //     filtered = filtered.filter((agent) =>
  //       installationFilter === "installed"
  //         ? agent.isDownloaded
  //         : !agent.isDownloaded
  //     );
  //   }

  //   // Rating filter
  //   if (ratingFilter !== null) {
  //     filtered = filtered.filter((agent) => agent.rating >= ratingFilter);
  //   }

  //   // Price range filter
  //   filtered = filtered.filter(
  //     (agent) =>
  //       agent.price.amount >= priceRange.min &&
  //       agent.price.amount <= priceRange.max
  //   );

  //   // Sorting
  //   filtered.sort((a, b) => {
  //     switch (sortOption) {
  //       case "a-z":
  //         return a.name.localeCompare(b.name);
  //       case "z-a":
  //         return b.name.localeCompare(a.name);
  //       case "highest-rating":
  //         return b.rating - a.rating;
  //       case "lowest-rating":
  //         return a.rating - b.rating;
  //       case "highest-price":
  //         return b.price.amount - a.price.amount;
  //       case "lowest-price":
  //         return a.price.amount - b.price.amount;
  //       default:
  //         return 0;
  //     }
  //   });

  //   setFilteredAgents(filtered);
  // }, [
  //   searchQuery,
  //   selectedCategories,
  //   agents,
  //   installationFilter,
  //   ratingFilter,
  //   sortOption,
  //   priceRange,
  // ]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleDownload = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId
          ? { ...agent, isDownloaded: !agent.isDownloaded }
          : agent
      )
    );
  };

  const getAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/agent", {
        method: "GET",
        headers: {
          "content-type": "application/json",
        },
      });
      if (response.ok) {
        const json = await response.json();
        console.log("Agents data is here", json.data);
        setAgents(json.data);
        setFilteredAgents(json.data);
        return;
      }
      console.log("Unable to create agent");
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <CircularProgressBar />;
  }

  return (
    <>
      <div className="p-4 md:p-6 max-w-[2000px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Doti Apps</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
          >
            <Plus size={20} />
            <span>Create Doti App</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDark/60"
                size={20}
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {(selectedCategories.length > 0 ||
                installationFilter !== "all" ||
                ratingFilter !== null) && (
                <span className="px-2 py-0.5 bg-primary text-textLight rounded-full text-xs">
                  {selectedCategories.length +
                    (installationFilter !== "all" ? 1 : 0) +
                    (ratingFilter !== null ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-6">
              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Categories</h3>
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="text-sm text-primary hover:text-accent"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {dotiCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategories.includes(category)
                          ? "bg-primary text-textLight"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Installation Status */}
              <div>
                <h3 className="font-semibold mb-4">Installation Status</h3>
                <div className="flex gap-2">
                  {(["all", "installed", "not-installed"] as const).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setInstallationFilter(status)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          installationFilter === status
                            ? "bg-primary text-textLight"
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status === "installed"
                          ? "Installed"
                          : "Not Installed"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="font-semibold mb-4">Minimum Rating</h3>
                <div className="flex gap-2">
                  {[null, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating ?? "all"}
                      onClick={() => setRatingFilter(rating)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        ratingFilter === rating
                          ? "bg-primary text-textLight"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {rating ? `${rating}+` : "All"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: Number(e.target.value),
                      }))
                    }
                    className="w-24 px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background"
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: Number(e.target.value),
                      }))
                    }
                    className="w-24 px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="font-semibold mb-4">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "a-z", label: "A-Z" },
                    { value: "z-a", label: "Z-A" },
                    { value: "highest-rating", label: "Highest Rating" },
                    { value: "lowest-rating", label: "Lowest Rating" },
                    { value: "highest-price", label: "Highest Price" },
                    { value: "lowest-price", label: "Lowest Price" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setSortOption(option.value as typeof sortOption)
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        sortOption === option.value
                          ? "bg-primary text-textLight"
                          : "bg-primary/10 text-primary hover:bg-primary/20"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {agents &&
            agents.map((agent, index) => (
              <AgentCard
                key={index}
                agent={agent}
                onClick={() => router.push(`/marketplace/${agent.id}`)}
                onDownload={handleDownload}
              />
            ))}
        </div>

        {/* No Results Message */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-textDark/60 dark:text-textLight/60">
              No agents found matching your criteria.
            </p>
          </div>
        )}
      </div>
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
