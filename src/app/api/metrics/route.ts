import { NextResponse } from "next/server";

// Mock metrics for Node Store dashboard
export async function GET() {
  return NextResponse.json({
    totalNodesSold: 1842,
    totalRevenue: 552600,
    activeUsers: 376,
    dailySalesToday: 47,
    dailyLimit: 100,
    vipDistribution: { VIP0: 210, VIP1: 98, VIP2: 45, VIP3: 23 },
    poolBalances: { V1: 28500, V2: 15200, V3: 8900 },
    pendingClaims: 12,
  });
}
