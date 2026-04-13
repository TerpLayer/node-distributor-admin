import { NextResponse } from "next/server";

// Mock audit logs for Node Store admin
export async function GET() {
  return NextResponse.json({
    logs: [
      { id: 1, time: "2026-04-13T14:30:00Z", action: "setDailyLimit", actor: "0x1234...5678", target: "NodeSale", details: "100 -> 150" },
      { id: 2, time: "2026-04-13T12:00:00Z", action: "settlePool", actor: "bot", target: "V1", details: "$5,200 / 98 participants" },
      { id: 3, time: "2026-04-13T12:00:00Z", action: "settlePool", actor: "bot", target: "V2", details: "$3,100 / 45 participants" },
      { id: 4, time: "2026-04-13T06:00:00Z", action: "setVipBatch", actor: "bot", target: "5 users", details: "VIP upgrades" },
      { id: 5, time: "2026-04-12T18:00:00Z", action: "setBlacklist", actor: "0x1234...5678", target: "0xbad...0001", details: "blacklisted" },
    ],
    total: 5,
    page: 1,
    totalPages: 1,
  });
}
