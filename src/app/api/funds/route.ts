import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Held funds totals grouped by payment token
  const heldByToken = await prisma.wholesaleTransaction.groupBy({
    by: ["paymentToken"],
    _sum: {
      totalPrice: true,
      rebateAmount: true,
      heldAmount: true,
    },
    _count: {
      id: true,
    },
  });

  // Recent wholesale transactions
  const recentTransactions = await prisma.wholesaleTransaction.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    select: {
      id: true,
      txHash: true,
      blockNumber: true,
      buyer: true,
      tokenId: true,
      tokenIds: true,
      amounts: true,
      paymentToken: true,
      totalPrice: true,
      rebateAmount: true,
      heldAmount: true,
      isBatch: true,
      timestamp: true,
    },
  });

  // Safe transactions
  const safeTransactions = await prisma.safeTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Cost settlement totals
  const costTotals = await prisma.costSettlement.aggregate({
    _sum: {
      initialCost: true,
      fixedCost: true,
      distributionPool: true,
      sellerProfit: true,
    },
    _count: {
      id: true,
    },
  });

  return NextResponse.json({
    heldByToken: heldByToken.map((h) => ({
      paymentToken: h.paymentToken,
      totalVolume: h._sum.totalPrice?.toString() ?? "0",
      totalRebate: h._sum.rebateAmount?.toString() ?? "0",
      totalHeld: h._sum.heldAmount?.toString() ?? "0",
      transactionCount: h._count.id,
    })),
    recentTransactions: recentTransactions.map((tx) => ({
      ...tx,
      totalPrice: tx.totalPrice.toString(),
      rebateAmount: tx.rebateAmount.toString(),
      heldAmount: tx.heldAmount.toString(),
    })),
    safeTransactions: safeTransactions.map((tx) => ({
      ...tx,
      executedAt: tx.executedAt?.toISOString() ?? null,
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    })),
    costTotals: {
      initialCost: costTotals._sum.initialCost?.toString() ?? "0",
      fixedCost: costTotals._sum.fixedCost?.toString() ?? "0",
      distributionPool: costTotals._sum.distributionPool?.toString() ?? "0",
      sellerProfit: costTotals._sum.sellerProfit?.toString() ?? "0",
      count: costTotals._count.id,
    },
  });
}
