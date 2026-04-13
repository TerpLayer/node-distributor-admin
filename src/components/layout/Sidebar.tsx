"use client";

import { useState, useEffect } from "react";
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
  ChevronUp,
  X,
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

// Mobile bottom nav: show first 4, "更多" expands the rest
const mobileMainItems = navItems.slice(0, 4);
const mobileMoreItems = navItems.slice(4);

export function Sidebar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close "more" panel on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isMoreActive = mobileMoreItems.some((item) => pathname === item.href);

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex-col z-30">
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

      {/* ── Mobile bottom nav (< lg) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-gray-900/97 border-t border-gray-800 backdrop-blur-lg" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {/* More panel (expands upward) */}
        {moreOpen && (
          <div className="border-t border-gray-800 bg-gray-900 px-2 pt-2 pb-1 grid grid-cols-4 gap-1">
            {mobileMoreItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] transition-colors",
                    isActive ? "text-blue-400" : "text-gray-500"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Main bottom tabs */}
        <div className="flex items-center justify-around h-14">
          {mobileMainItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[10px] transition-colors min-w-[60px]",
                  isActive ? "text-blue-400" : "text-gray-500"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] transition-colors min-w-[60px]",
              isMoreActive || moreOpen ? "text-blue-400" : "text-gray-500"
            )}
          >
            {moreOpen ? <X className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            <span>更多</span>
          </button>
        </div>
      </nav>

      {/* Close more panel backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}
    </>
  );
}
