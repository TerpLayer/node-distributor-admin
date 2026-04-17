import { createPublicClient, http, defineChain, type Chain } from "viem";

// --- Chain Definitions ---

export const bepoliaTestnet = defineChain({
  id: 80069,
  name: "Berachain Bepolia",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_BEPOLIA_RPC || "https://bepolia.rpc.berachain.com"] },
  },
  blockExplorers: {
    default: { name: "Berascan", url: "https://testnet.berascan.com" },
  },
});

export const berachainMainnet = defineChain({
  id: 80094,
  name: "Berachain",
  nativeCurrency: { name: "BERA", symbol: "BERA", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_BERACHAIN_RPC || "https://rpc.berachain.com"] },
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
    default: { http: [process.env.NEXT_PUBLIC_ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc"] },
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
    default: { http: [process.env.NEXT_PUBLIC_ETHEREUM_RPC || "https://eth.llamarpc.com"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
});

export const localhost = defineChain({
  id: 31337,
  name: "Localhost (Hardhat)",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_LOCALHOST_RPC || "http://127.0.0.1:8545"] },
  },
  blockExplorers: {
    default: { name: "Local", url: "http://localhost:8545" },
  },
});

// --- Chain Config ---

interface ChainConfig {
  chain: Chain;
  contractAddress: `0x${string}`;
  explorerUrl: string;
  paymentToken: `0x${string}`;
}

const chainConfigs: Record<number, ChainConfig> = {
  80069: {
    chain: bepoliaTestnet,
    contractAddress: (process.env.NEXT_PUBLIC_BEPOLIA_CONTRACT || "0x") as `0x${string}`,
    explorerUrl: "https://testnet.berascan.com",
    paymentToken: (process.env.NEXT_PUBLIC_BEPOLIA_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  80094: {
    chain: berachainMainnet,
    contractAddress: (process.env.NEXT_PUBLIC_BERACHAIN_CONTRACT || "0x") as `0x${string}`,
    explorerUrl: "https://berascan.com",
    paymentToken: (process.env.NEXT_PUBLIC_BERACHAIN_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  42161: {
    chain: arbitrumOne,
    contractAddress: (process.env.NEXT_PUBLIC_ARBITRUM_CONTRACT || "0x") as `0x${string}`,
    explorerUrl: "https://arbiscan.io",
    paymentToken: (process.env.NEXT_PUBLIC_ARBITRUM_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  1: {
    chain: ethereumMainnet,
    contractAddress: (process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT || "0x") as `0x${string}`,
    explorerUrl: "https://etherscan.io",
    paymentToken: (process.env.NEXT_PUBLIC_ETHEREUM_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
  31337: {
    chain: localhost,
    contractAddress: (process.env.NEXT_PUBLIC_LOCALHOST_CONTRACT || process.env.NEXT_PUBLIC_BEPOLIA_CONTRACT || "0x") as `0x${string}`,
    explorerUrl: "http://localhost:8545",
    paymentToken: (process.env.NEXT_PUBLIC_LOCALHOST_PAYMENT_TOKEN || process.env.NEXT_PUBLIC_BEPOLIA_PAYMENT_TOKEN || "0x") as `0x${string}`,
  },
};

/**
 * Get chain configuration by chain ID. Defaults to Berachain mainnet.
 */
export function getChainConfig(chainId?: number): ChainConfig {
  const id = chainId ?? Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 80094);
  return chainConfigs[id] ?? chainConfigs[80094];
}

/** Get all supported chain configs */
export function getAllChainConfigs() {
  return chainConfigs;
}

// --- Default exports (current active chain) ---

const activeConfig = getChainConfig();

export const publicClient = createPublicClient({
  chain: activeConfig.chain,
  transport: http(),
});

export const CONTRACT_ADDRESS = activeConfig.contractAddress;
export const PAYMENT_TOKEN = activeConfig.paymentToken;
export const EXPLORER_URL = activeConfig.explorerUrl;

/**
 * Create a public client for a specific chain.
 */
export function getPublicClient(chainId: number) {
  const config = getChainConfig(chainId);
  return createPublicClient({
    chain: config.chain,
    transport: http(),
  });
}
