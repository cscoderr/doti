import { useCallback, useEffect, useState } from "react";
import type { Hex } from "viem";
import { useAccount, useConnect, usePublicClient, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/app/providers";
import { generateRandomNonce } from "@/utils";

export function ConnectAndSIWE() {
  const { connect } = useConnect({
    mutation: {
      onSuccess: (data) => {
        const address = data.accounts[0];
        const chainId = data.chainId;
        const m = new SiweMessage({
          domain: document.location.host,
          address,
          chainId,
          uri: document.location.origin,
          version: "1",
          statement: "Sign in to Doti to access your account",
          nonce: generateRandomNonce(),
        });
        setMessage(m);
        signMessage({ message: m.prepareMessage() });
      },
    },
  });
  const account = useAccount();
  const client = usePublicClient();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const { signMessage } = useSignMessage({
    mutation: { onSuccess: (sig) => setSignature(sig) },
  });
  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);

  const [valid, setValid] = useState<boolean | undefined>(undefined);

  const checkValid = useCallback(async () => {
    if (!signature || !account.address || !client || !message) return;

    client
      .verifyMessage({
        address: account.address,
        message: message.prepareMessage(),
        signature,
      })
      .then((v) => setValid(v));
  }, [signature, account]);

  useEffect(() => {
    checkValid();
  }, [signature, account]);

  useEffect(() => {});

  return (
    <div>
      <button
        onClick={() => connect({ connector: cbWalletConnector })}
        className="w-full bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-opacity-90 transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <span>Connect + SIWE</span>
      </button>
      <p>{}</p>
      {valid != undefined && <p> Is valid: {valid.toString()} </p>}
    </div>
  );
}
