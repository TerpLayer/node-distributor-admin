"use client";

const mockData = {
  totalNodesSold: 1_842,
  totalRevenue: 552_600,
  activeUsers: 376,
  dailySalesToday: 47,
  dailyLimit: 100,
  vipDistribution: { VIP0: 210, VIP1: 98, VIP2: 45, VIP3: 23 },
  poolBalances: { V1: 28_500, V2: 15_200, V3: 8_900 },
  pendingClaims: 12,
};

function MetricCard({
  label,
  value,
  color = "text-white",
  accent = false,
}: {
  label: string;
  value: string | number;
  color?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 mb-2">{label}</p>
      <p
        className={`text-2xl font-bold ${accent ? "text-[#f0b429]" : color}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const d = mockData;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">仪表板</h2>

      {/* Core Metrics */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">核心指标</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="节点总销量" value={d.totalNodesSold.toLocaleString()} accent />
          <MetricCard label="总收入 (USDT)" value={`$${d.totalRevenue.toLocaleString()}`} color="text-green-400" />
          <MetricCard label="活跃用户" value={d.activeUsers} color="text-purple-400" />
          <MetricCard label="待领取奖励" value={d.pendingClaims} color="text-orange-400" />
        </div>
      </section>

      {/* Daily Sales */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">今日销售</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="今日已售" value={d.dailySalesToday} color="text-cyan-400" />
          <MetricCard label="每日限额" value={d.dailyLimit} color="text-gray-300" />
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-2">进度</p>
            <div className="mt-1">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-[#f0b429] h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (d.dailySalesToday / d.dailyLimit) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{d.dailySalesToday}/{d.dailyLimit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* VIP Distribution */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">VIP 分布</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(d.vipDistribution).map(([level, count]) => (
            <div key={level} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-2">{level}</p>
              <p className={`text-2xl font-bold ${
                level === "VIP3" ? "text-[#f0b429]" :
                level === "VIP2" ? "text-purple-400" :
                level === "VIP1" ? "text-blue-400" :
                "text-gray-400"
              }`}>{count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reward Pool Balances */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">奖励池余额</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(d.poolBalances).map(([pool, balance]) => (
            <div key={pool} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-2">{pool} 奖励池</p>
              <p className="text-2xl font-bold text-green-400">${balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
