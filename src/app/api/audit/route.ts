import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AuditEntry {
  id: string;
  time: string;
  source: string;  // "chain" | "admin"
  action: string;
  actor: string;
  target: string;
  details: string | null;
  txHash: string | null;
  blockNumber: number | null;
}

export async function GET(req: NextRequest) {
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") || "1"));
  const source = req.nextUrl.searchParams.get("source") || "all";
  const pageSize = 30;

  const entries: AuditEntry[] = [];

  // Fetch from all relevant tables
  const [
    purchases,
    blacklistUpdates,
    commissionsClaimed,
    collectionsCreated,
    commissionEarnings,
    adminLogs,
    transfers,
  ] = await Promise.all([
    prisma.purchase.findMany({ orderBy: { blockNumber: "desc" }, take: 200 }),
    prisma.blacklistUpdate.findMany({ orderBy: { blockNumber: "desc" }, take: 200 }),
    prisma.commissionClaimed.findMany({ orderBy: { blockNumber: "desc" }, take: 200 }),
    prisma.collectionCreated.findMany({ orderBy: { blockNumber: "desc" }, take: 200 }),
    prisma.commissionEarning.findMany({ orderBy: { blockNumber: "desc" }, take: 200 }),
    prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.transfer.findMany({
      where: { from: { not: "0x0000000000000000000000000000000000000000" } },
      orderBy: { blockNumber: "desc" },
      take: 200,
    }),
  ]);

  // Purchases
  for (const p of purchases) {
    entries.push({
      id: `purchase-${p.id}`,
      time: p.timestamp.toISOString(),
      source: "chain",
      action: "purchase",
      actor: p.buyer,
      target: `Token #${p.tokenId}`,
      details: `${(Number(p.price) / 1e6).toFixed(2)} USDC, commission: ${(Number(p.commissionAmount) / 1e6).toFixed(2)}`,
      txHash: p.txHash,
      blockNumber: p.blockNumber,
    });
  }

  // Blacklist updates
  for (const b of blacklistUpdates) {
    const type = b.entityType === 0 ? "token" : "address";
    const target = b.entityType === 0 ? `Token #${b.entityId}` : b.entityAddress;
    entries.push({
      id: `blacklist-${b.id}`,
      time: b.timestamp.toISOString(),
      source: "chain",
      action: b.isBlacklisted ? `blacklist_add_${type}` : `blacklist_remove_${type}`,
      actor: "owner",
      target,
      details: b.isBlacklisted ? "Added to blacklist" : "Removed from blacklist",
      txHash: b.txHash,
      blockNumber: b.blockNumber,
    });
  }

  // Commission claimed
  for (const c of commissionsClaimed) {
    entries.push({
      id: `claim-${c.id}`,
      time: c.timestamp.toISOString(),
      source: "chain",
      action: "commission_claim",
      actor: c.claimant,
      target: `${(Number(c.amount) / 1e6).toFixed(2)} USDC`,
      details: null,
      txHash: c.txHash,
      blockNumber: c.blockNumber,
    });
  }

  // Collections created
  for (const col of collectionsCreated) {
    entries.push({
      id: `collection-${col.id}`,
      time: col.timestamp.toISOString(),
      source: "chain",
      action: "collection_created",
      actor: col.creator,
      target: `Collection #${col.collectionId}`,
      details: col.metadataURI.length > 60 ? col.metadataURI.slice(0, 60) + "..." : col.metadataURI,
      txHash: col.txHash,
      blockNumber: col.blockNumber,
    });
  }

  // Commission earnings
  for (const e of commissionEarnings) {
    entries.push({
      id: `earning-${e.id}`,
      time: e.timestamp.toISOString(),
      source: "chain",
      action: "commission_earned",
      actor: e.distributor,
      target: `Token #${e.tokenId} (T${e.tier})`,
      details: `${(Number(e.amount) / 1e6).toFixed(4)} USDC`,
      txHash: e.txHash,
      blockNumber: e.blockNumber,
    });
  }

  // P2P transfers (non-mint)
  for (const t of transfers) {
    entries.push({
      id: `transfer-${t.id}`,
      time: t.timestamp.toISOString(),
      source: "chain",
      action: "transfer",
      actor: t.from,
      target: `→ ${t.to} Token #${t.tokenId} x${t.amount}`,
      details: t.isBatch ? "batch" : null,
      txHash: t.txHash,
      blockNumber: t.blockNumber,
    });
  }

  // Admin panel logs
  for (const a of adminLogs) {
    entries.push({
      id: `admin-${a.id}`,
      time: a.createdAt.toISOString(),
      source: "admin",
      action: a.action,
      actor: a.adminAddr,
      target: a.target,
      details: a.details,
      txHash: a.txHash,
      blockNumber: null,
    });
  }

  // Filter by source
  const filtered = source === "all" ? entries : entries.filter((e) => e.source === source);

  // Sort by time descending
  filtered.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // Paginate
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    logs: paged,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  });
}
