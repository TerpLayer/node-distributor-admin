"use client";

import { useState } from "react";
import { truncateAddress } from "@/lib/utils";

interface AuditEntry {
  id: number;
  time: string;
  action: string;
  actor: string;
  target: string;
  details: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  setDailyLimit: { label: "设置每日限额", color: "bg-blue-900/50 text-blue-400" },
  setBlacklist: { label: "黑名单操作", color: "bg-red-900/50 text-red-400" },
  settlePool: { label: "池结算", color: "bg-green-900/50 text-green-400" },
  setVipBatch: { label: "批量设置VIP", color: "bg-purple-900/50 text-purple-400" },
  setPoolConfig: { label: "奖励池配置", color: "bg-cyan-900/50 text-cyan-400" },
  setTierConfig: { label: "层级配置", color: "bg-orange-900/50 text-orange-400" },
  pause: { label: "暂停合约", color: "bg-yellow-900/50 text-yellow-400" },
  unpause: { label: "恢复合约", color: "bg-emerald-900/50 text-emerald-400" },
  setAllowedToken: { label: "设置支付代币", color: "bg-indigo-900/50 text-indigo-400" },
};

const mockAuditLogs: AuditEntry[] = [
  { id: 1, time: "2026-04-13 14:30:00", action: "setDailyLimit", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "NodeSale", details: "限额: 100 -> 150" },
  { id: 2, time: "2026-04-13 12:00:00", action: "settlePool", actor: "bot", target: "V1", details: "分配 $5,200 给 98 人" },
  { id: 3, time: "2026-04-13 12:00:00", action: "settlePool", actor: "bot", target: "V2", details: "分配 $3,100 给 45 人" },
  { id: 4, time: "2026-04-13 12:00:00", action: "settlePool", actor: "bot", target: "V3", details: "分配 $1,800 给 23 人" },
  { id: 5, time: "2026-04-13 06:00:00", action: "setVipBatch", actor: "bot", target: "5 个用户", details: "VIP0->VIP1: 3人, VIP1->VIP2: 2人" },
  { id: 6, time: "2026-04-12 18:00:00", action: "setBlacklist", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "0xbad...0001", details: "加入黑名单" },
  { id: 7, time: "2026-04-12 15:00:00", action: "setPoolConfig", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "V1", details: "BPS: 400 -> 500" },
  { id: 8, time: "2026-04-12 10:00:00", action: "setTierConfig", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "VIP1", details: "奖励 BPS: 800 -> 1000" },
  { id: 9, time: "2026-04-11 22:00:00", action: "setAllowedToken", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "USDC", details: "启用 USDC 支付" },
  { id: 10, time: "2026-04-11 09:00:00", action: "pause", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "NodeSale", details: "紧急暂停 - 系统维护" },
  { id: 11, time: "2026-04-11 10:00:00", action: "unpause", actor: "0x1234567890abcdef1234567890abcdef12345678", target: "NodeSale", details: "恢复运行" },
];

function getActionStyle(action: string) {
  return ACTION_LABELS[action] || { label: action, color: "bg-gray-700 text-gray-300" };
}

export default function AuditPage() {
  const [filter, setFilter] = useState("all");

  const filteredLogs = filter === "all"
    ? mockAuditLogs
    : mockAuditLogs.filter((log) => log.action === filter);

  const actionTypes = ["all", ...Object.keys(ACTION_LABELS)];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">审计日志</h2>

      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-gray-500">筛选:</span>
        <div className="flex gap-1 flex-wrap">
          {actionTypes.map((type) => {
            const style = type === "all" ? { label: "全部", color: "bg-gray-700 text-gray-300" } : getActionStyle(type);
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded text-xs transition-colors ${
                  filter === type
                    ? "ring-1 ring-blue-500 " + style.color
                    : "bg-gray-800 text-gray-500 hover:text-gray-300"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
        <span className="text-sm text-gray-500 ml-auto">
          共 {filteredLogs.length} 条记录
        </span>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无审计记录</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-2 px-3">时间</th>
                <th className="text-left py-2 px-3">操作</th>
                <th className="text-left py-2 px-3">执行者</th>
                <th className="text-left py-2 px-3">目标</th>
                <th className="text-left py-2 px-3">详情</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <tr key={log.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 text-gray-500 text-xs whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${style.color}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {log.actor === "bot" ? (
                        <span className="text-cyan-400">Bot</span>
                      ) : (
                        <span className="text-blue-400 font-mono">{truncateAddress(log.actor)}</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{log.target}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{log.details}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
