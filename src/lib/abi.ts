// NodeSale contract ABI - matches contracts/NodeSale.sol
export const nodeSaleAbi = [
  // ── View functions ──
  {
    type: "function", name: "dailyLimit", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "dailySold", stateMutability: "view",
    inputs: [{ name: "day", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "currentDay", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "vipLevel", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function", name: "tokenPoolBalances", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }, { name: "poolId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "poolAllocBps", stateMutability: "view",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "tierRewardBps", stateMutability: "view",
    inputs: [{ name: "vipLevel", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "paused", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "NODE_PRICE", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "REFERRAL_REWARD_BPS", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "hasReferrer", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "claimableTierReward", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "claimablePoolReward", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }, { name: "poolId", type: "uint8" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "referrerOf", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function", name: "purchaseCount", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "directReferralCount", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "communityNodeCount", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "communityVipCount", stateMutability: "view",
    inputs: [{ name: "user", type: "address" }, { name: "level", type: "uint8" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "isBlacklisted", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "allowedTokens", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "platformWallet", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function", name: "poolConfig", stateMutability: "view",
    inputs: [{ name: "poolId", type: "uint8" }],
    outputs: [
      { name: "bps", type: "uint256" },
      { name: "minVipLevel", type: "uint8" },
    ],
  },
  {
    type: "function", name: "tierConfig", stateMutability: "view",
    inputs: [{ name: "vipLevel", type: "uint8" }],
    outputs: [
      { name: "rewardBps", type: "uint256" },
      { name: "requiredDirectReferrals", type: "uint256" },
      { name: "requiredCommunityNodes", type: "uint256" },
    ],
  },
  {
    type: "function", name: "setPlatformWallet", stateMutability: "nonpayable",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [],
  },
  {
    type: "function", name: "dailyRemaining", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },

  // ── Write functions (admin only) ──
  {
    type: "function", name: "setDailyLimit", stateMutability: "nonpayable",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function", name: "setBlacklist", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  {
    type: "function", name: "setAllowedToken", stateMutability: "nonpayable",
    inputs: [{ name: "token", type: "address" }, { name: "allowed", type: "bool" }],
    outputs: [],
  },
  {
    type: "function", name: "setPoolConfig", stateMutability: "nonpayable",
    inputs: [{ name: "allocBps", type: "uint256[3]" }],
    outputs: [],
  },
  {
    type: "function", name: "setTierRewardConfig", stateMutability: "nonpayable",
    inputs: [{ name: "rewardBps", type: "uint256[4]" }],
    outputs: [],
  },
  {
    type: "function", name: "setVipBatch", stateMutability: "nonpayable",
    inputs: [
      { name: "users", type: "address[]" },
      { name: "levels", type: "uint8[]" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "settlePool", stateMutability: "nonpayable",
    inputs: [{ name: "poolId", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function", name: "pause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  {
    type: "function", name: "unpause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },

  // ── Events ──
  {
    type: "event", name: "NodePurchased",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "referrer", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "price", type: "uint256", indexed: false },
      { name: "token", type: "address", indexed: false },
    ],
  },
  {
    type: "event", name: "ReferrerBound",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "referrer", type: "address", indexed: true },
    ],
  },
  {
    type: "event", name: "VipLevelUpdated",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "oldLevel", type: "uint8", indexed: false },
      { name: "newLevel", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event", name: "PoolSettled",
    inputs: [
      { name: "poolId", type: "uint8", indexed: true },
      { name: "totalAmount", type: "uint256", indexed: false },
      { name: "participants", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "Blacklisted",
    inputs: [
      { name: "account", type: "address", indexed: true },
      { name: "isBlacklisted", type: "bool", indexed: false },
    ],
  },
] as const;

export const erc20Abi = [
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "symbol", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function", name: "decimals", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint8" }],
  },
] as const;
