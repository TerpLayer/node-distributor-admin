import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { bepoliaTestnet } from "@/lib/chain";
import { nftDistributionAbi } from "@/lib/abi";
import { prisma } from "@/lib/prisma";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export async function POST(req: NextRequest) {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "ADMIN_PRIVATE_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { type, target, blacklisted } = body as {
    type: "token" | "address";
    target: string;
    blacklisted: boolean;
  };

  if (!type || !target || typeof blacklisted !== "boolean") {
    return NextResponse.json({ error: "Missing required fields: type, target, blacklisted" }, { status: 400 });
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: bepoliaTestnet,
    transport: http(),
  });
  const publicClient = createPublicClient({
    chain: bepoliaTestnet,
    transport: http(),
  });

  try {
    let txHash: `0x${string}`;

    if (type === "token") {
      const tokenId = BigInt(target);
      // Check current status
      const currentStatus = await publicClient.readContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "blacklistedTokens",
        args: [tokenId],
      });
      if (currentStatus === blacklisted) {
        return NextResponse.json({
          error: `Token ${target} already ${blacklisted ? "blacklisted" : "not blacklisted"}`,
        }, { status: 400 });
      }

      txHash = await walletClient.writeContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "setTokenBlacklist",
        args: [tokenId, blacklisted],
      });
    } else {
      if (!/^0x[a-fA-F0-9]{40}$/.test(target)) {
        return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
      }
      // Check current status
      const currentStatus = await publicClient.readContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "blacklistedAddresses",
        args: [target as `0x${string}`],
      });
      if (currentStatus === blacklisted) {
        return NextResponse.json({
          error: `Address ${target} already ${blacklisted ? "blacklisted" : "not blacklisted"}`,
        }, { status: 400 });
      }

      txHash = await walletClient.writeContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "setAddressBlacklist",
        args: [target as `0x${string}`, blacklisted],
      });
    }

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    // Log audit
    await prisma.adminAuditLog.create({
      data: {
        adminAddr: account.address,
        action: blacklisted ? "blacklist_add" : "blacklist_remove",
        target: `${type}:${target}`,
        details: JSON.stringify({ type, target, blacklisted }),
        txHash,
      },
    });

    return NextResponse.json({
      success: true,
      txHash,
      blockNumber: Number(receipt.blockNumber),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message?.slice(0, 200) || "Transaction failed" }, { status: 500 });
  }
}
