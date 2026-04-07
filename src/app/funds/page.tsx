"use client";

import { useQuery } from "@tanstack/react-query";
import { truncateAddress, formatUSDC, explorerTxUrl, explorerAddressUrl } from "@/lib/utils";

interface HeldByToken {
  paymentToken: string;
  totalVolume: string;
  totalRebate: string;
  totalHeld: string;
  transactionCount: number;
}

interface WholesaleTx {
  id: number;
  txHash: string;
  blockNumber: number;
  buyer: string;
  tokenId: string | null;
  tokenIds: string[];
  amounts: string[];
  paymentToken: string;
  totalPrice: string;
  rebateAmount: string;
  heldAmount: string;
  isBatch: boolean;
  timestamp: string;
}

interface SafeTx {
  id: number;
  safeTxHash: string;
  safeAddress: string;
  to: string;
  status: string;
  nonce: number;
  confirmationsRequired: number;
  confirmations: number;
  executedAt: string | null;
  executionTxHash: string | null;
  createdAt: string;
}

interface CostTotals {
  initialCost: string;
  fixedCost: string;
  distributionPool: string;
  sellerProfit: string;
  count: number;
}

interface FundsData {
  heldByToken: HeldByToken[];
  recentTransactions: WholesaleTx[];
  safeTransactions: SafeTx[];
  costTotals: CostTotals;
}

const SAFE_APP_URL = "https://app.safe.global";

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    proposed: { bg: "bg-yellow-600/20", text: "text-yellow-400", label: "待确认" },
    confirmed: { bg: "bg-blue-600/20", text: "text-blue-400", label: "已确认" },
    executed: { bg: "bg-green-600/20", text: "text-green-400", label: "已执行" },
    failed: { bg: "bg-red-600/20", text: "text-red-400", label: "失败" },
  };
  const s = map[status] ?? { bg: "bg-gray-600/20", text: "text-gray-400", label: status };
  return <span className={`px-2 py-0.5 rounded text-xs ${s.bg} ${s.text}`}>{s.label}</span>;
}

export default function FundsPage() {
  const { data, isLoading } = useQuery<FundsData>({
    queryKey: ["funds"],
    queryFn: () => fetch("/api/funds").then((r) => r.json()),
  });

  if (isLoading) return <div className="text-gray-500">加载中...</div>;
  if (!data) return <div className="text-red-400">加载失败</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">资金管理</h2>

      {/* Held Funds per Token */}
      <section>
        <h3 className="text-lg font-semibold mb-4">L1 持有资金</h3>
        {!data.heldByToken.length ? (
          <p className="text-gray-500 text-sm">暂无持有资金记录</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.heldByToken.map((h) => (
              <div key={h.paymentToken} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <a
                    href={explorerAddressUrl(h.paymentToken)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm font-mono"
                  >
                    {truncateAddress(h.paymentToken)}
                  </a>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">总交易额</span>
                    <span className="text-sm text-green-400">{formatUSDC(h.totalVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">总返利</span>
                    <span className="text-sm text-emerald-400">{formatUSDC(h.totalRebate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">持有金额</span>
                    <span className="text-sm text-amber-400 font-bold">{formatUSDC(h.totalHeld)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">交易数</span>
                    <span className="text-sm text-gray-300">{h.transactionCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cost Settlement Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-4">成本结算汇总 ({data.costTotals.count} 笔)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">初始成本</p>
            <p className="text-xl font-bold text-sky-400">{formatUSDC(data.costTotals.initialCost)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">固定成本</p>
            <p className="text-xl font-bold text-rose-400">{formatUSDC(data.costTotals.fixedCost)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">分销池</p>
            <p className="text-xl font-bold text-violet-400">{formatUSDC(data.costTotals.distributionPool)}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">卖家利润</p>
            <p className="text-xl font-bold text-lime-400">{formatUSDC(data.costTotals.sellerProfit)}</p>
          </div>
        </div>
      </section>

      {/* Safe Transactions */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold">Safe 钱包交易</h3>
          <a
            href={SAFE_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            打开 Safe App
          </a>
        </div>
        {!data.safeTransactions.length ? (
          <p className="text-gray-500 text-sm">暂无 Safe 交易记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">Nonce</th>
                  <th className="text-left py-2 px-3">目标</th>
                  <th className="text-left py-2 px-3">状态</th>
                  <th className="text-left py-2 px-3">确认数</th>
                  <th className="text-left py-2 px-3">创建时间</th>
                  <th className="text-left py-2 px-3">执行交易</th>
                </tr>
              </thead>
              <tbody>
                {data.safeTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 font-mono">{tx.nonce}</td>
                    <td className="py-2 px-3">
                      <a href={explorerAddressUrl(tx.to)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {truncateAddress(tx.to)}
                      </a>
                    </td>
                    <td className="py-2 px-3">{statusBadge(tx.status)}</td>
                    <td className="py-2 px-3">{tx.confirmations}/{tx.confirmationsRequired}</td>
                    <td className="py-2 px-3 text-gray-500">{new Date(tx.createdAt).toLocaleString("zh-CN")}</td>
                    <td className="py-2 px-3">
                      {tx.executionTxHash ? (
                        <a href={explorerTxUrl(tx.executionTxHash)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {truncateAddress(tx.executionTxHash, 6)}
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Wholesale Transaction History */}
      <section>
        <h3 className="text-lg font-semibold mb-4">批发交易记录</h3>
        {!data.recentTransactions.length ? (
          <p className="text-gray-500 text-sm">暂无交易记录</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">交易</th>
                  <th className="text-left py-2 px-3">买家</th>
                  <th className="text-left py-2 px-3">商品</th>
                  <th className="text-left py-2 px-3">总额</th>
                  <th className="text-left py-2 px-3">返利</th>
                  <th className="text-left py-2 px-3">持有</th>
                  <th className="text-left py-2 px-3">类型</th>
                  <th className="text-left py-2 px-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3">
                      <a href={explorerTxUrl(tx.txHash)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {truncateAddress(tx.txHash, 6)}
                      </a>
                    </td>
                    <td className="py-2 px-3">
                      <a href={explorerAddressUrl(tx.buyer)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {truncateAddress(tx.buyer)}
                      </a>
                    </td>
                    <td className="py-2 px-3">
                      {tx.isBatch ? `${tx.tokenIds.length} 个商品` : `#${tx.tokenId}`}
                    </td>
                    <td className="py-2 px-3 text-green-400">{formatUSDC(tx.totalPrice)}</td>
                    <td className="py-2 px-3 text-emerald-400">{formatUSDC(tx.rebateAmount)}</td>
                    <td className="py-2 px-3 text-amber-400">{formatUSDC(tx.heldAmount)}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${tx.isBatch ? "bg-purple-600/20 text-purple-400" : "bg-blue-600/20 text-blue-400"}`}>
                        {tx.isBatch ? "批量" : "单个"}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">{new Date(tx.timestamp).toLocaleString("zh-CN")}</td>
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
