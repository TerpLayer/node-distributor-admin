import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const type = req.nextUrl.searchParams.get("type") || "all";
  const search = req.nextUrl.searchParams.get("search") || "";
  const pageSize = 30;

  if (type === "transfers") {
    const where = search
      ? { OR: [{ from: { contains: search, mode: "insensitive" as const } }, { to: { contains: search, mode: "insensitive" as const } }, { txHash: { contains: search, mode: "insensitive" as const } }] }
      : {};
    const [items, total] = await Promise.all([
      prisma.transfer.findMany({ where, orderBy: { blockNumber: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.transfer.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / pageSize), type: "transfers" });
  }

  if (type === "purchases") {
    const where = search
      ? { OR: [{ buyer: { contains: search, mode: "insensitive" as const } }, { seller: { contains: search, mode: "insensitive" as const } }, { txHash: { contains: search, mode: "insensitive" as const } }] }
      : {};
    const [items, total] = await Promise.all([
      prisma.purchase.findMany({ where, orderBy: { blockNumber: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.purchase.count({ where }),
    ]);
    return NextResponse.json({
      items: items.map((p) => ({ ...p, price: p.price.toString(), commissionAmount: p.commissionAmount.toString() })),
      total, page, totalPages: Math.ceil(total / pageSize), type: "purchases",
    });
  }

  if (type === "commissions") {
    const where = search
      ? { OR: [{ claimant: { contains: search, mode: "insensitive" as const } }, { txHash: { contains: search, mode: "insensitive" as const } }] }
      : {};
    const [items, total] = await Promise.all([
      prisma.commissionClaimed.findMany({ where, orderBy: { blockNumber: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.commissionClaimed.count({ where }),
    ]);
    return NextResponse.json({
      items: items.map((c) => ({ ...c, amount: c.amount.toString() })),
      total, page, totalPages: Math.ceil(total / pageSize), type: "commissions",
    });
  }

  if (type === "collections") {
    const where = search
      ? { OR: [{ creator: { contains: search, mode: "insensitive" as const } }, { collectionId: { contains: search } }] }
      : {};
    const [items, total] = await Promise.all([
      prisma.collectionCreated.findMany({ where, orderBy: { blockNumber: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.collectionCreated.count({ where }),
    ]);
    return NextResponse.json({ items, total, page, totalPages: Math.ceil(total / pageSize), type: "collections" });
  }

  // "all" - recent activity across all types
  const [transfers, purchases, commissions] = await Promise.all([
    prisma.transfer.findMany({ orderBy: { blockNumber: "desc" }, take: 10 }),
    prisma.purchase.findMany({ orderBy: { blockNumber: "desc" }, take: 10 }),
    prisma.commissionClaimed.findMany({ orderBy: { blockNumber: "desc" }, take: 10 }),
  ]);

  const merged = [
    ...transfers.map((t) => ({ ...t, _type: "transfer" as const })),
    ...purchases.map((p) => ({ ...p, price: p.price.toString(), commissionAmount: p.commissionAmount.toString(), _type: "purchase" as const })),
    ...commissions.map((c) => ({ ...c, amount: c.amount.toString(), _type: "commission" as const })),
  ].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 30);

  return NextResponse.json({ items: merged, total: merged.length, page: 1, totalPages: 1, type: "all" });
}
