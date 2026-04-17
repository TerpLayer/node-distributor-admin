"use client";

import { useState } from "react";

interface BotStatus {
  name: string;
  description: string;
  status: "running" | "stopped" | "error";
  lastRun: string;
  nextScheduled: string;
  details: string;
}

const initialBots: BotStatus[] = [
  {
    name: "结算 Bot",
    description: "每日自动结算 V1/V2/V3 奖励池",
    status: "running",
    lastRun: "2026-04-13 08:00:00",
    nextScheduled: "2026-04-14 08:00:00",
    details: "上次结算: 3 个池, 共分配 $10,100",
  },
  {
    name: "VIP 更新 Bot",
    description: "定期检查用户推荐数据, 自动升级 VIP 等级",
    status: "running",
    lastRun: "2026-04-13 06:00:00",
    nextScheduled: "2026-04-13 18:00:00",
    details: "上次更新: 5 个用户升级",
  },
];

const statusConfig = {
  running: { label: "运行中", bg: "bg-green-900/50", text: "text-green-400", dot: "bg-green-400" },
  stopped: { label: "已停止", bg: "bg-gray-700", text: "text-gray-400", dot: "bg-gray-400" },
  error: { label: "异常", bg: "bg-red-900/50", text: "text-red-400", dot: "bg-red-400" },
};

export default function BotsPage() {
  const [bots, setBots] = useState<BotStatus[]>(initialBots);

  const toggleBot = (index: number) => {
    setBots((prev) =>
      prev.map((bot, i) =>
        i === index
          ? { ...bot, status: bot.status === "running" ? "stopped" : "running" }
          : bot
      )
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Bot 监控</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bots.map((bot, index) => {
          const sc = statusConfig[bot.status];
          return (
            <div key={bot.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{bot.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{bot.description}</p>
                </div>
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} animate-pulse`} />
                  {sc.label}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">上次运行</span>
                  <span className="text-gray-300">{bot.lastRun}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">下次计划</span>
                  <span className="text-gray-300">{bot.nextScheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">运行详情</span>
                  <span className="text-gray-300">{bot.details}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => toggleBot(index)}
                  className={`flex-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
                    bot.status === "running"
                      ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                      : "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  }`}
                >
                  {bot.status === "running" ? "停止" : "启动"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
