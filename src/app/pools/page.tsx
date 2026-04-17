"use client";

const mockPools = [
  { id: "V1", balance: 28_500, minVip: "VIP1", participants: 98 },
  { id: "V2", balance: 15_200, minVip: "VIP2", participants: 45 },
  { id: "V3", balance: 8_900, minVip: "VIP3", participants: 23 },
];

const mockSettlements = [
  { date: "2026-04-12", pool: "V1", participants: 98, total: 5_200, perPerson: 53.06 },
  { date: "2026-04-12", pool: "V2", participants: 45, total: 3_100, perPerson: 68.89 },
  { date: "2026-04-12", pool: "V3", participants: 23, total: 1_800, perPerson: 78.26 },
  { date: "2026-04-11", pool: "V1", participants: 95, total: 4_800, perPerson: 50.53 },
  { date: "2026-04-11", pool: "V2", participants: 43, total: 2_900, perPerson: 67.44 },
  { date: "2026-04-11", pool: "V3", participants: 22, total: 1_650, perPerson: 75.00 },
  { date: "2026-04-10", pool: "V1", participants: 90, total: 4_500, perPerson: 50.00 },
  { date: "2026-04-10", pool: "V2", participants: 40, total: 2_700, perPerson: 67.50 },
];

const poolBadgeStyle = (pool: string) =>
  pool === "V3" ? "bg-[#f0b429]/20 text-[#f0b429]" :
  pool === "V2" ? "bg-purple-900/50 text-purple-400" :
  "bg-blue-900/50 text-blue-400";

export default function PoolsPage() {
  const lastSettlement = "2026-04-12 20:00:00";

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">奖励池</h2>

      {/* Pool Balances */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">当前余额</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockPools.map((pool) => (
            <div key={pool.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-lg font-semibold">{pool.id} 奖励池</p>
                <span className="text-xs text-gray-500">最低 {pool.minVip}</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-green-400">${pool.balance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">参与人数: {pool.participants}</p>
              <button className="mt-3 w-full px-4 py-2 bg-[#f0b429]/20 text-[#f0b429] hover:bg-[#f0b429]/30 rounded text-sm font-medium transition-colors">
                手动结算
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Last Settlement */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <p className="text-sm text-gray-500">上次结算时间</p>
        <p className="text-lg font-medium mt-1">{lastSettlement}</p>
      </section>

      {/* Settlement History */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">结算历史</h3>
        <div className="space-y-3">
          {mockSettlements.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">{s.date}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${poolBadgeStyle(s.pool)}`}>{s.pool}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-gray-500">参与人数: <span className="text-gray-300">{s.participants}</span></div>
                <div className="text-gray-500">总额: <span className="text-green-400">${s.total.toLocaleString()}</span></div>
                <div className="text-gray-500">人均: <span className="text-gray-300">${s.perPerson.toFixed(2)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
