#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACT_DIR="/tmp/node-distributor-system"
HARDHAT_RPC="http://127.0.0.1:8545"
ADMIN_APP_PORT="3003"

export PATH="$HOME/.nvm/versions/node/v24.11.1/bin:$PATH"

echo "[1/4] Checking local Hardhat node..."
if ! curl -sSf "$HARDHAT_RPC" >/dev/null 2>&1; then
  echo "Hardhat node is not running. Starting it in background..."
  nohup bash -lc "cd '$CONTRACT_DIR' && export PATH='$PATH' && npx hardhat node" > /tmp/node-store-hardhat.log 2>&1 &

  for _ in $(seq 1 30); do
    if curl -sSf "$HARDHAT_RPC" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

if ! curl -sSf "$HARDHAT_RPC" >/dev/null 2>&1; then
  echo "Failed to start Hardhat node. Check /tmp/node-store-hardhat.log"
  exit 1
fi

echo "[2/4] Deploying local contracts..."
cd "$CONTRACT_DIR"
npx hardhat run scripts/deploy-local.ts --network localhost >/tmp/node-store-deploy.log 2>&1 || {
  cat /tmp/node-store-deploy.log
  exit 1
}

echo "[3/4] Checking admin env file..."
if [[ ! -f "$ROOT_DIR/.env.local" ]]; then
  echo "Missing $ROOT_DIR/.env.local"
  exit 1
fi

echo "[4/4] Starting admin app on port $ADMIN_APP_PORT..."
if curl -sSf "http://127.0.0.1:${ADMIN_APP_PORT}" >/dev/null 2>&1; then
  echo "Admin app is already running at http://127.0.0.1:${ADMIN_APP_PORT}"
  exit 0
fi

cd "$ROOT_DIR"
exec npm run dev