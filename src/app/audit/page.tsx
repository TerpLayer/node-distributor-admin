"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { truncateAddress } from "@/lib/utils";

interface AuditLog {
  id: number;
  adminAddr: string;
  action: string;
  target: string;
  details: string | null;
  txHash: string | null;
  createdAt: string;
}

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");

  const { data, isLoading } = useQuery<{ logs: AuditLog[]; total: number; totalPages: number }>({
    queryKey: ["audit", actionFilter, page],
    queryFn: () => fetch(`/api/audit?action=${actionFilter}&page=${page}`).then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">操作审计</h2>

      <div className="flex items-center gap-4">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm"
        >
          <option value="all">全部操作</option>
          <option value="flag_approved">审批通过</option>
          <option value="flag_rejected">审批拒绝</option>
          <option value="blacklist">黑名单操作</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">加载中...</p>
      ) : !data?.logs.length ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无审计记录</p>
          <p className="text-gray-600 text-sm mt-2">管理员的操作记录将显示在这里</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">时间</th>
                  <th className="text-left py-2 px-3">管理员</th>
                  <th className="text-left py-2 px-3">操作</th>
                  <th className="text-left py-2 px-3">目标</th>
                  <th className="text-left py-2 px-3">详情</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString("zh-CN")}</td>
                    <td className="py-2 px-3">{truncateAddress(log.adminAddr)}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        log.action.includes("approved") ? "bg-green-900/50 text-green-400" :
                        log.action.includes("rejected") ? "bg-red-900/50 text-red-400" :
                        "bg-gray-700 text-gray-300"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3">{log.target}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">{log.details || "-"}</td>
                  </tr>
                ))}
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
