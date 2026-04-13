"use client";

import { useState } from "react";

const mockConfig = {
  dailyLimit: 100,
  nodePrice: 300,
  poolAllocation: [
    { pool: "V1", bps: 500, percent: "5%", minVip: "VIP1" },
    { pool: "V2", bps: 300, percent: "3%", minVip: "VIP2" },
    { pool: "V3", bps: 200, percent: "2%", minVip: "VIP3" },
  ],
  tierReward: [
    { tier: "VIP1", bps: 1000, percent: "10%", directReferrals: 10, communityNodes: 30 },
    { tier: "VIP2", bps: 500, percent: "5%", directReferrals: 30, communityNodes: 100 },
    { tier: "VIP3", bps: 300, percent: "3%", directReferrals: 100, communityNodes: 500 },
  ],
  allowedTokens: [
    { chain: "Berachain", tokens: ["USDT", "USDC"] },
    { chain: "Arbitrum", tokens: ["USDT", "USDC", "DAI"] },
    { chain: "Ethereum", tokens: ["USDT", "USDC"] },
    { chain: "BNB Chain", tokens: ["USDT", "BUSD"] },
  ],
};

export default function ConfigPage() {
  const [dailyLimit, setDailyLimit] = useState(mockConfig.dailyLimit);
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">节点配置</h2>

      {/* Daily Limit */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">每日限额</h3>
        <div className="flex items-center gap-4">
          {editing ? (
            <>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-32"
              />
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                保存
              </button>
              <button
                onClick={() => { setDailyLimit(mockConfig.dailyLimit); setEditing(false); }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                取消
              </button>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-[#f0b429]">{dailyLimit}</span>
              <span className="text-gray-500 text-sm">个/天</span>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                修改
              </button>
            </>
          )}
        </div>
      </section>

      {/* Node Price */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">节点价格</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-400">{mockConfig.nodePrice}</span>
          <span className="text-gray-500 text-sm">USDT (固定)</span>
        </div>
      </section>

      {/* Pool Allocation BPS */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">奖励池分配比例</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">奖励池</th>
              <th className="text-right py-2 px-3">BPS</th>
              <th className="text-right py-2 px-3">百分比</th>
              <th className="text-left py-2 px-3">最低 VIP 等级</th>
            </tr>
          </thead>
          <tbody>
            {mockConfig.poolAllocation.map((p) => (
              <tr key={p.pool} className="border-b border-gray-800/50">
                <td className="py-2 px-3 font-medium">{p.pool}</td>
                <td className="py-2 px-3 text-right text-[#f0b429]">{p.bps}</td>
                <td className="py-2 px-3 text-right text-gray-300">{p.percent}</td>
                <td className="py-2 px-3 text-blue-400">{p.minVip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tier Reward BPS */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">层级奖励配置</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">等级</th>
              <th className="text-right py-2 px-3">奖励 BPS</th>
              <th className="text-right py-2 px-3">百分比</th>
              <th className="text-right py-2 px-3">直推要求</th>
              <th className="text-right py-2 px-3">社区节点要求</th>
            </tr>
          </thead>
          <tbody>
            {mockConfig.tierReward.map((t) => (
              <tr key={t.tier} className="border-b border-gray-800/50">
                <td className="py-2 px-3 font-medium">{t.tier}</td>
                <td className="py-2 px-3 text-right text-[#f0b429]">{t.bps}</td>
                <td className="py-2 px-3 text-right text-gray-300">{t.percent}</td>
                <td className="py-2 px-3 text-right">{t.directReferrals}</td>
                <td className="py-2 px-3 text-right">{t.communityNodes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Allowed Tokens */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">允许的支付代币</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-2 px-3">链</th>
              <th className="text-left py-2 px-3">代币</th>
            </tr>
          </thead>
          <tbody>
            {mockConfig.allowedTokens.map((chain) => (
              <tr key={chain.chain} className="border-b border-gray-800/50">
                <td className="py-2 px-3 font-medium">{chain.chain}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    {chain.tokens.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{t}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
