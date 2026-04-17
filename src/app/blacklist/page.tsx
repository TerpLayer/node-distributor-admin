"use client";

import { useEffect, useState } from "react";
import { truncateAddress } from "@/lib/utils";
import { publicClient, CONTRACT_ADDRESS } from "@/lib/chain";
import { nodeSaleAbi } from "@/lib/abi";

interface BlacklistEntry {
  address: string;
  isBlacklisted: boolean;
  blockNumber: bigint;
  txHash: string;
}

export default function BlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkAddr, setCheckAddr] = useState("");
  const [checkResult, setCheckResult] = useState<{ addr: string; blacklisted: boolean } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: "event",
            name: "Blacklisted",
            inputs: [
              { name: "account", type: "address", indexed: true },
              { name: "isBlacklisted", type: "bool", indexed: false },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Keep latest event per address
        const latest = new Map<string, BlacklistEntry>();
        for (const log of logs) {
          const addr = (log.args.account as string).toLowerCase();
          latest.set(addr, {
            address: log.args.account as string,
            isBlacklisted: log.args.isBlacklisted as boolean,
            blockNumber: log.blockNumber,
            txHash: log.transactionHash,
          });
        }

        // Only show currently blacklisted addresses
        const blacklisted = [...latest.values()].filter((e) => e.isBlacklisted);
        blacklisted.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        setEntries(blacklisted);
      } catch (e: any) {
        setError(e.shortMessage || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCheck = async () => {
    const addr = checkAddr.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return;
    setChecking(true);
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: nodeSaleAbi,
        functionName: "isBlacklisted",
        args: [addr as `0x${string}`],
      });
      setCheckResult({ addr, blacklisted: result as boolean });
    } catch {
      setCheckResult(null);
    } finally {
      setChecking(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">黑名单</h2>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <p className="text-red-400 text-sm">读取失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">黑名单</h2>
        <span className="px-2 py-0.5 bg-green-900/30 text-green-500 rounded text-xs">链上实时</span>
      </div>

      {/* Check Address */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">查询地址状态</h3>
        <div className="flex gap-2">
          <input
            value={checkAddr}
            onChange={(e) => { setCheckAddr(e.target.value); setCheckResult(null); }}
            placeholder="0x..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={handleCheck}
            disabled={checking}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm disabled:opacity-50 transition-colors"
          >
            {checking ? "查询中..." : "查询"}
          </button>
        </div>
        {checkResult && (
          <div className="mt-3 p-3 bg-gray-800 rounded">
            <span className="text-sm font-mono text-gray-400">{truncateAddress(checkResult.addr, 6)}</span>
            {checkResult.blacklisted ? (
              <span className="ml-3 px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">已拉黑</span>
            ) : (
              <span className="ml-3 px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">正常</span>
            )}
          </div>
        )}
      </section>

      {/* Current Blacklist */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">
          当前黑名单 ({loading ? "..." : entries.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-48 mb-2" />
                <div className="h-3 bg-gray-800 rounded w-32" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">黑名单为空</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.address} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-mono text-red-400">{truncateAddress(entry.address, 6)}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">已拉黑</span>
                </div>
                <div className="text-xs text-gray-500">
                  区块: <span className="text-gray-400 font-mono">#{entry.blockNumber.toString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
