"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, PlusCircle } from "lucide-react";
import Link from "next/link";
import { DotiAgent } from "@/types";
import CircularProgressBar from "@/components/CircularProgressBar";
import BlockiesIcon from "@/components/BlockiesIcon";
import { Address } from "viem";
import { useSubscribe } from "@/hooks/useSubscribe";
import { useMemo } from "react";
import { useAccount } from "wagmi";

function AgentDetails({ agent }: { agent: DotiAgent }) {
  const router = useRouter();
  const account = useAccount();

  const {
    subscribe,
    isValidSubscription,
    isSubscriptionsPending,
    isSubscriptionsLoading,
    loading,
  } = useSubscribe({
    agentId: agent.id,
  });
  const isSubscribed = useMemo(() => {
    return (
      isValidSubscription?.some(
        (value) =>
          value.spendPermission.account.toLocaleLowerCase() ===
            account.address?.toLocaleLowerCase() &&
          value.spendPermission.agent === agent.id
      ) || false
    );
  }, [agent, isValidSubscription]);

  const handleChat = () => {
    if (isSubscribed || agent.pricingModel === "free") {
      router.push(`${agent.id}/chat`);
    } else {
      if (!agent) return;
      subscribe({
        allowance: String(agent.price),
        spenderAddress: agent.ownerId as Address,
        pricingModel: agent.pricingModel,
      });
    }
  };
  return (
    <div className="min-h-screen bg-background/50">
      <div className="p-4 md:p-8 max-w-[2000px] mx-auto">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Marketplace</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Agent Header */}
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <BlockiesIcon address={`0x${agent.id}`} size={10} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {agent.name}
                      </h1>
                      <div className="flex items-center gap-2 text-textDark/60 dark:text-textLight/60">
                        <span className="px-3 py-1 bg-primary/10 rounded-full text-sm">
                          {agent.pricingModel === "free" &&
                            `Agent ID: ${agent.id}`}
                          {agent.pricingModel !== "free" &&
                            `${agent.price} USDC / ${agent.pricingModel}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Description
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-textDark/80 dark:text-textLight/80 leading-relaxed">
                  {agent.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm sticky top-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Actions
              </h2>
              <div className="space-y-6">
                <div>
                  {(isSubscriptionsLoading || isSubscriptionsPending) && (
                    <CircularProgressBar />
                  )}
                  {!isSubscriptionsPending && (
                    <button
                      onClick={handleChat}
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                        isSubscribed || agent.pricingModel === "free"
                          ? "bg-accent/10 text-accent hover:bg-accent/20"
                          : "bg-primary text-textLight hover:bg-accent"
                      }`}
                    >
                      {isSubscribed || agent.pricingModel === "free" ? (
                        <>
                          <MessageCircle size={24} />
                          <span className="font-medium">Chat with Agent</span>
                        </>
                      ) : loading ? (
                        <>
                          <span className="font-medium">Loading....</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle size={24} />
                          <span className="font-medium">Subscribe</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Additional action buttons can be added here */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="text-sm text-textDark/60 dark:text-textLight/60">
                    <p className="mb-2">Agent Status:</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentDetails;
