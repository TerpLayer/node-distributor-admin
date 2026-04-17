"use client";

import { useEffect, useState } from "react";
import { publicClient, CONTRACT_ADDRESS, PAYMENT_TOKEN } from "@/lib/chain";
import { nodeSaleAbi, erc20Abi } from "@/lib/abi";

interface DashboardData {
  dailyLimit: number;
  dailySold: number;
  paused: boolean;
  poolBalances: { V1: number; V2: number; V3: number };
  contractBalance: number;
}

const USDT_DECIMALS = 6;
const fmtUsdt = (raw: bigint) => Number(raw) / 10 ** USDT_DECIMALS;

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
        className={`text-xl md:text-2xl font-bold ${accent ? "text-[#f0b429]" : color}`}
      >
        {value}
      </p>
    </div>
  );
}

async function fetchDashboard(): Promise<DashboardData> {
  const contract = { address: CONTRACT_ADDRESS, abi: nodeSaleAbi } as const;

  const [dailyLimit, currentDay, paused] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "dailyLimit" }),
    publicClient.readContract({ ...contract, functionName: "currentDay" }),
    publicClient.readContract({ ...contract, functionName: "paused" }),
  ]);

  const dailySold = await publicClient.readContract({
    ...contract, functionName: "dailySold", args: [currentDay as bigint],
  });

  const [poolV1, poolV2, poolV3] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "tokenPoolBalances", args: [PAYMENT_TOKEN, 0n] }),
    publicClient.readContract({ ...contract, functionName: "tokenPoolBalances", args: [PAYMENT_TOKEN, 1n] }),
    publicClient.readContract({ ...contract, functionName: "tokenPoolBalances", args: [PAYMENT_TOKEN, 2n] }),
  ]);

  const contractBalance = await publicClient.readContract({
    address: PAYMENT_TOKEN, abi: erc20Abi, functionName: "balanceOf", args: [CONTRACT_ADDRESS],
  });

  return {
    dailyLimit: Number(dailyLimit),
    dailySold: Number(dailySold),
    paused: paused as boolean,
    poolBalances: { V1: fmtUsdt(poolV1 as bigint), V2: fmtUsdt(poolV2 as bigint), V3: fmtUsdt(poolV3 as bigint) },
    contractBalance: fmtUsdt(contractBalance as bigint),
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard().then(setData).catch((e) => setError(e.shortMessage || e.message));
    const interval = setInterval(() => {
      fetchDashboard().then(setData).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">仪表板</h2>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <p className="text-red-400 text-sm">合约读取失败: {error}</p>
          <p className="text-xs text-gray-500 mt-2">请确认 Hardhat 节点已启动且合约已部署</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">仪表板</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="h-3 bg-gray-800 rounded w-20 mb-3" />
              <div className="h-6 bg-gray-800 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const d = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">仪表板</h2>
        {d.paused && (
          <span className="px-2 py-0.5 bg-red-900/50 text-red-400 rounded text-xs font-medium">合约已暂停</span>
        )}
        <span className="px-2 py-0.5 bg-green-900/30 text-green-500 rounded text-xs">链上实时</span>
      </div>

      {/* Daily Sales */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">今日销售</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard label="今日已售" value={d.dailySold} color="text-cyan-400" />
          <MetricCard label="每日限额" value={d.dailyLimit} color="text-gray-300" />
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className="text-xs text-gray-500 mb-2">进度</p>
            <div className="mt-1">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div
                  className="bg-[#f0b429] h-3 rounded-full transition-all"
                  style={{ width: `${d.dailyLimit > 0 ? Math.min(100, (d.dailySold / d.dailyLimit) * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{d.dailySold}/{d.dailyLimit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Balance */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">合约资金</h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="合约 USDT 余额" value={`$${d.contractBalance.toLocaleString()}`} color="text-green-400" />
          <MetricCard label="奖池总额" value={`$${(d.poolBalances.V1 + d.poolBalances.V2 + d.poolBalances.V3).toLocaleString()}`} accent />
        </div>
      </section>

      {/* Reward Pool Balances */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">奖励池余额</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(d.poolBalances).map(([pool, balance]) => (
            <div key={pool} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-2">{pool} 奖励池</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">${balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
