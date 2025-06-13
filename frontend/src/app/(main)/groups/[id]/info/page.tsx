"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Shield,
  Settings,
  Star,
  StarOff,
  UserPlus,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useParams } from "next/navigation";
import blockies from "blockies-ts";

interface GroupMember {
  id: string;
  name: string;
  role: "admin" | "moderator" | "member";
  joinedAt: Date;
  avatar?: string;
  isOnline?: boolean;
}

interface GroupRule {
  id: string;
  title: string;
  description: string;
}

interface Group {
  id: string;
  title: string;
  description: string;
  purpose: string;
  createdAt: Date;
  members: GroupMember[];
  rules: GroupRule[];
  isPrivate: boolean;
  isFavorite: boolean;
  totalMessages: number;
  activeMembers: number;
  price?: {
    amount: number;
    period: "one-time" | "weekly" | "monthly" | "yearly";
    chain: string;
  };
  icon?: string;
}

export default function GroupInfo() {
  const [group, setGroup] = useState<Group | null>(null);
  const { id } = useParams();
  const groupId = id as string;

  useEffect(() => {
    if (groupId) {
      // Generate dummy data for demonstration
      const dummyGroup: Group = {
        id: groupId,
        title: `Group ${groupId.split("-")[1]}`,
        description:
          "A community focused on discussing and sharing knowledge about AI and technology.",
        purpose: "Knowledge sharing and community building",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        members: Array.from({ length: 50 }, (_, index) => ({
          id: `member-${index}`,
          name: `Member ${index + 1}`,
          role: index === 0 ? "admin" : index < 5 ? "moderator" : "member",
          joinedAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ),
          avatar: blockies
            .create({
              seed: `member-${index}`,
              size: 8,
              scale: 4,
            })
            .toDataURL(),
          isOnline: Math.random() > 0.7,
        })),
        rules: [
          {
            id: "1",
            title: "Be Respectful",
            description: "Treat all members with respect and kindness.",
          },
          {
            id: "2",
            title: "No Spam",
            description: "Do not post spam or irrelevant content.",
          },
          {
            id: "3",
            title: "Stay On Topic",
            description: "Keep discussions relevant to the group's purpose.",
          },
        ],
        isPrivate: true,
        isFavorite: Math.random() > 0.7,
        totalMessages: Math.floor(Math.random() * 10000) + 1000,
        activeMembers: Math.floor(Math.random() * 30) + 20,
        price: {
          amount: 29.99,
          period: "monthly",
          chain: "USDC on Base",
        },
      };
      setGroup(dummyGroup);
    }
  }, [groupId]);

  const toggleFavorite = () => {
    if (group) {
      setGroup({ ...group, isFavorite: !group.isFavorite });
    }
  };

  // Generate blockies icon for group if no icon is available
  const groupIcon = group?.icon
    ? group.icon
    : group
    ? blockies
        .create({
          seed: group.id,
          size: 8,
          scale: 4,
        })
        .toDataURL()
    : undefined;

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-textDark/60 dark:text-textLight/60">
            The group you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Group Header */}
      <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
            {group.icon ? (
              <span className="text-4xl">{group.icon}</span>
            ) : (
              <img
                src={groupIcon}
                alt={group.title}
                className="w-20 h-20 rounded-lg"
              />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{group.title}</h1>
                <p className="text-textDark/60 dark:text-textLight/60 mb-4">
                  {group.description}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <span>{group.members.length} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-primary" />
                    <span>{group.totalMessages} messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary" />
                    <span>Created {group.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Group Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Members Section */}
        <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Members</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-textLight rounded-lg hover:bg-accent transition-colors">
              <UserPlus size={16} />
              Invite
            </button>
          </div>
          <div className="space-y-4">
            {group.members.slice(0, 10).map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-textDark/60 dark:text-textLight/60">
                  Joined {member.joinedAt.toLocaleDateString()}
                </span>
              </div>
            ))}
            {group.members.length > 10 && (
              <button className="w-full py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors">
                View all {group.members.length} members
              </button>
            )}
          </div>
        </div>

        {/* Rules Section */}
        <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Group Rules</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-textLight rounded-lg hover:bg-accent transition-colors">
              <Settings size={16} />
              Edit Rules
            </button>
          </div>
          <div className="space-y-4">
            {group.rules.map((rule) => (
              <div key={rule.id} className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-1">{rule.title}</h3>
                <p className="text-sm text-textDark/60 dark:text-textLight/60">
                  {rule.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Group Settings */}
        <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Group Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    {group.isPrivate ? "Private Group" : "Public Group"}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm bg-primary text-textLight rounded-lg hover:bg-accent transition-colors">
                Change
              </button>
            </div>
            {group.price && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign size={20} className="text-primary" />
                  <div>
                    <p className="font-medium">Subscription</p>
                    <p className="text-sm text-textDark/60 dark:text-textLight/60">
                      {group.price.amount} {group.price.chain} /{" "}
                      {group.price.period}
                    </p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm bg-primary text-textLight rounded-lg hover:bg-accent transition-colors">
                  Manage
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Group Activity */}
        <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Group Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Active Members</p>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    {group.activeMembers} members active in the last 24 hours
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Total Messages</p>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    {group.totalMessages} messages sent
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-primary" />
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-textDark/60 dark:text-textLight/60">
                    {group.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
