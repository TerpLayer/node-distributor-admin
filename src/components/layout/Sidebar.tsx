"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  Coins,
  Bot,
  Globe,
  ShieldBan,
  FileSearch,
} from "lucide-react";

const navItems = [
  { href: "/", label: "仪表板", icon: LayoutDashboard },
  { href: "/users", label: "用户管理", icon: Users },
  { href: "/config", label: "节点配置", icon: Settings },
  { href: "/pools", label: "奖励池", icon: Coins },
  { href: "/bots", label: "Bot 监控", icon: Bot },
  { href: "/chains", label: "多链管理", icon: Globe },
  { href: "/blacklist", label: "黑名单", icon: ShieldBan },
  { href: "/audit", label: "审计日志", icon: FileSearch },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Node Store</h1>
        <p className="text-xs text-gray-500 mt-1">管理后台</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-blue-600/20 text-blue-400 font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-600">
        Berachain Bepolia
      </div>
    </aside>
  );
}
