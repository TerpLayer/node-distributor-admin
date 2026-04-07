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
    // L1/V3 metrics
    wholesaleVolume,
    wholesaleRebates,
    wholesaleHeld,
    wholesaleL2Count,
    costSettlementTotals,
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
    // Wholesale metrics
    prisma.wholesaleTransaction.aggregate({ _sum: { totalPrice: true } }),
    prisma.wholesaleTransaction.aggregate({ _sum: { rebateAmount: true } }),
    prisma.wholesaleTransaction.aggregate({ _sum: { heldAmount: true } }),
    prisma.wholesaleTransaction.findMany({ select: { buyer: true }, distinct: ["buyer"] }).then((r) => r.length),
    prisma.costSettlement.aggregate({
      _sum: { initialCost: true, distributionPool: true, fixedCost: true, sellerProfit: true },
    }),
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
    // L1/V3 metrics
    wholesaleVolume: wholesaleVolume._sum.totalPrice?.toString() ?? "0",
    wholesaleRebates: wholesaleRebates._sum.rebateAmount?.toString() ?? "0",
    wholesaleHeldFunds: wholesaleHeld._sum.heldAmount?.toString() ?? "0",
    l2Count: wholesaleL2Count,
    costSettlementInitialCost: costSettlementTotals._sum.initialCost?.toString() ?? "0",
    costSettlementDistPool: costSettlementTotals._sum.distributionPool?.toString() ?? "0",
    costSettlementFixedCost: costSettlementTotals._sum.fixedCost?.toString() ?? "0",
    costSettlementSellerProfit: costSettlementTotals._sum.sellerProfit?.toString() ?? "0",
  });
}
