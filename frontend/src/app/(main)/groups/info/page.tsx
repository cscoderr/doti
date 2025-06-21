"use client";
import { useState, useEffect } from "react";
import {
  Star,
  StarOff,
  Settings,
  DollarSign,
  Calendar,
  Shield,
  Search,
  UserPlus,
  Ban,
  Crown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import blockies from "blockies-ts";
import Image from "next/image";

interface GroupMember {
  id: string;
  name: string;
  role: "admin" | "member";
  avatar?: string;
  status: "online" | "offline" | "away";
  joinedAt: Date;
  lastSeen?: Date;
}

interface Group {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  members: GroupMember[];
  totalMembers: number;
  isPrivate: boolean;
  isFavorite: boolean;
  price?: {
    amount: number;
    period: "one-time" | "weekly" | "monthly" | "yearly";
    chain: string;
  };
  rules?: string[];
  icon?: string;
}

export default function GroupInfo() {
  const [group, setGroup] = useState<Group | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "members">("info");
  const searchParams = useSearchParams();
  const groupId = searchParams.get("id");

  useEffect(() => {
    if (groupId) {
      // Generate dummy group data
      const dummyGroup: Group = {
        id: groupId,
        title: `Group ${groupId.split("-")[1]}`,
        description:
          "A community for discussing AI, blockchain, and technology. Share ideas, ask questions, and connect with like-minded individuals.",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        createdBy: "0x1234...abcd",
        isPrivate: true,
        isFavorite: Math.random() > 0.7,
        price: {
          amount: 29.99,
          period: "monthly",
          chain: "USDC on Base",
        },
        rules: [
          "Be respectful to all members",
          "No spam or self-promotion",
          "Keep discussions relevant to the group&apos;s purpose",
          "No sharing of sensitive or personal information",
        ],
        members: Array.from({ length: 20 }, (_, index) => ({
          id: `member-${index}`,
          name: `Member ${index + 1}`,
          role: index === 0 ? "admin" : "member",
          avatar: blockies
            .create({
              seed: `member-${index}`,
              size: 8,
              scale: 4,
            })
            .toDataURL(),
          status: ["online", "offline", "away"][
            Math.floor(Math.random() * 3)
          ] as GroupMember["status"],
          joinedAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        })),
        totalMembers: 20,
      };
      setGroup(dummyGroup);
    }
  }, [groupId]);

  const toggleFavorite = () => {
    if (group) {
      setGroup({ ...group, isFavorite: !group.isFavorite });
    }
  };

  const filteredMembers = group?.members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-textDark/60 dark:text-textLight/60">
            The group you're looking for doesn't exist or you don't have access
            to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Group Header */}
      <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {group.icon ? (
                <span className="text-3xl">{group.icon}</span>
              ) : (
                <Image
                  src={blockies
                    .create({
                      seed: group.id,
                      size: 8,
                      scale: 4,
                    })
                    .toDataURL()}
                  width={16}
                  height={16}
                  alt={group.title}
                  className="w-16 h-16 rounded-full"
                />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{group.title}</h1>
              <p className="text-textDark/60 dark:text-textLight/60">
                {group.totalMembers} members
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                group.isFavorite
                  ? "text-accent hover:bg-accent/10"
                  : "text-textDark/60 hover:bg-primary/10"
              }`}
            >
              {group.isFavorite ? <Star size={24} /> : <StarOff size={24} />}
            </button>
            <button className="p-2 rounded-full text-textDark/60 hover:bg-primary/10 transition-colors">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "info"
              ? "bg-primary text-textLight"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          Group Info
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "members"
              ? "bg-primary text-textLight"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          Members
        </button>
      </div>

      {/* Content */}
      {activeTab === "info" ? (
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-textDark/80 dark:text-textLight/80">
              {group.description}
            </p>
          </div>

          {/* Group Details */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Group Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    Created
                  </p>
                  <p className="text-textDark dark:text-textLight">
                    {group.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-primary" />
                <div>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    Privacy
                  </p>
                  <p className="text-textDark dark:text-textLight">
                    {group.isPrivate ? "Private" : "Public"}
                  </p>
                </div>
              </div>
              {group.price && (
                <div className="flex items-center gap-3">
                  <DollarSign size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      Price
                    </p>
                    <p className="text-textDark dark:text-textLight">
                      {group.price.amount} {group.price.chain} /{" "}
                      {group.price.period}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group Rules */}
          {group.rules && (
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Group Rules</h2>
              <ul className="space-y-2">
                {group.rules.map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-textDark/80 dark:text-textLight/80"
                  >
                    <span className="text-primary">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search Members */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textDark/60"
              size={20}
            />
          </div>

          {/* Members List */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredMembers?.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src={member.avatar!}
                      width={10}
                      height={10}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                        member.status === "online"
                          ? "bg-green-500"
                          : member.status === "away"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {member.role === "admin" && (
                        <Crown size={16} className="text-accent" />
                      )}
                    </div>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      Joined{" "}
                      {member.joinedAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "admin" ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-accent/10 text-accent">
                      Admin
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-textDark/60 hover:text-primary transition-colors">
                        <UserPlus size={20} />
                      </button>
                      <button className="p-1.5 text-textDark/60 hover:text-error transition-colors">
                        <Ban size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
