import { useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useSignTypedData,
  useSwitchChain,
} from "wagmi";
import { Address, Hex, parseUnits } from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { base } from "wagmi/chains";
import { spendPermissionManagerAddress } from "@/lib/abis/SpendPermissionManager";
import { SubscribeResponse } from "@/types";

export const useSubscribe = ({ agentId }: { agentId: string }) => {
  const [loading, setLoading] = useState(false);

  const { signTypedDataAsync } = useSignTypedData();
  const account = useAccount();
  const { connectAsync } = useConnect();
  const connectors = useConnectors();
  const { switchChainAsync } = useSwitchChain();

  const {
    data: subscriptions,
    refetch: refetchSubscriptions,
    isLoading: isSubscriptionsLoading,
    isPending: isSubscriptionsPending,
  } = useQuery({
    queryKey: ["subscribe", account.address, agentId],
    queryFn: getSubscriptions,
    enabled: !!account.address,
  });

  const { mutate: subscribe } = useMutation({
    mutationFn: handleSubmit,
    onSuccess: () => {
      // Invalidate and refetch
      refetchSubscriptions();
    },
  });

  const isValidSubscription = useMemo(() => {
    return subscriptions?.data.filter(
      (subscription) => subscription.status == 1
    );
  }, [subscriptions]);

  async function handleSubmit({
    allowance,
    spenderAddress,
  }: {
    allowance: string;
    spenderAddress: Address;
  }) {
    setLoading(true);
    let accountAddress = account?.address;
    if (!accountAddress) {
      try {
        const requestAccounts = await connectAsync({
          connector: connectors[0],
        });
        accountAddress = requestAccounts.accounts[0];
      } catch {
        return;
      }
    }
    await switchChainAsync({ chainId: base.id as 1 | 8453 | 84532 });
    const spendPermission = {
      account: accountAddress, // User wallet address
      spender: "0x5Dba4C1Db55c64bBB0260B9F48fE7009A07AaD71" as `0x${string}`, // Spender smart contract wallet address
      //   token: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as Address, // ETH (https://eips.ethereum.org/EIPS/eip-7528)
      token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
      allowance: parseUnits(allowance, 6),
      //   parseUnits("1", 18),
      period: 86400 * 15, // seconds in a day
      start: Math.ceil(Date.now() / 1000), // unix timestamp
      end: Math.ceil(Date.now() / 1000) + 7 * 68400, // 281474976710655, // max uint48
      salt: BigInt(0),
      extraData: "0x" as Hex,
    };

    try {
      const signature = await signTypedDataAsync({
        domain: {
          name: "Spend Permission Manager",
          version: "1",
          chainId: base.id,
          verifyingContract: spendPermissionManagerAddress,
        },
        types: {
          SpendPermission: [
            { name: "account", type: "address" },
            { name: "spender", type: "address" },
            { name: "token", type: "address" },
            { name: "allowance", type: "uint160" },
            { name: "period", type: "uint48" },
            { name: "start", type: "uint48" },
            { name: "end", type: "uint48" },
            { name: "salt", type: "uint256" },
            { name: "extraData", type: "bytes" },
          ],
        },
        primaryType: "SpendPermission",
        message: spendPermission,
      });
      await switchChainAsync({ chainId: 1 });
      // setSpendPermission(spendPermission);
      // setSignature(signature);

      const replacer = (key: string, value: any) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            spendPermission,
            signature,
            agent: agentId,
          },
          replacer
        ),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.error(e);
      throw new Error("Network response was not ok");
    } finally {
      setLoading(false);
    }
  }

  async function getSubscriptions(): Promise<SubscribeResponse> {
    try {
      const response = await fetch(
        `/api/subscribe?account=${account.address}&agent=${agentId}`,
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Unable to fetch subscriptions");
      }
      const data = await response.json();
      console.log(data);
      return data;
    } catch (e) {
      throw new Error("Unable to fetch subscriptions");
    }
  }
  return {
    subscriptions,
    subscribe,
    loading,
    isValidSubscription,
    refetchSubscriptions,
    isSubscriptionsPending,
    isSubscriptionsLoading,
  };
};
