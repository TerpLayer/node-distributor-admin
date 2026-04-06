import { createPublicClient, http, defineChain } from "viem";

export const bepoliaTestnet = defineChain({
  id: 80069,
  name: "Berachain Bepolia",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_CHAIN_RPC || "https://bepolia.rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com" },
  },
});

export const publicClient = createPublicClient({
  chain: bepoliaTestnet,
  transport: http(),
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const PAYMENT_TOKEN = process.env.NEXT_PUBLIC_PAYMENT_TOKEN as `0x${string}`;
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com";
