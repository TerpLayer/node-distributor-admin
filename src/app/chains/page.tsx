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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-3 px-3">链名称</th>
              <th className="text-left py-3 px-3">Chain ID</th>
              <th className="text-left py-3 px-3">合约地址</th>
              <th className="text-left py-3 px-3">支付代币</th>
              <th className="text-left py-3 px-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {mockChains.map((chain) => {
              const st = statusStyle[chain.status];
              return (
                <tr key={chain.chainId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 px-3 font-medium">{chain.name}</td>
                  <td className="py-3 px-3 text-gray-400">{chain.chainId}</td>
                  <td className="py-3 px-3 font-mono text-blue-400">
                    {truncateAddress(chain.contract, 6)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1.5">
                      {chain.tokens.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${st.className}`}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
