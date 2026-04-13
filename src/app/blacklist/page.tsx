"use client";

import { useState } from "react";
import { truncateAddress } from "@/lib/utils";

interface BlacklistEntry {
  address: string;
  dateAdded: string;
  addedBy: string;
}

const initialBlacklist: BlacklistEntry[] = [
  { address: "0x6789012345abcdef6789012345abcdef67890123", dateAdded: "2026-04-10", addedBy: "admin" },
  { address: "0xbad0000000000000000000000000000000000001", dateAdded: "2026-04-08", addedBy: "admin" },
  { address: "0xbad0000000000000000000000000000000000002", dateAdded: "2026-04-05", addedBy: "bot" },
  { address: "0xbad0000000000000000000000000000000000003", dateAdded: "2026-04-01", addedBy: "admin" },
];

export default function BlacklistPage() {
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(initialBlacklist);
  const [newAddress, setNewAddress] = useState("");
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleAdd = () => {
    const addr = newAddress.trim();
    if (!addr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setMessage({ text: "无效的地址格式", isError: true });
      return;
    }
    if (blacklist.some((b) => b.address.toLowerCase() === addr.toLowerCase())) {
      setMessage({ text: "该地址已在黑名单中", isError: true });
      return;
    }
    setBlacklist((prev) => [
      { address: addr, dateAdded: new Date().toISOString().split("T")[0], addedBy: "admin" },
      ...prev,
    ]);
    setNewAddress("");
    setMessage({ text: "已添加到黑名单", isError: false });
  };

  const handleRemove = (address: string) => {
    setBlacklist((prev) => prev.filter((b) => b.address !== address));
    setMessage({ text: "已从黑名单移除", isError: false });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">黑名单</h2>

      {/* Add Address */}
      <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">添加地址</h3>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">钱包地址</label>
            <input
              value={newAddress}
              onChange={(e) => { setNewAddress(e.target.value); setMessage(null); }}
              placeholder="0x..."
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!newAddress.trim()}
            className="px-6 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded text-sm font-medium disabled:opacity-50 transition-colors"
          >
            加入黑名单
          </button>
        </div>
        {message && (
          <p className={`mt-3 text-sm ${message.isError ? "text-red-400" : "text-green-400"}`}>
            {message.text}
          </p>
        )}
      </section>

      {/* Current Blacklist */}
      <section>
        <h3 className="text-lg font-semibold text-gray-400 mb-3">
          当前黑名单 ({blacklist.length})
        </h3>
        {blacklist.length === 0 ? (
          <p className="text-gray-500 text-sm">黑名单为空</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  <th className="text-left py-2 px-3">地址</th>
                  <th className="text-left py-2 px-3">添加日期</th>
                  <th className="text-left py-2 px-3">操作人</th>
                  <th className="text-left py-2 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {blacklist.map((entry) => (
                  <tr key={entry.address} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-2 px-3 font-mono text-red-400">
                      {truncateAddress(entry.address, 6)}
                    </td>
                    <td className="py-2 px-3 text-gray-400">{entry.dateAdded}</td>
                    <td className="py-2 px-3 text-gray-400">{entry.addedBy}</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => handleRemove(entry.address)}
                        className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-xs transition-colors"
                      >
                        移除
                      </button>
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
