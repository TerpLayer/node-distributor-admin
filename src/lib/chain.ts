import { createPublicClient, http, defineChain, type Chain } from "viem";

// --- Chain Definitions ---

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

export const berachainMainnet = defineChain({
  id: 80094,
  name: "Berachain",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: "https://berascan.com" },
  },
});

export const arbitrumOne = defineChain({
  id: 42161,
  name: "Arbitrum One",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://arb1.arbitrum.io/rpc"] },
  },
  blockExplorers: {
    default: { name: "Arbiscan", url: "https://arbiscan.io" },
  },
});

export const ethereumMainnet = defineChain({
  id: 1,
  name: "Ethereum",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://eth.llamarpc.com"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
});

// --- Chain Config ---

interface ChainConfig {
  chain: Chain;
  contractAddress: `0x${string}`;
  l1ContractAddress?: `0x${string}`;
  explorerUrl: string;
  paymentToken: `0x${string}`;
}

const chainConfigs: Record<number, ChainConfig> = {
  80069: {
    chain: bepoliaTestnet,
    contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    l1ContractAddress: (process.env.NEXT_PUBLIC_L1_CONTRACT_ADDRESS || undefined) as `0x${string}` | undefined,
    explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com",
    paymentToken: (process.env.NEXT_PUBLIC_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  80094: {
    chain: berachainMainnet,
    contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    l1ContractAddress: (process.env.NEXT_PUBLIC_L1_CONTRACT_ADDRESS || undefined) as `0x${string}` | undefined,
    explorerUrl: "https://berascan.com",
    paymentToken: (process.env.NEXT_PUBLIC_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  42161: {
    chain: arbitrumOne,
    contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    l1ContractAddress: (process.env.NEXT_PUBLIC_L1_CONTRACT_ADDRESS || undefined) as `0x${string}` | undefined,
    explorerUrl: "https://arbiscan.io",
    paymentToken: (process.env.NEXT_PUBLIC_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  1: {
    chain: ethereumMainnet,
    contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x") as `0x${string}`,
    l1ContractAddress: (process.env.NEXT_PUBLIC_L1_CONTRACT_ADDRESS || undefined) as `0x${string}` | undefined,
    explorerUrl: "https://etherscan.io",
    paymentToken: (process.env.NEXT_PUBLIC_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
};

/**
 * Get chain configuration by chain ID. Defaults to Bepolia testnet.
 */
export function getChainConfig(chainId?: number): ChainConfig {
  const id = chainId ?? Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 80069);
  return chainConfigs[id] ?? chainConfigs[80069];
}

// --- Default exports (backward compatible) ---

export const publicClient = createPublicClient({
  chain: bepoliaTestnet,
  transport: http(),
});

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
export const L1_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_L1_CONTRACT_ADDRESS as `0x${string}`;
export const PAYMENT_TOKEN = process.env.NEXT_PUBLIC_PAYMENT_TOKEN as `0x${string}`;
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com";

/**
 * Create a public client for L1 contract reads.
 * Uses L1-specific RPC if configured, otherwise falls back to default.
 */
export const l1PublicClient = createPublicClient({
  chain: bepoliaTestnet,
  transport: http(process.env.NEXT_PUBLIC_L1_RPC_URL || undefined),
});
