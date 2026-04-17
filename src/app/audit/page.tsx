"use client";

import { useEffect, useState } from "react";
import { truncateAddress } from "@/lib/utils";
import { publicClient, CONTRACT_ADDRESS } from "@/lib/chain";
import { nodeSaleAbi } from "@/lib/abi";
import { formatUnits, type Log } from "viem";

const USDT_DECIMALS = 6;

interface AuditEntry {
  id: string;
  blockNumber: bigint;
  txHash: string;
  eventName: string;
  args: Record<string, any>;
}

const EVENT_STYLES: Record<string, { label: string; color: string }> = {
  NodePurchased: { label: "节点购买", color: "bg-green-900/50 text-green-400" },
  ReferrerBound: { label: "绑定推荐人", color: "bg-blue-900/50 text-blue-400" },
  VipLevelUpdated: { label: "VIP 升级", color: "bg-purple-900/50 text-purple-400" },
  PoolSettled: { label: "池结算", color: "bg-cyan-900/50 text-cyan-400" },
  Blacklisted: { label: "黑名单操作", color: "bg-red-900/50 text-red-400" },
};

const EVENT_DEFS = nodeSaleAbi.filter((e) => e.type === "event");

function formatEventDetails(name: string, args: Record<string, any>): string {
  switch (name) {
    case "NodePurchased":
      return `购买 ${args.amount?.toString() || "?"} 个节点, 支付 $${args.price ? Number(formatUnits(args.price, USDT_DECIMALS)).toLocaleString() : "?"}`;
    case "ReferrerBound":
      return `用户 ${truncateAddress(args.user || "")} 绑定推荐人 ${truncateAddress(args.referrer || "")}`;
    case "VipLevelUpdated":
      return `VIP${args.oldLevel?.toString() || "?"} → VIP${args.newLevel?.toString() || "?"}`;
    case "PoolSettled":
      return `V${(Number(args.poolId) + 1)} 池分配 $${args.totalAmount ? Number(formatUnits(args.totalAmount, USDT_DECIMALS)).toLocaleString() : "?"} 给 ${args.participants?.toString() || "?"} 人`;
    case "Blacklisted":
      return args.isBlacklisted ? "加入黑名单" : "移出黑名单";
    default:
      return JSON.stringify(args);
  }
}

function getMainActor(name: string, args: Record<string, any>): string {
  switch (name) {
    case "NodePurchased": return args.buyer || "";
    case "ReferrerBound": return args.user || "";
    case "VipLevelUpdated": return args.user || "";
    case "PoolSettled": return "";
    case "Blacklisted": return args.account || "";
    default: return "";
  }
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        // Fetch all event types in parallel
        const logsArrays = await Promise.all(
          EVENT_DEFS.map((eventDef) =>
            publicClient.getLogs({
              address: CONTRACT_ADDRESS,
              event: eventDef as any,
              fromBlock: 0n,
              toBlock: "latest",
            }).then((logs) =>
              logs.map((log: any) => ({
                id: `${log.transactionHash}-${log.logIndex}`,
                blockNumber: log.blockNumber,
                txHash: log.transactionHash,
                eventName: (eventDef as any).name,
                args: log.args || {},
              }))
            )
          )
        );

        const allEntries = logsArrays.flat();
        allEntries.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        setEntries(allEntries);
      } catch (e: any) {
        setError(e.shortMessage || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredEntries = filter === "all"
    ? entries
    : entries.filter((e) => e.eventName === filter);

  const filterOptions = ["all", ...Object.keys(EVENT_STYLES)];

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">审计日志</h2>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <p className="text-red-400 text-sm">读取失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">审计日志</h2>
        <span className="px-2 py-0.5 bg-green-900/30 text-green-500 rounded text-xs">链上实时</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-gray-500">筛选:</span>
        <div className="flex gap-1 flex-wrap">
          {filterOptions.map((type) => {
            const style = type === "all"
              ? { label: "全部", color: "bg-gray-700 text-gray-300" }
              : EVENT_STYLES[type] || { label: type, color: "bg-gray-700 text-gray-300" };
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
          共 {filteredEntries.length} 条记录
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-64" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无审计记录</p>
          <p className="text-xs text-gray-600 mt-1">合约事件将在发生交易后自动出现</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const style = EVENT_STYLES[entry.eventName] || { label: entry.eventName, color: "bg-gray-700 text-gray-300" };
            const actor = getMainActor(entry.eventName, entry.args);
            return (
              <div key={entry.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 font-mono">区块 #{entry.blockNumber.toString()}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${style.color}`}>
                    {style.label}
                  </span>
                </div>
                {actor && (
                  <div className="text-xs text-gray-500 mb-1">
                    地址: <span className="text-blue-400 font-mono">{truncateAddress(actor)}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  {formatEventDetails(entry.eventName, entry.args)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
