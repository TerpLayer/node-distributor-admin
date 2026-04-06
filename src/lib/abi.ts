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
