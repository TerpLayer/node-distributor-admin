import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const entityType = req.nextUrl.searchParams.get("type"); // "token" | "address"
  const pageSize = 20;

  const where = entityType === "token" ? { entityType: 0 } : entityType === "address" ? { entityType: 1 } : {};

  const [updates, total] = await Promise.all([
    prisma.blacklistUpdate.findMany({
      where,
      orderBy: { blockNumber: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blacklistUpdate.count({ where }),
  ]);

  return NextResponse.json({ updates, total, page, totalPages: Math.ceil(total / pageSize) });
}
