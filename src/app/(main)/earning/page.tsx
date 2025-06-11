"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SideBar from "@/components/SideBar";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  Coins,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "earning";
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
  source?: string;
  destination?: string;
  hash?: string;
  token?: {
    symbol: string;
    chain: string;
  };
}

interface EarningSource {
  name: string;
  amount: number;
  percentage: number;
  token?: {
    symbol: string;
    chain: string;
  };
}

export default function Earning() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalBalance, setTotalBalance] = useState(1250.75);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<"coinbase" | "base">(
    "base"
  );
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earningSources, setEarningSources] = useState<EarningSource[]>([]);
  const [ethPrice, setEthPrice] = useState<number>(0);

  // Format number with commas and 2 decimal places
  const formatNumber = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Handle empty input
    if (!numericValue) return "";

    // Split by decimal point
    const parts = numericValue.split(".");

    // Format the whole number part with commas
    const wholeNumber = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Handle decimal part
    if (parts.length > 1) {
      // Limit to 2 decimal places
      const decimal = parts[1].slice(0, 2);
      return `${wholeNumber}.${decimal}`;
    }

    return wholeNumber;
  };

  // Handle input change with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatNumber(e.target.value);
    setWithdrawalAmount(formattedValue);
  };

  // Parse formatted number back to float
  const parseFormattedNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    };
    fetchEthPrice();
  }, []);

  // Mock data for transactions
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "earning",
        amount: 250.5,
        status: "completed",
        timestamp: new Date(Date.now() - 3600000),
        source: "Agent Commissions",
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
      {
        id: "2",
        type: "withdrawal",
        amount: -100.0,
        status: "completed",
        timestamp: new Date(Date.now() - 86400000),
        destination: "Base Wallet",
        hash: "0x123...abc",
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
      {
        id: "3",
        type: "earning",
        amount: 175.25,
        status: "completed",
        timestamp: new Date(Date.now() - 172800000),
        source: "Group Revenue",
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
    ];
    setTransactions(mockTransactions);

    const mockEarningSources: EarningSource[] = [
      {
        name: "Agent Commissions",
        amount: 750.5,
        percentage: 60,
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
      {
        name: "Group Revenue",
        amount: 375.25,
        percentage: 30,
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
      {
        name: "Referral Bonuses",
        amount: 125.0,
        percentage: 10,
        token: {
          symbol: "USDC",
          chain: "Base",
        },
      },
    ];
    setEarningSources(mockEarningSources);
  }, []);

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) return;

    const amount = parseFloat(withdrawalAmount);
    if (amount > totalBalance) {
      alert("Insufficient balance");
      return;
    }

    // Mock withdrawal transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: "withdrawal",
      amount: -amount,
      status: "pending",
      timestamp: new Date(),
      destination:
        selectedWallet === "coinbase" ? "Coinbase Wallet" : "Base Wallet",
      token: {
        symbol: "USDC",
        chain: "Base",
      },
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    setTotalBalance((prev) => prev - amount);
    setWithdrawalAmount("");
    setShowWithdrawalForm(false);

    // Simulate transaction completion
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.id === newTransaction.id ? { ...tx, status: "completed" } : tx
        )
      );
    }, 2000);
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
            <h1 className="text-2xl md:text-3xl font-bold">Earnings</h1>
            <button
              onClick={() => setShowWithdrawalForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors"
            >
              <ArrowUpRight size={20} />
              <span>Withdraw</span>
            </button>
          </div>

          {/* Balance Card */}
          <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-textDark/60 dark:text-textLight/60">
                  Total Balance
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-3xl font-bold">
                    {totalBalance.toFixed(2)} USDC
                  </h2>
                  <span className="text-sm text-textDark/60 dark:text-textLight/60">
                    on Base
                  </span>
                </div>
                {ethPrice > 0 && (
                  <p className="text-sm text-textDark/60 dark:text-textLight/60 mt-1">
                    ≈ {(totalBalance / ethPrice).toFixed(6)} ETH
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Coins size={24} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Earnings Breakdown</h3>
              <div className="space-y-4">
                {earningSources.map((source) => (
                  <div
                    key={source.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${
                            (earningSources.indexOf(source) * 120) % 360
                          }, 70%, 50%)`,
                        }}
                      />
                      <span>{source.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {source.amount.toFixed(2)} USDC
                      </p>
                      <p className="text-sm text-textDark/60 dark:text-textLight/60">
                        {source.percentage}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-background border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "earning"
                            ? "bg-primary/10 text-primary"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {tx.type === "earning" ? (
                          <ArrowDownLeft size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type === "earning" ? "Earning" : "Withdrawal"}
                        </p>
                        <p className="text-sm text-textDark/60 dark:text-textLight/60">
                          {tx.source || tx.destination}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          tx.type === "earning" ? "text-primary" : "text-error"
                        }`}
                      >
                        {tx.type === "earning" ? "+" : "-"}
                        {Math.abs(tx.amount).toFixed(2)} USDC
                      </p>
                      <div className="flex items-center gap-1 text-sm text-textDark/60 dark:text-textLight/60">
                        <Clock size={14} />
                        <span>{tx.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Withdrawal Form Modal */}
          {showWithdrawalForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[var(--background)] border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold mb-4 text-[var(--foreground)]">
                  Withdraw Funds
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="12" r="12" fill="#2775CA" />
                          <path
                            d="M12.5 6.5H11.5V17.5H12.5V6.5Z"
                            fill="white"
                          />
                          <path d="M15.5 9.5H8.5V10.5H15.5V9.5Z" fill="white" />
                          <path
                            d="M15.5 13.5H8.5V14.5H15.5V13.5Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={withdrawalAmount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className="w-full p-3 pl-12 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    {ethPrice > 0 && withdrawalAmount && (
                      <p className="text-sm text-textDark/60 dark:text-textLight/60 mt-2">
                        ≈{" "}
                        {(
                          parseFormattedNumber(withdrawalAmount) / ethPrice
                        ).toFixed(6)}{" "}
                        ETH
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Withdraw to
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setSelectedWallet("coinbase")}
                        className={`p-4 rounded-lg border ${
                          selectedWallet === "coinbase"
                            ? "border-primary bg-primary/10"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                              fill="#0052FF"
                            />
                            <path
                              d="M12.0002 3.75L17.2502 6.75V17.25L12.0002 20.25L6.75024 17.25V6.75L12.0002 3.75Z"
                              fill="white"
                            />
                          </svg>
                          <span>Coinbase Wallet</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedWallet("base")}
                        className={`p-4 rounded-lg border ${
                          selectedWallet === "base"
                            ? "border-primary bg-primary/10"
                            : "border-neutral-200 dark:border-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                              fill="#0052FF"
                            />
                            <path
                              d="M12 6L18 9V15L12 18L6 15V9L12 6Z"
                              fill="white"
                            />
                          </svg>
                          <span>Base Wallet</span>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-textDark/60 dark:text-textLight/60">
                    <AlertCircle size={16} />
                    <p>
                      Minimum withdrawal amount is 10 USDC. Processing time may
                      take up to 24 hours.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowWithdrawalForm(false)}
                      className="flex-1 px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleWithdrawal}
                      disabled={
                        !withdrawalAmount ||
                        parseFloat(withdrawalAmount) <= 0 ||
                        parseFloat(withdrawalAmount) > totalBalance ||
                        parseFloat(withdrawalAmount) < 10
                      }
                      className="flex-1 px-4 py-2 bg-primary text-textLight rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
