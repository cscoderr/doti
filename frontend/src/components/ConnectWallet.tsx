import { useConnect } from "wagmi";
import { cbWalletConnector } from "@/app/providers";

export function ConnectWallet() {
  const { connect } = useConnect();

  return (
    <div>
      <button
        onClick={() => connect({ connector: cbWalletConnector })}
        className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <span>Connect Smart Wallet</span>
      </button>
    </div>
  );
}
