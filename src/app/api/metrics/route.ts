import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalSalesVolume,
    totalCommission,
    activeUsers,
    activeStorefronts,
    pendingFlags,
    totalTransfers,
    totalPurchases,
    blacklistedTokens,
    blacklistedAddresses,
    indexerState,
  ] = await Promise.all([
    prisma.purchase.aggregate({ _sum: { price: true } }),
    prisma.purchase.aggregate({ _sum: { commissionAmount: true } }),
    prisma.purchase.findMany({ select: { buyer: true }, distinct: ["buyer"] }).then((r) => r.length),
    prisma.storefrontConfig.count({ where: { isActive: true } }),
    prisma.blacklistFlag.count({ where: { status: "pending" } }),
    prisma.transfer.count(),
    prisma.purchase.count(),
    prisma.blacklistUpdate.count({ where: { entityType: 0, isBlacklisted: true } }),
    prisma.blacklistUpdate.count({ where: { entityType: 1, isBlacklisted: true } }),
    prisma.indexerState.findFirst(),
  ]);

  return NextResponse.json({
    totalSalesVolume: totalSalesVolume._sum.price?.toString() ?? "0",
    totalCommission: totalCommission._sum.commissionAmount?.toString() ?? "0",
    activeUsers,
    activeStorefronts,
    pendingFlags,
    totalTransfers,
    totalPurchases,
    blacklistedTokens,
    blacklistedAddresses,
    lastProcessedBlock: indexerState?.lastProcessedBlock ?? 0,
  });
}
