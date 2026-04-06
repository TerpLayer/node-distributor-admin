"use client";

import { useQuery } from "@tanstack/react-query";
import { truncateAddress, formatUSDC } from "@/lib/utils";

interface AnalyticsData {
  dailySales: { date: string; sales: number; volume: string; commission: string }[];
  topTokens: { tokenId: string; count: number }[];
  distributorCount: number;
  totalCommissionEarnings: string;
  topDistributors: { address: string; totalEarned: string; tier: number; collectionId: string }[];
  holdersCount: number;
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: () => fetch("/api/analytics").then((r) => r.json()),
  });

  if (isLoading) return <p className="text-gray-500">加载中...</p>;
  if (!data) return <p className="text-red-400">加载失败</p>;

  // Find max volume for bar chart scaling
  const maxVolume = Math.max(...data.dailySales.map((d) => Number(d.volume)), 1);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">数据分析</h2>

      {/* Key Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">分销商数量</p>
          <p className="text-2xl font-bold text-purple-400">{data.distributorCount}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">总分销佣金</p>
          <p className="text-2xl font-bold text-blue-400">{formatUSDC(data.totalCommissionEarnings)} USDC</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">持有者数量</p>
          <p className="text-2xl font-bold text-green-400">{data.holdersCount}</p>
        </div>
      </div>

      {/* Daily Sales Chart (simple bar chart) */}
      <section>
        <h3 className="text-lg font-semibold mb-4">每日销售趋势</h3>
        {data.dailySales.length === 0 ? (
          <p className="text-gray-500 text-sm">暂无销售数据</p>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-end gap-1 h-40">
              {data.dailySales.slice(-30).map((d) => {
                const height = Math.max(4, (Number(d.volume) / maxVolume) * 100);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-blue-500/60 hover:bg-blue-500 rounded-t transition-colors"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      <p>{d.date}</p>
                      <p>销售: {d.sales} 笔</p>
                      <p>金额: {formatUSDC(d.volume)} USDC</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>{data.dailySales[Math.max(0, data.dailySales.length - 30)]?.date}</span>
              <span>{data.dailySales[data.dailySales.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </section>

      {/* Top Tokens & Top Distributors side by side */}
      <div className="grid grid-cols-2 gap-6">
        <section>
          <h3 className="text-lg font-semibold mb-4">热门商品 (Top 10)</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-4">商品编号</th>
                  <th className="text-right py-2 px-4">销量</th>
                </tr>
              </thead>
              <tbody>
                {data.topTokens.map((t) => (
                  <tr key={t.tokenId} className="border-b border-gray-800/50">
                    <td className="py-2 px-4">#{t.tokenId}</td>
                    <td className="py-2 px-4 text-right text-green-400">{t.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-4">Top 分销商</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-4">地址</th>
                  <th className="text-right py-2 px-4">层级</th>
                  <th className="text-right py-2 px-4">收益</th>
                </tr>
              </thead>
              <tbody>
                {data.topDistributors.map((d, i) => (
                  <tr key={`${d.address}-${i}`} className="border-b border-gray-800/50">
                    <td className="py-2 px-4 text-blue-400">{truncateAddress(d.address)}</td>
                    <td className="py-2 px-4 text-right">T{d.tier}</td>
                    <td className="py-2 px-4 text-right text-yellow-400">{formatUSDC(d.totalEarned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
