"use client";

import { useEffect, useState } from "react";
import { truncateAddress } from "@/lib/utils";
import { publicClient, CONTRACT_ADDRESS } from "@/lib/chain";
import { nodeSaleAbi } from "@/lib/abi";

interface UserInfo {
  address: `0x${string}`;
  vip: number;
  nodes: number;
  directReferrals: number;
  communityNodes: number;
  referrer: string;
  blacklisted: boolean;
}

const vipBadgeStyles: Record<number, string> = {
  0: "bg-gray-700 text-gray-300",
  1: "bg-blue-900/50 text-blue-400",
  2: "bg-purple-900/50 text-purple-400",
  3: "bg-[#f0b429]/20 text-[#f0b429]",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function fetchUserInfo(address: `0x${string}`): Promise<UserInfo> {
  const contract = { address: CONTRACT_ADDRESS, abi: nodeSaleAbi } as const;

  const [purchaseCount, vipLevel, directReferrals, communityNodes, referrer, blacklisted] =
    await Promise.all([
      publicClient.readContract({ ...contract, functionName: "purchaseCount", args: [address] }),
      publicClient.readContract({ ...contract, functionName: "vipLevel", args: [address] }),
      publicClient.readContract({ ...contract, functionName: "directReferralCount", args: [address] }),
      publicClient.readContract({ ...contract, functionName: "communityNodeCount", args: [address] }),
      publicClient.readContract({ ...contract, functionName: "referrerOf", args: [address] }),
      publicClient.readContract({ ...contract, functionName: "isBlacklisted", args: [address] }),
    ]);

  return {
    address,
    nodes: Number(purchaseCount),
    vip: Number(vipLevel),
    directReferrals: Number(directReferrals),
    communityNodes: Number(communityNodes),
    referrer: referrer as string,
    blacklisted: blacklisted as boolean,
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchAddr, setSearchAddr] = useState("");
  const [searchResult, setSearchResult] = useState<UserInfo | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Discover users from NodePurchased events
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          event: {
            type: "event",
            name: "NodePurchased",
            inputs: [
              { name: "buyer", type: "address", indexed: true },
              { name: "referrer", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
              { name: "price", type: "uint256", indexed: false },
              { name: "token", type: "address", indexed: false },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        const uniqueAddresses = [...new Set(logs.map((l) => l.args.buyer!))];

        if (uniqueAddresses.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        const userInfos = await Promise.all(uniqueAddresses.map(fetchUserInfo));
        userInfos.sort((a, b) => b.nodes - a.nodes);
        setUsers(userInfos);
      } catch (e: any) {
        setError(e.shortMessage || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = async () => {
    const addr = searchAddr.trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return;
    setSearching(true);
    try {
      const info = await fetchUserInfo(addr as `0x${string}`);
      setSearchResult(info);
    } catch {
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
          <p className="text-red-400 text-sm">读取失败: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <span className="px-2 py-0.5 bg-green-900/30 text-green-500 rounded text-xs">链上实时</span>
      </div>

      {/* Search */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-500 mb-2">查询地址</p>
        <div className="flex gap-2">
          <input
            value={searchAddr}
            onChange={(e) => setSearchAddr(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm disabled:opacity-50 transition-colors"
          >
            {searching ? "查询中..." : "查询"}
          </button>
        </div>
        {searchResult && <UserCard user={searchResult} />}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-48 mb-3" />
              <div className="h-3 bg-gray-800 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            共 {users.length} 个购买用户
            {users.length === 0 && " — 暂无购买记录，可通过上方输入地址查询任意用户状态"}
          </p>
          <div className="space-y-3">
            {users.map((user) => (
              <UserCard key={user.address} user={user} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserCard({ user }: { user: UserInfo }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-3">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-mono text-blue-400">{truncateAddress(user.address)}</span>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${vipBadgeStyles[user.vip] || vipBadgeStyles[0]}`}>
            VIP{user.vip}
          </span>
          {user.blacklisted ? (
            <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">已拉黑</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">正常</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
        <div className="text-gray-500">持有节点: <span className="text-gray-300">{user.nodes}</span></div>
        <div className="text-gray-500">直推: <span className="text-gray-300">{user.directReferrals}</span></div>
        <div className="text-gray-500">社区: <span className="text-gray-300">{user.communityNodes}</span></div>
      </div>
      <div className="text-xs text-gray-500">
        推荐人: {user.referrer === ZERO_ADDRESS ? (
          <span className="text-gray-600">无</span>
        ) : (
          <span className="font-mono text-gray-400">{truncateAddress(user.referrer)}</span>
        )}
      </div>
    </div>
  );
}
