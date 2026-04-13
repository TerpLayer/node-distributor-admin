import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/layout/Providers";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFT Admin Dashboard",
  description: "NFT Distribution Platform - Admin Panel",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pt-14 md:pt-0 md:ml-64 p-4 md:p-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
