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

  // ── L1 Propagation ──
  const [propagateTarget, setPropagateTarget] = useState("");
  const [propagateType, setPropagateType] = useState<"address" | "token">("address");
  const [propagateAction, setPropagateAction] = useState<"blacklist" | "unblacklist">("blacklist");
  const [propagateResult, setPropagateResult] = useState<{ msg: string; isError: boolean } | null>(null);
  const [propagatePending, setPropagatePending] = useState(false);

  const handlePropagate = async () => {
    if (!propagateTarget.trim()) return;
    setPropagatePending(true);
    setPropagateResult(null);
    try {
      const res = await fetch("/api/blacklist/propagate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: propagateType,
          target: propagateTarget.trim(),
          blacklisted: propagateAction === "blacklist",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPropagateResult({ msg: `传播成功 (${data.txHash?.slice(0, 14)}...)`, isError: false });
      queryClient.invalidateQueries({ queryKey: ["blacklist-updates"] });
    } catch (e: unknown) {
      setPropagateResult({ msg: (e as Error).message || "传播失败", isError: true });
    }
    setPropagatePending(false);
  };

  // ── Blacklist execute ──
  const [blType, setBlType] = useState<"token" | "address">("token");
  const [blTarget, setBlTarget] = useState("");
  const [blResult, setBlResult] = useState<{ msg: string; isError: boolean } | null>(null);
  const [blStatus, setBlStatus] = useState<{ isBlacklisted: boolean } | null>(null);
  const [blChecking, setBlChecking] = useState(false);

  const checkStatus = async () => {
    if (!blTarget.trim()) return;
    setBlChecking(true);
    setBlStatus(null);
    try {
      const res = await fetch(`/api/blacklist/status?type=${blType}&target=${encodeURIComponent(blTarget.trim())}`);
      const data = await res.json();
      if (res.ok) setBlStatus(data);
      else setBlResult({ msg: data.error, isError: true });
    } catch { setBlResult({ msg: "查询失败", isError: true }); }
    setBlChecking(false);
  };

  const executeMutation = useMutation({
    mutationFn: (blacklisted: boolean) =>
      fetch("/api/blacklist/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: blType, target: blTarget.trim(), blacklisted }),
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
    onSuccess: (data) => {
      setBlResult({ msg: `交易成功 (${data.txHash.slice(0, 14)}...)`, isError: false });
      setBlStatus(null);
      queryClient.invalidateQueries({ queryKey: ["blacklist-updates"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
    onError: (e: Error) => {
      setBlResult({ msg: e.message, isError: true });
    },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">黑名单管理</h2>

      {/* Blacklist Execute */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">黑名单设置</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">类型</label>
            <select
              value={blType}
              onChange={(e) => { setBlType(e.target.value as "token" | "address"); setBlStatus(null); setBlResult(null); }}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="token">商品 (Token ID)</option>
              <option value="address">地址 (Wallet)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs text-gray-500 mb-1">
              {blType === "token" ? "商品编号" : "钱包地址"}
            </label>
            <input
              value={blTarget}
              onChange={(e) => { setBlTarget(e.target.value); setBlStatus(null); setBlResult(null); }}
              placeholder={blType === "token" ? "输入商品编号 (如: 0)" : "0x..."}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={checkStatus}
            disabled={!blTarget.trim() || blChecking}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm disabled:opacity-50"
          >
            {blChecking ? "查询中..." : "查询状态"}
          </button>
        </div>

        {blStatus && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-gray-400">
              当前状态：
              <span className={blStatus.isBlacklisted ? "text-red-400 font-medium" : "text-green-400 font-medium"}>
                {blStatus.isBlacklisted ? "已列入黑名单" : "未列入黑名单"}
              </span>
            </span>
            <button
              onClick={() => executeMutation.mutate(!blStatus.isBlacklisted)}
              disabled={executeMutation.isPending}
              className={`px-4 py-2 rounded text-sm font-medium ${
                blStatus.isBlacklisted
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              } disabled:opacity-50`}
            >
              {executeMutation.isPending
                ? "交易中..."
                : blStatus.isBlacklisted
                  ? "移出黑名单"
                  : "加入黑名单"}
            </button>
          </div>
        )}

        {blResult && (
          <p className={`mt-3 text-sm ${blResult.isError ? "text-red-400" : "text-green-400"}`}>
            {blResult.msg}
          </p>
        )}
      </section>

      {/* L1 Propagation */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">L1 黑名单传播</h3>
        <p className="text-xs text-gray-500 mb-4">将黑名单操作传播到所有已注册的 L2 合约</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">类型</label>
            <select
              value={propagateType}
              onChange={(e) => { setPropagateType(e.target.value as "address" | "token"); setPropagateResult(null); }}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="address">地址</option>
              <option value="token">商品 (Token ID)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">操作</label>
            <select
              value={propagateAction}
              onChange={(e) => { setPropagateAction(e.target.value as "blacklist" | "unblacklist"); setPropagateResult(null); }}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            >
              <option value="blacklist">加入黑名单</option>
              <option value="unblacklist">移出黑名单</option>
            </select>
          </div>
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs text-gray-500 mb-1">
              {propagateType === "address" ? "钱包地址" : "商品编号"}
            </label>
            <input
              value={propagateTarget}
              onChange={(e) => { setPropagateTarget(e.target.value); setPropagateResult(null); }}
              placeholder={propagateType === "address" ? "0x..." : "输入商品编号"}
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handlePropagate}
            disabled={!propagateTarget.trim() || propagatePending}
            className="px-4 py-2 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded text-sm font-medium disabled:opacity-50"
          >
            {propagatePending ? "传播中..." : "传播到所有 L2"}
          </button>
        </div>
        {propagateResult && (
          <p className={`mt-3 text-sm ${propagateResult.isError ? "text-red-400" : "text-green-400"}`}>
            {propagateResult.msg}
          </p>
        )}
      </section>

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
