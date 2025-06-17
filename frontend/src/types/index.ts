import { Address, Hex } from "viem";

export interface DotiAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
  ownerId: string;
  isPublic: boolean;
  createdAt: string;
  xmtpAddress?: string;
  walletKey: string;
  isDownloaded?: boolean;
}



export type SpendPermission = {
  account: Address; // address
  spender: Address; // address
  token: Address; // address
  allowance: bigint; // uint160
  period: number; // uint48
  start: number; // uint48
  end: number; // uint48
  salt: bigint; // uint256
  extraData: Hex | null; // bytes
};
