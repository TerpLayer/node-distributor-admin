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
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<Metrics>({
    queryKey: ["metrics"],
    queryFn: () => fetch("/api/metrics").then((r) => r.json()),
  });

  if (isLoading) return <div className="text-gray-500">加载中...</div>;
  if (!data) return <div className="text-red-400">加载失败</div>;

  const cards = [
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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">平台概览</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
