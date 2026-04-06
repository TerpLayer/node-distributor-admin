import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { bepoliaTestnet } from "@/lib/chain";
import { nftDistributionAbi } from "@/lib/abi";

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const target = req.nextUrl.searchParams.get("target");

  if (!type || !target) {
    return NextResponse.json({ error: "Missing type and target" }, { status: 400 });
  }

  const client = createPublicClient({ chain: bepoliaTestnet, transport: http() });

  try {
    if (type === "token") {
      const isBlacklisted = await client.readContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "blacklistedTokens",
        args: [BigInt(target)],
      });
      return NextResponse.json({ type, target, isBlacklisted });
    } else {
      const isBlacklisted = await client.readContract({
        address: CONTRACT,
        abi: nftDistributionAbi,
        functionName: "blacklistedAddresses",
        args: [target as `0x${string}`],
      });
      return NextResponse.json({ type, target, isBlacklisted });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message?.slice(0, 200) }, { status: 500 });
  }
}
