"use client";

import { useState, useEffect } from "react";

interface BotConfig {
  id: string;
  name: string;
  description: string;
  schedule: string;
  command: string;
  role: string;
  wallet: string | undefined;
  status: "running" | "stopped" | "not-configured";
}

const statusConfig = {
  running: { label: "运行中", bg: "bg-green-900/50", text: "text-green-400", dot: "bg-green-400" },
  stopped: { label: "已停止", bg: "bg-gray-700", text: "text-gray-400", dot: "bg-gray-400" },
  "not-configured": { label: "未配置", bg: "bg-yellow-900/50", text: "text-yellow-400", dot: "bg-yellow-400" },
};

function getBotConfigs(): BotConfig[] {
  const settlementWallet = typeof window !== "undefined" ? undefined : undefined;
  const vipWallet = typeof window !== "undefined" ? undefined : undefined;

  return [
    {
      id: "settlement",
      name: "结算 Bot",
      description: "每日 UTC 00:00 自动结算 V1/V2/V3 奖励池，调用合约 settlePool()",
      schedule: "0 0 * * * (每日 UTC 00:00)",
      command: "cd /tmp/node-distributor-system && npm run bot:settle",
      role: "SETTLER_ROLE",
      wallet: process.env.NEXT_PUBLIC_SETTLEMENT_BOT_WALLET || undefined,
      status: "not-configured",
    },
    {
      id: "vip",
      name: "VIP 更新 Bot",
      description: "每 12 小时检查用户推荐数据，符合条件则调用 setVipBatch() 批量升级",
      schedule: "0 0,12 * * * (每日 00:00, 12:00 UTC)",
      command: "cd /tmp/node-distributor-system && npm run bot:vip",
      role: "VIP_UPDATER_ROLE",
      wallet: process.env.NEXT_PUBLIC_VIP_BOT_WALLET || undefined,
      status: "not-configured",
    },
  ];
}

export default function BotsPage() {
  const [bots, setBots] = useState<BotConfig[]>([]);

  useEffect(() => {
    setBots(getBotConfigs());
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Bot 监控</h2>
      <p className="text-xs text-gray-500">Bot 服务独立部署，此页面用于监控配置与状态</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bots.map((bot) => {
          const sc = statusConfig[bot.status];
          return (
            <div key={bot.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{bot.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{bot.description}</p>
                </div>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${bot.status === "running" ? "animate-pulse" : ""}`} />
                  {sc.label}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">执行计划</span>
                  <span className="text-gray-300 font-mono text-xs">{bot.schedule}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">所需权限</span>
                  <span className="text-cyan-400 font-mono text-xs">{bot.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bot 钱包</span>
                  {bot.wallet ? (
                    <span className="text-blue-400 font-mono text-xs">{bot.wallet.slice(0, 6)}...{bot.wallet.slice(-4)}</span>
                  ) : (
                    <span className="text-yellow-400 text-xs">未配置（设置 .env）</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">启动命令</span>
                  <div className="text-gray-300 font-mono text-xs bg-gray-800 rounded px-2 py-2 break-all">
                    {bot.command}
                  </div>
                </div>
              </div>

              {bot.status === "not-configured" && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    需要部署 Bot 服务并配置钱包地址。详见 BACKEND_BASELINE.md 任务 #4/#5。
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bot Deployment Guide */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">部署说明</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <p>1. Bot 作为独立 Node.js 进程运行，使用 cron 或 pm2 调度</p>
          <p>2. 结算 Bot 需要合约 <code className="text-blue-400">SETTLER_ROLE</code> 权限</p>
          <p>3. VIP Bot 需要合约 <code className="text-blue-400">VIP_UPDATER_ROLE</code> 权限（调用 setVipBatch）</p>
          <p>4. 本地开发默认读取 <code className="text-blue-400">/tmp/node-distributor-system/.env.local</code></p>
          <p>5. 私钥通过环境变量注入，生产环境应使用独立 Bot 钱包并通过进程管理器托管</p>
        </div>
      </section>
    </div>
  );
}
