# AgentPay — AI Agents That Act & Pay on Solana

> Deploy intelligent AI agents that execute tasks, make real payments in CASH stablecoin, and operate autonomously on Solana — while you stay in full control.

Built for **Solana Frontier Hackathon 2026**

## 🚀 Live Demo
- **Devnet Transaction**: [4PkABpXPFnZdztGgkzhtrxeuQRkj5yCKxG8fsNVi6o9uPDhSbL7kSh1PbMxy1BTBPrSmPACmKqPVYKWcZX1BUmuQ](https://explorer.solana.com/tx/4PkABpXPFnZdztGgkzhtrxeuQRkj5yCKxG8fsNVi6o9uPDhSbL7kSh1PbMxy1BTBPrSmPACmKqPVYKWcZX1BUmuQ?cluster=devnet)

## 🎯 Problem
AI agents today can think but cannot act in the real world. They cannot pay, cannot be verified, and users cannot trust that a human — not a bot farm — is in control.

## ✅ Solution
AgentPay enables anyone to deploy AI agents that:
- **Execute real Solana transactions** autonomously
- **Spend CASH stablecoin** within user-defined budgets
- **Prove human control** via World ID verification
- **Log every action** on-chain with full transparency

## 🏗 Architecture
User → Phantom Wallet → AgentPay Dashboard
↓
AI Agent (Claude via DGrid)
↓
Solana Devnet → Real Transactions
## 🛠 Tech Stack
- **Frontend**: Next.js 16 + TypeScript + Tailwind
- **Blockchain**: Solana Web3.js + Phantom Wallet Adapter
- **AI**: Claude (via DGrid AI Gateway)
- **Identity**: World ID (Proof of Human)
- **State**: Zustand

## 🎯 Sponsor Integrations
| Sponsor | Integration |
|---------|------------|
| **Phantom** | Wallet connection + transaction signing |
| **World ID** | Human verification for agents |
| **Metaplex** | On-chain agent identity (NFT) |
| **Swig** | Smart wallet with spending limits |

## 🚦 Getting Started

```bash
git clone https://github.com/muhamedag2022/agentpay.git
cd agentpay
npm install
cp .env.example .env.local
# Add your DGRID_API_KEY
npm run dev
```

## 📋 Environment Variables
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
DGRID_API_KEY=your_key_here
DGRID_BASE_URL=https://api.dgrid.ai/v1
NEXT_PUBLIC_WLD_APP_ID=your_world_id_app
NEXT_PUBLIC_WLD_ACTION=verify-human
## 💡 Use Cases
1. **Freelancer Payments** — Agent pays automatically when work is delivered
2. **DCA Bot** — Buy SOL/tokens on schedule within budget
3. **AI Assistant with Budget** — Assistant that can pay for services

## 🏆 Hackathon
Solana Frontier Hackathon 2026 | Team: @Simowolf369
