import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatUSDC(amount: bigint | string | number, decimals = 6): string {
  const n = typeof amount === "bigint" ? amount : BigInt(String(amount));
  const d = 10n ** BigInt(decimals);
  const whole = n / d;
  const frac = n % d;
  return `${whole}.${frac.toString().padStart(decimals, "0").slice(0, 2)}`;
}

export function explorerTxUrl(txHash: string): string {
  const base = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com";
  return `${base}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  const base = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.berascan.com";
  return `${base}/address/${address}`;
}
