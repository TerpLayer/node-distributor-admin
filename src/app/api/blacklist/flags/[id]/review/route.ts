import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { action, reviewerAddress } = body;

  if (!["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const flag = await prisma.blacklistFlag.update({
    where: { id: Number(id) },
    data: {
      status: action,
      reviewedAt: new Date(),
      reviewedBy: reviewerAddress,
    },
  });

  // Log audit
  await prisma.adminAuditLog.create({
    data: {
      adminAddr: reviewerAddress || "unknown",
      action: `flag_${action}`,
      target: `flag:${id}`,
      details: JSON.stringify({ tokenId: flag.tokenId, from: flag.fromAddress, to: flag.toAddress }),
    },
  });

  return NextResponse.json({ success: true, flag });
}
