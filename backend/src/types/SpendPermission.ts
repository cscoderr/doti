import { Address, Hex } from "viem";

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

export type SpendPermissionResponse = {
  account: string; // address
  spender: string; // address
  token: string; // address
  allowance: string; // uint160
  period: number; // uint48
  start: Date; // uint48
  end: Date; // uint48
  salt: string; // uint256
  extraData: string | null; // bytes
  status: number;
};

export type SubscribeResponse = {
  data: {
    spendPermission: SpendPermissionResponse;
    status: number;
    error: Error | null;
  }[];
  status: boolean;
  message?: string;
};
