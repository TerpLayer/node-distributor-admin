import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Get wholesale transactions grouped by buyer (L2s)
  const l2Stats = await prisma.wholesaleTransaction.groupBy({
    by: ["buyer"],
    _sum: {
      totalPrice: true,
      rebateAmount: true,
      heldAmount: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        totalPrice: "desc",
      },
    },
  });

  // Get last transaction per buyer
  const lastTxByBuyer = await prisma.wholesaleTransaction.findMany({
    orderBy: { timestamp: "desc" },
    distinct: ["buyer"],
    select: {
      buyer: true,
      timestamp: true,
      txHash: true,
    },
  });

  const lastTxMap = new Map(lastTxByBuyer.map((tx) => [tx.buyer, tx]));

  const l2s = l2Stats.map((stat) => {
    const lastTx = lastTxMap.get(stat.buyer);
    return {
      address: stat.buyer,
      totalVolume: stat._sum.totalPrice?.toString() ?? "0",
      totalRebate: stat._sum.rebateAmount?.toString() ?? "0",
      totalHeld: stat._sum.heldAmount?.toString() ?? "0",
      transactionCount: stat._count.id,
      lastActivity: lastTx?.timestamp ?? null,
      lastTxHash: lastTx?.txHash ?? null,
    };
  });

  return NextResponse.json({ l2s });
}
