"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { truncateAddress, formatUSDC, explorerAddressUrl, explorerTxUrl } from "@/lib/utils";

interface L2Info {
  address: string;
  totalVolume: string;
  totalRebate: string;
  totalHeld: string;
  transactionCount: number;
  lastActivity: string | null;
  lastTxHash: string | null;
}

interface L2Response {
  l2s: L2Info[];
}

interface RegisteredL2 {
  address: string;
  isRegistered: boolean;
}

export default function L2ManagementPage() {
  const queryClient = useQueryClient();
  const [newL2Address, setNewL2Address] = useState("");
  const [actionResult, setActionResult] = useState<{ msg: string; isError: boolean } | null>(null);
  const [actionPending, setActionPending] = useState(false);

  // Fetch L2 wholesale stats from DB
  const { data: l2Data, isLoading } = useQuery<L2Response>({
    queryKey: ["l2-stats"],
    queryFn: () => fetch("/api/l2").then((r) => r.json()),
  });

  // Fetch registered L2s from chain
  const { data: registeredData, isLoading: registeredLoading } = useQuery<{ l2s: RegisteredL2[]; count: number }>({
    queryKey: ["registered-l2s"],
    queryFn: () => fetch("/api/l2/registered").then((r) => r.json()),
  });

  const handleRegister = async () => {
    if (!newL2Address.trim() || !newL2Address.startsWith("0x")) return;
    setActionPending(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/l2/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ l2Address: newL2Address.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionResult({ msg: `注册成功 (${data.txHash?.slice(0, 14)}...)`, isError: false });
      setNewL2Address("");
      queryClient.invalidateQueries({ queryKey: ["registered-l2s"] });
      queryClient.invalidateQueries({ queryKey: ["l2-stats"] });
    } catch (e: unknown) {
      setActionResult({ msg: (e as Error).message || "注册失败", isError: true });
    }
    setActionPending(false);
  };

  const handleDeregister = async (address: string) => {
    if (!confirm(`确定要注销 L2 合约 ${truncateAddress(address)} 吗?`)) return;
    setActionPending(true);
    setActionResult(null);
    try {
      const res = await fetch("/api/l2/deregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ l2Address: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionResult({ msg: `注销成功 (${data.txHash?.slice(0, 14)}...)`, isError: false });
      queryClient.invalidateQueries({ queryKey: ["registered-l2s"] });
      queryClient.invalidateQueries({ queryKey: ["l2-stats"] });
    } catch (e: unknown) {
      setActionResult({ msg: (e as Error).message || "注销失败", isError: true });
    }
    setActionPending(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">L2 管理</h2>

      {/* Register L2 */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">注册新 L2 合约</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[300px]">
            <label className="block text-xs text-gray-500 mb-1">L2 合约地址</label>
            <input
              value={newL2Address}
              onChange={(e) => { setNewL2Address(e.target.value); setActionResult(null); }}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleRegister}
            disabled={!newL2Address.trim() || actionPending}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm font-medium disabled:opacity-50"
          >
            {actionPending ? "处理中..." : "注册 L2"}
          </button>
        </div>
        {actionResult && (
          <p className={`mt-3 text-sm ${actionResult.isError ? "text-red-400" : "text-green-400"}`}>
            {actionResult.msg}
          </p>
        )}
      </section>

      {/* Registered L2s from chain */}
      <section>
        <h3 className="text-lg font-semibold mb-4">
          已注册 L2 合约
          {registeredData && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({registeredData.count} 个)
            </span>
          )}
        </h3>
        {registeredLoading ? (
          <p className="text-gray-500 text-sm">加载中...</p>
        ) : !registeredData?.l2s.length ? (
          <p className="text-gray-500 text-sm">暂无已注册 L2 合约</p>
        ) : (
          <div className="grid gap-3">
            {registeredData.l2s.map((l2) => (
              <div key={l2.address} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${l2.isRegistered ? "bg-green-400" : "bg-red-400"}`} />
                  <a
                    href={explorerAddressUrl(l2.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline font-mono text-sm"
                  >
                    {l2.address}
                  </a>
                  <span className="text-xs text-gray-500">
                    {l2.isRegistered ? "已注册" : "未注册"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeregister(l2.address)}
                  disabled={actionPending}
                  className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-xs disabled:opacity-50"
                >
                  注销
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* L2 Wholesale Stats */}
      <section>
        <h3 className="text-lg font-semibold mb-4">L2 批发统计</h3>
        {isLoading ? (
          <p className="text-gray-500 text-sm">加载中...</p>
        ) : !l2Data?.l2s.length ? (
          <p className="text-gray-500 text-sm">暂无批发交易记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">买家地址</th>
                  <th className="text-left py-2 px-3">总交易额</th>
                  <th className="text-left py-2 px-3">总返利</th>
                  <th className="text-left py-2 px-3">持有金额</th>
                  <th className="text-left py-2 px-3">交易数</th>
                  <th className="text-left py-2 px-3">最近活动</th>
                </tr>
              </thead>
              <tbody>
                {l2Data.l2s.map((l2) => (
                  <tr key={l2.address} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3">
                      <a
                        href={explorerAddressUrl(l2.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {truncateAddress(l2.address)}
                      </a>
                    </td>
                    <td className="py-2 px-3 text-green-400">{formatUSDC(l2.totalVolume)} USDC</td>
                    <td className="py-2 px-3 text-emerald-400">{formatUSDC(l2.totalRebate)} USDC</td>
                    <td className="py-2 px-3 text-amber-400">{formatUSDC(l2.totalHeld)} USDC</td>
                    <td className="py-2 px-3">{l2.transactionCount}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {l2.lastActivity ? (
                        <span>
                          {new Date(l2.lastActivity).toLocaleString("zh-CN")}
                          {l2.lastTxHash && (
                            <a
                              href={explorerTxUrl(l2.lastTxHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline ml-2"
                            >
                              Tx
                            </a>
                          )}
                        </span>
                      ) : (
                        "-"
                      )}
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
