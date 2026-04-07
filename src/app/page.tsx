"use client";

import { useQuery } from "@tanstack/react-query";
import { formatUSDC } from "@/lib/utils";

interface Metrics {
  totalSalesVolume: string;
  totalCommission: string;
  activeUsers: number;
  activeStorefronts: number;
  pendingFlags: number;
  totalTransfers: number;
  totalPurchases: number;
  blacklistedTokens: number;
  blacklistedAddresses: number;
  lastProcessedBlock: number;
  // L1/V3 metrics
  wholesaleVolume: string;
  wholesaleRebates: string;
  wholesaleHeldFunds: string;
  l2Count: number;
  costSettlementInitialCost: string;
  costSettlementDistPool: string;
  costSettlementFixedCost: string;
  costSettlementSellerProfit: string;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<Metrics>({
    queryKey: ["metrics"],
    queryFn: () => fetch("/api/metrics").then((r) => r.json()),
  });

  if (isLoading) return <div className="text-gray-500">加载中...</div>;
  if (!data) return <div className="text-red-400">加载失败</div>;

  const retailCards = [
    { label: "总销售额", value: `${formatUSDC(data.totalSalesVolume)} USDC`, color: "text-green-400" },
    { label: "总佣金", value: `${formatUSDC(data.totalCommission)} USDC`, color: "text-blue-400" },
    { label: "活跃用户", value: data.activeUsers, color: "text-purple-400" },
    { label: "活跃店铺", value: data.activeStorefronts, color: "text-cyan-400" },
    { label: "总交易数", value: data.totalPurchases, color: "text-yellow-400" },
    { label: "总转账数", value: data.totalTransfers, color: "text-orange-400" },
    { label: "黑名单代币", value: data.blacklistedTokens, color: "text-red-400" },
    { label: "黑名单地址", value: data.blacklistedAddresses, color: "text-red-400" },
    { label: "待审标记", value: data.pendingFlags, color: data.pendingFlags > 0 ? "text-red-400" : "text-gray-400" },
    { label: "索引器区块", value: data.lastProcessedBlock.toLocaleString(), color: "text-gray-400" },
  ];

  const wholesaleCards = [
    { label: "批发总额", value: `${formatUSDC(data.wholesaleVolume)} USDC`, color: "text-green-400" },
    { label: "返利总额", value: `${formatUSDC(data.wholesaleRebates)} USDC`, color: "text-emerald-400" },
    { label: "持有资金", value: `${formatUSDC(data.wholesaleHeldFunds)} USDC`, color: "text-amber-400" },
    { label: "L2 数量", value: data.l2Count, color: "text-indigo-400" },
  ];

  const costCards = [
    { label: "初始成本", value: `${formatUSDC(data.costSettlementInitialCost)} USDC`, color: "text-sky-400" },
    { label: "分销池", value: `${formatUSDC(data.costSettlementDistPool)} USDC`, color: "text-violet-400" },
    { label: "固定成本", value: `${formatUSDC(data.costSettlementFixedCost)} USDC`, color: "text-rose-400" },
    { label: "卖家利润", value: `${formatUSDC(data.costSettlementSellerProfit)} USDC`, color: "text-lime-400" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">平台概览</h2>

      {/* Retail Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">零售 (V3)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {retailCards.map((c) => (
            <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Wholesale Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">批发 (L1)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wholesaleCards.map((c) => (
            <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Settlement Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">成本结算</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {costCards.map((c) => (
            <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
