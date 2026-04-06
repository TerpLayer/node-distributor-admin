import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const pageSize = 20;

  const where = status && status !== "all" ? { status } : {};

  const [flags, total] = await Promise.all([
    prisma.blacklistFlag.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.blacklistFlag.count({ where }),
  ]);

  return NextResponse.json({
    flags: flags.map((f) => ({
      ...f,
      detectedPrice: f.detectedPrice?.toString() ?? null,
      originalPrice: f.originalPrice.toString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
