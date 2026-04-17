"use client";

import { truncateAddress } from "@/lib/utils";
import { getAllChainConfigs } from "@/lib/chain";

// PRD §10: 支持的支付链与币种
const chainMeta: Record<number, { name: string; tokens: string[] }> = {
  80069: { name: "Berachain Bepolia (测试网)", tokens: ["USDT0"] },
  80094: { name: "Berachain", tokens: ["USDT0"] },
  42161: { name: "Arbitrum", tokens: ["USDT", "USDC"] },
  1:     { name: "Ethereum", tokens: ["USDT", "USDC"] },
};

function getChainStatus(contractAddress: string): "active" | "planned" {
  return contractAddress && contractAddress !== "0x" ? "active" : "planned";
}

const statusStyle = {
  active: { label: "已部署", className: "bg-green-900/50 text-green-400" },
  planned: { label: "待部署", className: "bg-gray-700 text-gray-400" },
};

export default function ChainsPage() {
  const configs = getAllChainConfigs();

  const chains = Object.entries(configs).map(([chainIdStr, config]) => {
    const chainId = Number(chainIdStr);
    const meta = chainMeta[chainId] || { name: `Chain ${chainId}`, tokens: [] };
    const status = getChainStatus(config.contractAddress);
    return {
      chainId,
      name: meta.name,
      contractAddress: config.contractAddress,
      explorerUrl: config.explorerUrl,
      paymentToken: config.paymentToken,
      tokens: meta.tokens,
      status,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">多链管理</h2>
      <p className="text-sm text-gray-500">管理各链上的 NodeDistributor 合约部署</p>

      <div className="space-y-3">
        {chains.map((chain) => {
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
                <div className="text-gray-500">合约: {chain.status === "active" ? (
                  <a
                    href={`${chain.explorerUrl}/address/${chain.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-blue-400 hover:underline"
                  >
                    {truncateAddress(chain.contractAddress, 6)}
                  </a>
                ) : (
                  <span className="text-gray-500">—</span>
                )}</div>
              </div>
              {chain.status === "active" && (
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div className="text-gray-500">支付代币合约: <span className="font-mono text-gray-400">{truncateAddress(chain.paymentToken, 6)}</span></div>
                </div>
              )}
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
