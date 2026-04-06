"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { truncateAddress, explorerTxUrl, explorerAddressUrl } from "@/lib/utils";

type LogType = "all" | "transfers" | "purchases" | "commissions" | "collections";

export default function LogsPage() {
  const [type, setType] = useState<LogType>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["logs", type, page, search],
    queryFn: () =>
      fetch(`/api/logs?type=${type}&page=${page}&search=${encodeURIComponent(search)}`).then((r) => r.json()),
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">事件日志</h2>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {(["all", "transfers", "purchases", "commissions", "collections"] as LogType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded text-sm ${type === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200"}`}
            >
              {{ all: "全部", transfers: "转账", purchases: "购买", commissions: "佣金", collections: "合集" }[t]}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索地址 / 交易哈希..."
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm w-80"
          />
          <button onClick={handleSearch} className="px-3 py-1.5 bg-blue-600 rounded text-sm">搜索</button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">加载中...</p>
      ) : !data?.items?.length ? (
        <p className="text-gray-500">暂无记录</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">类型</th>
                  <th className="text-left py-2 px-3">区块</th>
                  <th className="text-left py-2 px-3">详情</th>
                  <th className="text-left py-2 px-3">交易</th>
                  <th className="text-left py-2 px-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item: any, i: number) => {
                  const itemType = item._type || type;
                  return (
                    <tr key={`${item.txHash}-${item.logIndex}-${i}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          itemType === "transfer" || itemType === "transfers" ? "bg-gray-700 text-gray-300" :
                          itemType === "purchase" || itemType === "purchases" ? "bg-green-900/50 text-green-400" :
                          itemType === "commission" || itemType === "commissions" ? "bg-blue-900/50 text-blue-400" :
                          "bg-purple-900/50 text-purple-400"
                        }`}>
                          {({ transfer: "转账", transfers: "转账", purchase: "购买", purchases: "购买", commission: "佣金", commissions: "佣金", collections: "合集" } as Record<string, string>)[itemType] || itemType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-500">{item.blockNumber}</td>
                      <td className="py-2 px-3">
                        {item.buyer && (
                          <span>
                            <a href={explorerAddressUrl(item.buyer)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{truncateAddress(item.buyer)}</a>
                            {" "} 购买 #{item.tokenId}
                            {item.price && ` (${(Number(item.price) / 1e6).toFixed(2)} USDC)`}
                          </span>
                        )}
                        {item.from && !item.buyer && (
                          <span>
                            <a href={explorerAddressUrl(item.from)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{truncateAddress(item.from)}</a>
                            {" → "}
                            <a href={explorerAddressUrl(item.to)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{truncateAddress(item.to)}</a>
                            {` #${item.tokenId} x${item.amount}`}
                          </span>
                        )}
                        {item.claimant && (
                          <span>
                            <a href={explorerAddressUrl(item.claimant)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{truncateAddress(item.claimant)}</a>
                            {` 提取 ${(Number(item.amount) / 1e6).toFixed(2)} USDC`}
                          </span>
                        )}
                        {item.creator && (
                          <span>
                            <a href={explorerAddressUrl(item.creator)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{truncateAddress(item.creator)}</a>
                            {` 创建合集 #${item.collectionId}`}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <a href={explorerTxUrl(item.txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                          {truncateAddress(item.txHash, 6)}
                        </a>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {new Date(item.timestamp).toLocaleString("zh-CN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-50">上一页</button>
              <span className="px-3 py-1 text-sm text-gray-500">{page}/{data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages} className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-50">下一页</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
