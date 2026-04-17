import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { nodeSaleAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS, PAYMENT_TOKEN, getChainConfig, publicClient } from "@/lib/chain";

const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as `0x${string}` | undefined;

function getWalletClient() {
  if (!PRIVATE_KEY) {
    throw new Error("ADMIN_PRIVATE_KEY 未配置，无法执行链上写入");
  }

  const account = privateKeyToAccount(PRIVATE_KEY);
  const config = getChainConfig();

  return createWalletClient({
    account,
    chain: config.chain,
    transport: http(config.chain.rpcUrls.default.http[0]),
  });
}

async function readConfig() {
  const contract = { address: CONTRACT_ADDRESS, abi: nodeSaleAbi } as const;

  const [dailyLimit, dailyRemaining, paused, platformWallet, tokenAllowed] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "dailyLimit" }),
    publicClient.readContract({ ...contract, functionName: "dailyRemaining" }),
    publicClient.readContract({ ...contract, functionName: "paused" }),
    publicClient.readContract({ ...contract, functionName: "platformWallet" }),
    publicClient.readContract({ ...contract, functionName: "allowedTokens", args: [PAYMENT_TOKEN] }),
  ]);

  const [poolV1, poolV2, poolV3, vip0, vip1, vip2, vip3] = await Promise.all([
    publicClient.readContract({ ...contract, functionName: "poolAllocBps", args: [0n] }),
    publicClient.readContract({ ...contract, functionName: "poolAllocBps", args: [1n] }),
    publicClient.readContract({ ...contract, functionName: "poolAllocBps", args: [2n] }),
    publicClient.readContract({ ...contract, functionName: "tierRewardBps", args: [0n] }),
    publicClient.readContract({ ...contract, functionName: "tierRewardBps", args: [1n] }),
    publicClient.readContract({ ...contract, functionName: "tierRewardBps", args: [2n] }),
    publicClient.readContract({ ...contract, functionName: "tierRewardBps", args: [3n] }),
  ]);

  return {
    dailyLimit: Number(dailyLimit),
    dailyRemaining: Number(dailyRemaining),
    paused: Boolean(paused),
    platformWallet,
    paymentToken: PAYMENT_TOKEN,
    paymentTokenAllowed: Boolean(tokenAllowed),
    poolAllocation: [Number(poolV1), Number(poolV2), Number(poolV3)],
    tierRewardBps: [Number(vip0), Number(vip1), Number(vip2), Number(vip3)],
  };
}

export async function GET() {
  try {
    return NextResponse.json(await readConfig());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "读取配置失败" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const walletClient = getWalletClient();

    let hash: `0x${string}`;

    switch (body.action) {
      case "setDailyLimit": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "setDailyLimit",
          args: [BigInt(body.dailyLimit)],
        });
        break;
      }
      case "setPoolConfig": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "setPoolConfig",
          args: [[BigInt(body.poolAllocation[0]), BigInt(body.poolAllocation[1]), BigInt(body.poolAllocation[2])]],
        });
        break;
      }
      case "setTierRewardConfig": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "setTierRewardConfig",
          args: [[0n, BigInt(body.tierRewardBps[1]), BigInt(body.tierRewardBps[2]), BigInt(body.tierRewardBps[3])]],
        });
        break;
      }
      case "setAllowedToken": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "setAllowedToken",
          args: [PAYMENT_TOKEN, Boolean(body.allowed)],
        });
        break;
      }
      case "setPlatformWallet": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "setPlatformWallet",
          args: [body.platformWallet],
        });
        break;
      }
      case "pause": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "pause",
          args: [],
        });
        break;
      }
      case "unpause": {
        hash = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: nodeSaleAbi,
          functionName: "unpause",
          args: [],
        });
        break;
      }
      default:
        return NextResponse.json({ error: "不支持的操作" }, { status: 400 });
    }

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      ok: true,
      hash,
      blockNumber: receipt.blockNumber.toString(),
      config: await readConfig(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "配置写入失败" },
      { status: 500 },
    );
  }
}