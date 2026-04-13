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
  Menu,
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

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
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
              onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center h-14 bg-gray-900 border-b border-gray-800 px-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-gray-400 hover:text-white"
          aria-label="打开菜单"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-3 text-sm font-bold text-white">Node Store 管理后台</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white"
              aria-label="关闭菜单"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
