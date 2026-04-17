"use client";

import { useEffect, useState } from "react";

type ConfigState = {
  dailyLimit: number;
  dailyRemaining: number;
  paused: boolean;
  platformWallet: string;
  paymentToken: string;
  paymentTokenAllowed: boolean;
  poolAllocation: [number, number, number];
  tierRewardBps: [number, number, number, number];
};

const vipConditions = [
  { tier: "VIP0", conditions: "初始状态（已受邀未购买）" },
  { tier: "VIP1", conditions: "购买 ≥ 1 个节点" },
  { tier: "VIP2", conditions: "直推有效 ≥ 5 + 社区节点 ≥ 500 + 社区VIP1 ≥ 2" },
  { tier: "VIP3", conditions: "直推有效 ≥ 10 + 社区节点 ≥ 2000 + 社区VIP2 ≥ 3" },
];

const readonlyRules = {
  pricing: { startPrice: 300, description: "合约常量 NODE_PRICE，当前版本不可通过后台修改" },
  referral: { percent: "5%", description: "合约常量 REFERRAL_REWARD_BPS，当前版本不可通过后台修改" },
  airdrop: { label: "666 AVO", description: "不在 NodeSale 合约内，需由外部业务/空投流程实现" },
};

const poolNames = ["V1", "V2", "V3"];
const poolVip = ["VIP1", "VIP2", "VIP3"];
const tierNames = ["VIP0", "VIP1", "VIP2", "VIP3"];

async function requestConfig<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "请求失败");
  }
  return payload as T;
}

function percentText(bps: number) {
  return `${bps / 100}%`;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigState | null>(null);
  const [draft, setDraft] = useState<ConfigState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      setError(null);
      const data = await requestConfig<ConfigState>("/api/config");
      setConfig(data);
      setDraft(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "读取配置失败");
    } finally {
      setLoading(false);
    }
  }

  async function submit(action: string, payload: Record<string, unknown>) {
    try {
      setSaving(action);
      setMessage(null);
      setError(null);
      const result = await requestConfig<{ config: ConfigState }>("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      setConfig(result.config);
      setDraft(result.config);
      setMessage("链上配置已更新");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "配置写入失败");
    } finally {
      setSaving(null);
    }
  }

  if (loading || !draft || !config) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">节点配置</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
          <div className="h-5 bg-gray-800 rounded w-40 mb-4" />
          <div className="h-10 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">节点配置</h2>
          <p className="text-xs text-gray-500 mt-1">仅“链上可变参数”会在此页生效；价格、直推奖励、空投和 VIP 规则说明不在此页直接修改</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 bg-green-900/30 text-green-500 rounded text-xs">链上实时</span>
          <button
            onClick={loadConfig}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
          >
            刷新
          </button>
        </div>
      </div>

      {message && <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 text-sm text-green-400">{message}</div>}
      {error && <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-sm text-red-400">{error}</div>}

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">合约状态</h3>
          <button
            onClick={() => submit(config.paused ? "unpause" : "pause", {})}
            disabled={saving === "pause" || saving === "unpause"}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${config.paused ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : "bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30"}`}
          >
            {saving === "pause" || saving === "unpause" ? "处理中..." : config.paused ? "恢复合约" : "暂停合约"}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">状态</p>
            <p className={config.paused ? "text-red-400 font-medium" : "text-green-400 font-medium"}>{config.paused ? "已暂停" : "运行中"}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">每日限额</p>
            <p className="text-[#f0b429] font-medium">{config.dailyLimit}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">今日剩余额度</p>
            <p className="text-blue-400 font-medium">{config.dailyRemaining}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">支付代币状态</p>
            <p className={config.paymentTokenAllowed ? "text-green-400 font-medium" : "text-red-400 font-medium"}>{config.paymentTokenAllowed ? "已启用" : "已禁用"}</p>
          </div>
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">每日限额</h3>
          <button
            onClick={() => submit("setDailyLimit", { dailyLimit: draft.dailyLimit })}
            disabled={saving === "setDailyLimit"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving === "setDailyLimit" ? "保存中..." : "保存到链上"}
          </button>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <input
            type="number"
            min={0}
            value={draft.dailyLimit}
            onChange={(event) => setDraft({ ...draft, dailyLimit: Number(event.target.value) })}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm w-40"
          />
          <span className="text-sm text-gray-500">个/天</span>
          <span className="text-xs text-gray-500">当前链上值：{config.dailyLimit}</span>
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">平台钱包</h3>
          <button
            onClick={() => submit("setPlatformWallet", { platformWallet: draft.platformWallet })}
            disabled={saving === "setPlatformWallet"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving === "setPlatformWallet" ? "保存中..." : "更新钱包"}
          </button>
        </div>
        <input
          value={draft.platformWallet}
          onChange={(event) => setDraft({ ...draft, platformWallet: event.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
        />
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">奖励池注资比例</h3>
          <button
            onClick={() => submit("setPoolConfig", { poolAllocation: draft.poolAllocation })}
            disabled={saving === "setPoolConfig"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving === "setPoolConfig" ? "保存中..." : "保存到链上"}
          </button>
        </div>
        <div className="space-y-3">
          {draft.poolAllocation.map((bps, index) => (
            <div key={poolNames[index]} className="bg-gray-800/50 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div>
                <p className="text-sm font-medium text-gray-200">{poolNames[index]} 奖池</p>
                <p className="text-xs text-gray-500">参与资格：{poolVip[index]} 及以上</p>
              </div>
              <input
                type="number"
                min={0}
                value={bps}
                onChange={(event) => {
                  const next = [...draft.poolAllocation] as [number, number, number];
                  next[index] = Number(event.target.value);
                  setDraft({ ...draft, poolAllocation: next });
                }}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              />
              <div className="text-sm text-[#f0b429]">{percentText(bps)}</div>
              <div className="text-xs text-gray-500">当前链上：{config.poolAllocation[index]} BPS</div>
            </div>
          ))}
          <p className="text-xs text-gray-500">这里只配置注资比例；“谁有资格参与分红”仍由 VIP 档位规则和结算 Bot 共同决定。</p>
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">等级奖励档位</h3>
          <button
            onClick={() => submit("setTierRewardConfig", { tierRewardBps: draft.tierRewardBps })}
            disabled={saving === "setTierRewardConfig"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
          >
            {saving === "setTierRewardConfig" ? "保存中..." : "保存到链上"}
          </button>
        </div>
        <div className="space-y-3">
          {draft.tierRewardBps.map((bps, index) => (
            <div key={tierNames[index]} className="bg-gray-800/50 rounded-lg p-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div>
                <p className="text-sm font-medium text-gray-200">{tierNames[index]}</p>
                <p className="text-xs text-gray-500">VIP0 固定必须为 0</p>
              </div>
              <input
                type="number"
                min={0}
                disabled={index === 0}
                value={bps}
                onChange={(event) => {
                  const next = [...draft.tierRewardBps] as [number, number, number, number];
                  next[index] = Number(event.target.value);
                  setDraft({ ...draft, tierRewardBps: next });
                }}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm disabled:opacity-40"
              />
              <div className="text-sm text-[#f0b429]">{percentText(bps)}</div>
              <div className="text-xs text-gray-500">当前链上：{config.tierRewardBps[index]} BPS</div>
            </div>
          ))}
          <p className="text-xs text-gray-500">这里只配置奖励比例；VIP 升级判定条件本身不是合约 setter，而是由业务规则和 VIP Bot 计算后调用批量更新。</p>
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">支付代币</h3>
            <p className="text-xs text-gray-500 mt-1">当前页面只管理当前活动链的支付代币白名单状态</p>
          </div>
          <button
            onClick={() => submit("setAllowedToken", { allowed: !config.paymentTokenAllowed })}
            disabled={saving === "setAllowedToken"}
            className={`px-4 py-2 rounded text-sm font-medium disabled:opacity-50 ${config.paymentTokenAllowed ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-green-600/20 text-green-400 hover:bg-green-600/30"}`}
          >
            {saving === "setAllowedToken" ? "处理中..." : config.paymentTokenAllowed ? "禁用支付代币" : "启用支付代币"}
          </button>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">代币地址</p>
          <p className="text-sm font-mono text-gray-300 break-all">{config.paymentToken}</p>
        </div>
      </section>

      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">只读业务规则</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">节点价格</p>
            <p className="text-lg font-bold text-green-400">{readonlyRules.pricing.startPrice} USDT</p>
            <p className="text-xs text-gray-500 mt-1">{readonlyRules.pricing.description}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">直推奖励</p>
            <p className="text-lg font-bold text-[#f0b429]">{readonlyRules.referral.percent}</p>
            <p className="text-xs text-gray-500 mt-1">{readonlyRules.referral.description}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">空投奖励</p>
            <p className="text-lg font-bold text-purple-400">{readonlyRules.airdrop.label}</p>
            <p className="text-xs text-gray-500 mt-1">{readonlyRules.airdrop.description}</p>
          </div>
        </div>
        <div className="space-y-3">
          {vipConditions.map((item) => (
            <div key={item.tier} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-start gap-4">
              <span className="text-sm font-medium text-gray-200">{item.tier}</span>
              <span className="text-xs text-gray-400 text-right max-w-[70%]">{item.conditions}</span>
            </div>
          ))}
          <p className="text-xs text-gray-500">VIP 条件说明给运营参考；真正的升级执行依赖 VIP Bot 调用 setVipBatch，不是在这个页面直接改条件。</p>
        </div>
      </section>
    </div>
  );
}
