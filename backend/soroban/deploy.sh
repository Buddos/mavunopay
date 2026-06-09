#!/bin/bash
# MavunoPay Soroban Contract Deployment Script
# This script builds and deploys the allocation contract to Stellar testnet

set -e

echo "========================================="
echo "MavunoPay Soroban Contract Deployment"
echo "========================================="

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust/Cargo not found. Install from https://rustup.rs/"
    exit 1
fi

# Check if soroban-cli is installed
if ! command -v soroban &> /dev/null; then
    echo "⚠️ soroban-cli not found. Installing..."
    cargo install soroban-cli
fi

cd backend/soroban

echo "📦 Building Soroban contract..."
cargo build --release --target wasm32-unknown-unknown

WASM_PATH="target/wasm32-unknown-unknown/release/mavunopay_allocation_contract.wasm"

if [ ! -f "$WASM_PATH" ]; then
    echo "❌ Build failed: $WASM_PATH not found"
    exit 1
fi

echo "✅ Contract built successfully"
echo "📊 WASM size: $(du -h $WASM_PATH | cut -f1)"

# Run tests
echo ""
echo "🧪 Running contract tests..."
cargo test --lib

echo ""
echo "========================================="
echo "Contract Deployment Instructions"
echo "========================================="
echo ""
echo "1️⃣ Set your Stellar network:"
echo "   export SOROBAN_RPC_URL=https://soroban-testnet.stellar.org:443"
echo ""
echo "2️⃣ Deploy to testnet (requires funded ops account):"
echo "   soroban contract deploy \\"
echo "     --wasm $WASM_PATH \\"
echo "     --source <your-public-key> \\"
echo "     --network testnet"
echo ""
echo "3️⃣ Copy the returned CONTRACT_ID to .env:"
echo "   SOROBAN_CONTRACT_ID=CAAAA..."
echo ""
echo "4️⃣ Test contract invocation:"
echo "   curl -X POST http://localhost:3001/api/webhook \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"publicKey\":\"G...\",\"amount\":1000,\"contractId\":\"C...\"}'"
echo ""
echo "========================================="
