export const nftDistributionAbi = [
  // View functions
  {
    type: "function", name: "collections", stateMutability: "view",
    inputs: [{ name: "collectionId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "metadataURI", type: "string" },
      { name: "paymentToken", type: "address" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function", name: "tokenConfigs", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "collectionId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "maxSupply", type: "uint256" },
      { name: "totalMinted", type: "uint256" },
    ],
  },
  {
    type: "function", name: "platformWallet", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function", name: "blacklistedTokens", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "blacklistedAddresses", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "nextTokenId", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "nextCollectionId", stateMutability: "view",
    inputs: [], outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "claimableBalances", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }, { name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Write functions (admin only)
  {
    type: "function", name: "setTokenBlacklist", stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  {
    type: "function", name: "setAddressBlacklist", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  // Events
  {
    type: "event", name: "BlacklistUpdated",
    inputs: [
      { name: "entityType", type: "uint8", indexed: false },
      { name: "entityId", type: "uint256", indexed: false },
      { name: "entityAddress", type: "address", indexed: false },
      { name: "isBlacklisted", type: "bool", indexed: false },
    ],
  },
  {
    type: "event", name: "Purchase",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
      { name: "commissionAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

// --- V3 Contract ABI (extends base with cost settlement, multi-token, pausable) ---
export const nftDistributionV3Abi = [
  // V3 Config functions
  {
    type: "function", name: "setCostConfig", stateMutability: "nonpayable",
    inputs: [
      { name: "collectionId", type: "uint256" },
      { name: "initialCostFixed", type: "uint256" },
      { name: "distributionPoolFixed", type: "uint256" },
      { name: "fixedCostFixed", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "setRetailPrice", stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }, { name: "price", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function", name: "setAllowedToken", stateMutability: "nonpayable",
    inputs: [{ name: "token", type: "address" }, { name: "allowed", type: "bool" }],
    outputs: [],
  },
  // V3 Purchase
  {
    type: "function", name: "purchase", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "referrer", type: "address" },
      { name: "paymentToken", type: "address" },
    ],
    outputs: [],
  },
  // V3 View functions
  {
    type: "function", name: "costConfigs", stateMutability: "view",
    inputs: [{ name: "collectionId", type: "uint256" }],
    outputs: [
      { name: "initialCostFixed", type: "uint256" },
      { name: "distributionPoolFixed", type: "uint256" },
      { name: "fixedCostFixed", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function", name: "retailPrices", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "allowedTokens", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "heldCosts", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "L1_AUTHORITY_ROLE", stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  // V3 Authority functions
  {
    type: "function", name: "pause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  {
    type: "function", name: "unpause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  {
    type: "function", name: "setAddressBlacklistByAuthority", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  // V3 Events
  {
    type: "event", name: "CostSettled",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "initialCost", type: "uint256", indexed: false },
      { name: "distributionPool", type: "uint256", indexed: false },
      { name: "fixedCost", type: "uint256", indexed: false },
      { name: "sellerProfit", type: "uint256", indexed: false },
    ],
  },
] as const;

// --- L1 Contract ABI (wholesale hub) ---
export const nftDistributionL1Abi = [
  // Purchase functions
  {
    type: "function", name: "wholesalePurchase", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "paymentToken", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "wholesalePurchaseBatch", stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIds", type: "uint256[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "paymentToken", type: "address" },
    ],
    outputs: [],
  },
  // L2 Registry
  {
    type: "function", name: "registerL2", stateMutability: "nonpayable",
    inputs: [{ name: "l2Contract", type: "address" }],
    outputs: [],
  },
  {
    type: "function", name: "deregisterL2", stateMutability: "nonpayable",
    inputs: [{ name: "l2Contract", type: "address" }],
    outputs: [],
  },
  // Propagation
  {
    type: "function", name: "propagateBlacklist", stateMutability: "nonpayable",
    inputs: [{ name: "account", type: "address" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  {
    type: "function", name: "propagateTokenBlacklist", stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }, { name: "blacklisted", type: "bool" }],
    outputs: [],
  },
  {
    type: "function", name: "propagatePause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  {
    type: "function", name: "propagateUnpause", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  // Admin
  {
    type: "function", name: "withdrawHeldFunds", stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "recipient", type: "address" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "setYieldPool", stateMutability: "nonpayable",
    inputs: [{ name: "pool", type: "address" }],
    outputs: [],
  },
  // View functions
  {
    type: "function", name: "heldFunds", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "registeredL2s", stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function", name: "getRegisteredL2Count", stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function", name: "isRegisteredL2", stateMutability: "view",
    inputs: [{ name: "l2Contract", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "yieldPool", stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function", name: "allowedTokens", stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function", name: "wholesaleConfigs", stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "price", type: "uint256" },
      { name: "maxSupply", type: "uint256" },
      { name: "totalMinted", type: "uint256" },
      { name: "metadataURI", type: "string" },
      { name: "active", type: "bool" },
    ],
  },
  // Events
  {
    type: "event", name: "WholesalePurchase",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "paymentToken", type: "address", indexed: false },
      { name: "totalPrice", type: "uint256", indexed: false },
      { name: "rebateAmount", type: "uint256", indexed: false },
      { name: "heldAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "WholesalePurchaseBatch",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "tokenIds", type: "uint256[]", indexed: false },
      { name: "amounts", type: "uint256[]", indexed: false },
      { name: "paymentToken", type: "address", indexed: false },
      { name: "totalPrice", type: "uint256", indexed: false },
      { name: "rebateAmount", type: "uint256", indexed: false },
      { name: "heldAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "L2Registered",
    inputs: [{ name: "l2Contract", type: "address", indexed: true }],
  },
  {
    type: "event", name: "L2Deregistered",
    inputs: [{ name: "l2Contract", type: "address", indexed: true }],
  },
  {
    type: "event", name: "BlacklistPropagated",
    inputs: [
      { name: "l2Contract", type: "address", indexed: true },
      { name: "account", type: "address", indexed: true },
      { name: "blacklisted", type: "bool", indexed: false },
      { name: "success", type: "bool", indexed: false },
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
