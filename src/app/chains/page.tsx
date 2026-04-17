"use client";

import { truncateAddress } from "@/lib/utils";

const mockChains = [
  {
    name: "Berachain",
    chainId: 80094,
    contract: "0xNodeSale0000000000000000000000000000bera",
    tokens: ["USDT", "USDC"],
    status: "active" as const,
  },
  {
    name: "Arbitrum",
    chainId: 42161,
    contract: "0xNodeSale0000000000000000000000000000arbi",
    tokens: ["USDT", "USDC", "DAI"],
    status: "active" as const,
  },
  {
    name: "Ethereum",
    chainId: 1,
    contract: "0xNodeSale000000000000000000000000000eth01",
    tokens: ["USDT", "USDC"],
    status: "planned" as const,
  },
  {
    name: "BNB Chain",
    chainId: 56,
    contract: "0xNodeSale0000000000000000000000000000bnbc",
    tokens: ["USDT", "BUSD"],
    status: "planned" as const,
  },
];

const statusStyle = {
  active: { label: "运行中", className: "bg-green-900/50 text-green-400" },
  planned: { label: "计划中", className: "bg-gray-700 text-gray-400" },
  paused: { label: "已暂停", className: "bg-yellow-900/50 text-yellow-400" },
};

export default function ChainsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">多链管理</h2>
      <p className="text-sm text-gray-500">管理各链上的 NodeSale 合约部署</p>

      <div className="space-y-3">
        {mockChains.map((chain) => {
          const st = statusStyle[chain.status];
          return (
            <div key={chain.chainId} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-200">{chain.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.className}`}>
                  {st.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div className="text-gray-500">Chain ID: <span className="text-gray-300">{chain.chainId}</span></div>
                <div className="text-gray-500">合约: <span className="font-mono text-blue-400">{truncateAddress(chain.contract, 6)}</span></div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {chain.tokens.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{t}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
