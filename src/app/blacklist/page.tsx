"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { truncateAddress, explorerTxUrl, explorerAddressUrl } from "@/lib/utils";

interface Flag {
  id: number;
  tokenId: string;
  fromAddress: string;
  toAddress: string;
  detectedPrice: string | null;
  originalPrice: string;
  reason: string;
  status: string;
  reviewedBy: string | null;
  createdAt: string;
}

interface FlagResponse {
  flags: Flag[];
  total: number;
  page: number;
  totalPages: number;
}

interface BlacklistUpdateItem {
  id: number;
  txHash: string;
  blockNumber: number;
  entityType: number;
  entityId: string;
  entityAddress: string;
  isBlacklisted: boolean;
  timestamp: string;
}

export default function BlacklistPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [flagPage, setFlagPage] = useState(1);
  const [historyType, setHistoryType] = useState("all");
  const [historyPage, setHistoryPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: flagData } = useQuery<FlagResponse>({
    queryKey: ["flags", statusFilter, flagPage],
    queryFn: () => fetch(`/api/blacklist/flags?status=${statusFilter}&page=${flagPage}`).then((r) => r.json()),
  });

  const { data: historyData } = useQuery<{ updates: BlacklistUpdateItem[]; total: number; totalPages: number }>({
    queryKey: ["blacklist-updates", historyType, historyPage],
    queryFn: () => fetch(`/api/blacklist/updates?type=${historyType}&page=${historyPage}`).then((r) => r.json()),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      fetch(`/api/blacklist/flags/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reviewerAddress: "admin" }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">黑名单管理</h2>

      {/* Flagged Transfers */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">标记转账</h3>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setFlagPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            <option value="pending">待审</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="all">全部</option>
          </select>
        </div>

        {!flagData?.flags.length ? (
          <p className="text-gray-500 text-sm">暂无标记记录</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2 px-3">商品编号</th>
                    <th className="text-left py-2 px-3">发送方</th>
                    <th className="text-left py-2 px-3">接收方</th>
                    <th className="text-left py-2 px-3">原始价格</th>
                    <th className="text-left py-2 px-3">原因</th>
                    <th className="text-left py-2 px-3">时间</th>
                    <th className="text-left py-2 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {flagData.flags.map((f) => (
                    <tr key={f.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-3">{f.tokenId}</td>
                      <td className="py-2 px-3">
                        <a href={explorerAddressUrl(f.fromAddress)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {truncateAddress(f.fromAddress)}
                        </a>
                      </td>
                      <td className="py-2 px-3">
                        <a href={explorerAddressUrl(f.toAddress)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {truncateAddress(f.toAddress)}
                        </a>
                      </td>
                      <td className="py-2 px-3">{(Number(f.originalPrice) / 1e6).toFixed(2)}</td>
                      <td className="py-2 px-3 text-yellow-400">{f.reason}</td>
                      <td className="py-2 px-3 text-gray-500">{new Date(f.createdAt).toLocaleString("zh-CN")}</td>
                      <td className="py-2 px-3">
                        {f.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => reviewMutation.mutate({ id: f.id, action: "approved" })}
                              className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs hover:bg-green-600/30"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => reviewMutation.mutate({ id: f.id, action: "rejected" })}
                              className="px-2 py-1 bg-red-600/20 text-red-400 rounded text-xs hover:bg-red-600/30"
                            >
                              拒绝
                            </button>
                          </div>
                        ) : (
                          <span className={f.status === "approved" ? "text-green-400" : "text-red-400"}>
                            {f.status === "approved" ? "已通过" : "已拒绝"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {flagData.totalPages > 1 && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => setFlagPage((p) => Math.max(1, p - 1))} disabled={flagPage <= 1} className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-50">上一页</button>
                <span className="px-3 py-1 text-sm text-gray-500">{flagPage}/{flagData.totalPages}</span>
                <button onClick={() => setFlagPage((p) => Math.min(flagData.totalPages, p + 1))} disabled={flagPage >= flagData.totalPages} className="px-3 py-1 bg-gray-800 rounded text-sm disabled:opacity-50">下一页</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Blacklist History */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">黑名单操作记录</h3>
          <select
            value={historyType}
            onChange={(e) => { setHistoryType(e.target.value); setHistoryPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            <option value="all">全部</option>
            <option value="token">代币黑名单</option>
            <option value="address">地址黑名单</option>
          </select>
        </div>

        {!historyData?.updates.length ? (
          <p className="text-gray-500 text-sm">暂无操作记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">类型</th>
                  <th className="text-left py-2 px-3">目标</th>
                  <th className="text-left py-2 px-3">状态</th>
                  <th className="text-left py-2 px-3">区块</th>
                  <th className="text-left py-2 px-3">交易</th>
                </tr>
              </thead>
              <tbody>
                {historyData.updates.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3">{u.entityType === 0 ? "代币" : "地址"}</td>
                    <td className="py-2 px-3">
                      {u.entityType === 0 ? `#${u.entityId}` : truncateAddress(u.entityAddress)}
                    </td>
                    <td className="py-2 px-3">
                      <span className={u.isBlacklisted ? "text-red-400" : "text-green-400"}>
                        {u.isBlacklisted ? "已列入" : "已移除"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{u.blockNumber}</td>
                    <td className="py-2 px-3">
                      <a href={explorerTxUrl(u.txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {truncateAddress(u.txHash, 6)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
