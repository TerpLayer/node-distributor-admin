import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Sales over time (grouped by day)
  const purchases = await prisma.purchase.findMany({
    orderBy: { timestamp: "asc" },
    select: { timestamp: true, price: true, commissionAmount: true, tokenId: true },
  });

  // Group by date
  const dailySales: Record<string, { sales: number; volume: string; commission: string }> = {};
  for (const p of purchases) {
    const day = p.timestamp.toISOString().slice(0, 10);
    if (!dailySales[day]) dailySales[day] = { sales: 0, volume: "0", commission: "0" };
    dailySales[day].sales++;
    dailySales[day].volume = (BigInt(dailySales[day].volume) + BigInt(p.price.toString())).toString();
    dailySales[day].commission = (BigInt(dailySales[day].commission) + BigInt(p.commissionAmount.toString())).toString();
  }

  // Top tokens by sales count
  const tokenSales: Record<string, number> = {};
  for (const p of purchases) {
    tokenSales[p.tokenId] = (tokenSales[p.tokenId] || 0) + 1;
  }
  const topTokens = Object.entries(tokenSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tokenId, count]) => ({ tokenId, count }));

  // Distribution network stats
  const [distributorCount, totalCommissionEarnings, topDistributors] = await Promise.all([
    prisma.distributor.count(),
    prisma.commissionEarning.aggregate({ _sum: { amount: true } }),
    prisma.distributor.findMany({
      orderBy: { totalEarned: "desc" },
      take: 10,
      select: { address: true, totalEarned: true, tier: true, collectionId: true },
    }),
  ]);

  // Unique holders
  const holdersCount = await prisma.tokenBalance.count({ where: { balance: { not: "0" } } });

  return NextResponse.json({
    dailySales: Object.entries(dailySales).map(([date, data]) => ({ date, ...data })),
    topTokens,
    distributorCount,
    totalCommissionEarnings: totalCommissionEarnings._sum.amount?.toString() ?? "0",
    topDistributors: topDistributors.map((d) => ({ ...d, totalEarned: d.totalEarned.toString() })),
    holdersCount,
  });
}
