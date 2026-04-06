"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { truncateAddress, explorerTxUrl, explorerAddressUrl } from "@/lib/utils";

interface AuditEntry {
  id: string;
  time: string;
  source: string;
  action: string;
  actor: string;
  target: string;
  details: string | null;
  txHash: string | null;
  blockNumber: number | null;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  purchase: { label: "购买", color: "bg-green-900/50 text-green-400" },
  transfer: { label: "转账", color: "bg-gray-700 text-gray-300" },
  blacklist_add_token: { label: "Token 黑名单", color: "bg-red-900/50 text-red-400" },
  blacklist_remove_token: { label: "Token 解除", color: "bg-emerald-900/50 text-emerald-400" },
  blacklist_add_address: { label: "地址黑名单", color: "bg-red-900/50 text-red-400" },
  blacklist_remove_address: { label: "地址解除", color: "bg-emerald-900/50 text-emerald-400" },
  commission_claim: { label: "佣金提取", color: "bg-yellow-900/50 text-yellow-400" },
  commission_earned: { label: "佣金入账", color: "bg-blue-900/50 text-blue-400" },
  collection_created: { label: "创建合集", color: "bg-purple-900/50 text-purple-400" },
  flag_approved: { label: "审批通过", color: "bg-green-900/50 text-green-400" },
  flag_rejected: { label: "审批拒绝", color: "bg-red-900/50 text-red-400" },
  blacklist_add: { label: "黑名单操作", color: "bg-orange-900/50 text-orange-400" },
  blacklist_remove: { label: "黑名单解除", color: "bg-emerald-900/50 text-emerald-400" },
};

function getActionStyle(action: string) {
  return ACTION_LABELS[action] || { label: action, color: "bg-gray-700 text-gray-300" };
}

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState("all");

  const { data, isLoading } = useQuery<{ logs: AuditEntry[]; total: number; totalPages: number }>({
    queryKey: ["audit", source, page],
    queryFn: () => fetch(`/api/audit?source=${source}&page=${page}`).then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">操作审计</h2>

      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[
            { value: "all", label: "全部" },
            { value: "chain", label: "链上事件" },
            { value: "admin", label: "后台操作" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => { setSource(s.value); setPage(1); }}
              className={`px-3 py-1.5 rounded text-sm ${source === s.value ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {data && (
          <span className="text-sm text-gray-500">
            共 {data.total} 条记录
          </span>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500">加载中...</p>
      ) : !data?.logs.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无审计记录</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">时间</th>
                  <th className="text-left py-2 px-3">来源</th>
                  <th className="text-left py-2 px-3">操作</th>
                  <th className="text-left py-2 px-3">执行者</th>
                  <th className="text-left py-2 px-3">目标</th>
                  <th className="text-left py-2 px-3">详情</th>
                  <th className="text-left py-2 px-3">交易</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => {
                  const style = getActionStyle(log.action);
                  return (
                    <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 px-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(log.time).toLocaleString("zh-CN")}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${log.source === "chain" ? "bg-cyan-900/50 text-cyan-400" : "bg-orange-900/50 text-orange-400"}`}>
                          {log.source === "chain" ? "链上" : "后台"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs ${style.color}`}>
                          {style.label}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {log.actor === "owner" ? (
                          <span className="text-yellow-400">Owner</span>
                        ) : (
                          <a href={explorerAddressUrl(log.actor)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {truncateAddress(log.actor)}
                          </a>
                        )}
                      </td>
                      <td className="py-2 px-3 max-w-[200px] truncate" title={log.target}>
                        {log.target}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs max-w-[180px] truncate" title={log.details || ""}>
                        {log.details || "-"}
                      </td>
                      <td className="py-2 px-3">
                        {log.txHash ? (
                          <a href={explorerTxUrl(log.txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                            {truncateAddress(log.txHash, 6)}
                          </a>
                        ) : "-"}
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
