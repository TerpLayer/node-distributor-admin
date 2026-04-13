"use client";

import { truncateAddress } from "@/lib/utils";

const mockUsers = [
  { address: "0x1234567890abcdef1234567890abcdef12345678", vip: 3, nodes: 45, directReferrals: 12, communityNodes: 156, referrer: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", blacklisted: false },
  { address: "0x2345678901abcdef2345678901abcdef23456789", vip: 2, nodes: 28, directReferrals: 8, communityNodes: 89, referrer: "0x1234567890abcdef1234567890abcdef12345678", blacklisted: false },
  { address: "0x3456789012abcdef3456789012abcdef34567890", vip: 2, nodes: 22, directReferrals: 6, communityNodes: 67, referrer: "0x1234567890abcdef1234567890abcdef12345678", blacklisted: false },
  { address: "0x4567890123abcdef4567890123abcdef45678901", vip: 1, nodes: 15, directReferrals: 4, communityNodes: 34, referrer: "0x2345678901abcdef2345678901abcdef23456789", blacklisted: false },
  { address: "0x5678901234abcdef5678901234abcdef56789012", vip: 1, nodes: 12, directReferrals: 3, communityNodes: 28, referrer: "0x2345678901abcdef2345678901abcdef23456789", blacklisted: false },
  { address: "0x6789012345abcdef6789012345abcdef67890123", vip: 1, nodes: 10, directReferrals: 2, communityNodes: 15, referrer: "0x3456789012abcdef3456789012abcdef34567890", blacklisted: true },
  { address: "0x7890123456abcdef7890123456abcdef78901234", vip: 0, nodes: 5, directReferrals: 1, communityNodes: 8, referrer: "0x4567890123abcdef4567890123abcdef45678901", blacklisted: false },
  { address: "0x8901234567abcdef8901234567abcdef89012345", vip: 0, nodes: 3, directReferrals: 0, communityNodes: 3, referrer: "0x5678901234abcdef5678901234abcdef56789012", blacklisted: false },
  { address: "0x9012345678abcdef9012345678abcdef90123456", vip: 0, nodes: 2, directReferrals: 0, communityNodes: 2, referrer: "0x6789012345abcdef6789012345abcdef67890123", blacklisted: false },
  { address: "0xa123456789abcdefa123456789abcdefa1234567", vip: 0, nodes: 1, directReferrals: 0, communityNodes: 1, referrer: "0x7890123456abcdef7890123456abcdef78901234", blacklisted: false },
];

const vipBadgeStyles: Record<number, string> = {
  0: "bg-gray-700 text-gray-300",
  1: "bg-blue-900/50 text-blue-400",
  2: "bg-purple-900/50 text-purple-400",
  3: "bg-[#f0b429]/20 text-[#f0b429]",
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">用户管理</h2>
      <p className="text-sm text-gray-500">共 {mockUsers.length} 个用户</p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-left py-3 px-3">地址</th>
              <th className="text-left py-3 px-3">VIP 等级</th>
              <th className="text-right py-3 px-3">持有节点</th>
              <th className="text-right py-3 px-3">直推人数</th>
              <th className="text-right py-3 px-3">社区节点</th>
              <th className="text-left py-3 px-3">推荐人</th>
              <th className="text-left py-3 px-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.address} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="py-3 px-3 font-mono text-blue-400">
                  {truncateAddress(user.address)}
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${vipBadgeStyles[user.vip]}`}>
                    VIP{user.vip}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">{user.nodes}</td>
                <td className="py-3 px-3 text-right">{user.directReferrals}</td>
                <td className="py-3 px-3 text-right">{user.communityNodes}</td>
                <td className="py-3 px-3 font-mono text-gray-400">
                  {truncateAddress(user.referrer)}
                </td>
                <td className="py-3 px-3">
                  {user.blacklisted ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-900/50 text-red-400">已拉黑</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-900/50 text-green-400">正常</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
