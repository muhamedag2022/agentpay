# AgentPay — AI Agents That Act & Pay on Solana

> Deploy intelligent AI agents that execute tasks, make real USDC payments, and operate autonomously on Solana — while you stay in full control.

Built for **Solana Frontier Hackathon 2026** | Deadline: May 10, 2026

---

## 🚀 Features

### 🤖 AI Agent Deployment
- Create agents with natural language task descriptions
- AI planner generates execution plan using Claude Haiku via DGrid AI Gateway
- 3-step wizard: Identity → Task → Review & Deploy

### 💸 Autonomous USDC Payments
- Agents send real USDC on Solana devnet using SPL Token transfer
- Idempotent token account creation (handles recipients without existing ATA)
- Falls back to SOL lamports transfer when USDC account missing
- Configurable budget — agent stops when budget exhausted

### 🔐 Session Keys (No Phantom Popups)
- One Phantom approval sets up a session keypair
- Auto-execution runs every 30 seconds — **no popups**
- Session key funded with 0.005 SOL, stored in localStorage
- Perfect for DCAs, scheduled payments, monitoring agents

### 🪪 World ID Human Verification
- Orb-based proof of humanity verification
- Agents cannot run until human verification is complete
- Privacy-preserving — biometrics never leave device

### 📝 On-Chain Agent Identity
- Agent deployment recorded via Solana Memo program
- Every action logged with timestamp, result, and tx signature
- Full audit trail visible in activity log

---

## 🏗 Architecture

```
User connects Phantom Wallet
         ↓
┌─────────────────────────────┐
│   AgentPay Dashboard        │
│   (Next.js 16 + Zustand)    │
└────────────┬────────────────┘
             ↓
   ┌─────────────┐     ┌──────────────┐
   │ DGrid AI    │     │ Session Keys │
   │ Gateway     │     │ (localStorage)│
   │ (Claude)    │     └──────────────┘
   └─────────────┘
             ↓
   ┌─────────────────────────┐
   │   Solana Devnet          │
   │   • USDC transfers       │
   │   • Agent accounts       │
   │   • Memo program txs     │
   └─────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 + TypeScript + Zustand |
| **Blockchain** | Solana Web3.js + SPL Token + Phantom Adapter |
| **AI** | Claude Haiku via DGrid AI Gateway |
| **Identity** | World ID (Orb verification) |
| **State Persistence** | Zustand + localStorage |

---

## 🎯 Sponsor Integrations

| Sponsor | Integration |
|---------|-------------|
| **Phantom** | Wallet connection, tx signing, session key funding |
| **World ID** | Human verification before agent activation |
| **Metaplex** | On-chain agent identity (Core NFT) |
| **Swig** | Session keypairs — silent auto-execution model |

---

## 🚦 Quick Start

```bash
git clone https://github.com/muhamedag2022/agentpay.git
cd agentpay
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
DGRID_API_KEY=your_dgrid_api_key
DGRID_BASE_URL=https://api.dgrid.ai/v1
NEXT_PUBLIC_WLD_APP_ID=app_staging_test
NEXT_PUBLIC_WLD_ACTION=verify-human
```

```bash
npm run dev
```

Visit `http://localhost:3000`, connect Phantom wallet, and deploy your first agent.

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `src/store/agentStore.ts` | Zustand store with persist middleware |
| `src/app/dashboard/page.tsx` | Main UI — agent list, detail, create form |
| `src/lib/executeTask.ts` | USDC/SOL dual-path transaction executor |
| `src/lib/sessionExecutor.ts` | Session key auto-execution |
| `src/lib/mintNFT.ts` | On-chain agent identity via Memo program |
| `src/app/api/agent/route.ts` | DGrid AI Gateway → Claude Haiku planner |

---

## 💡 Use Cases

1. **DCA Bot** — Agent buys USDC/SOL on schedule within budget
2. **Freelancer Payment** — Auto-releases payment when work delivered
3. **Subscription Manager** — Recurring USDC payments to service providers
4. **AI Assistant with Budget** — GPT/Claude agent that can pay for services autonomously

---

## 📡 API

**AI Planner** (`POST /api/agent`)

```json
{
  "action": "plan",
  "taskType": "send_payment",
  "description": "Send $5 USDC every Monday",
  "budget": 100,
  "amount": 5,
  "condition": "every Monday 9am",
  "recipient": "Solana_address_here"
}
```

Uses `anthropic/claude-3-haiku` via DGrid AI Gateway.

---

## 🔗 Links

- **GitHub**: [github.com/muhamedag2022/agentpay](https://github.com/muhamedag2022/agentpay)
- **Devnet**: `https://api.devnet.solana.com`
- **Solana Explorer**: [explorer.solana.com](https://explorer.solana.com)

---

## 🏆 Hackathon

**Solana Frontier Hackathon 2026**
- Track: Consumer / DeFi / DAO / Payments
- Team: @Simowolf369
- Devnet only — no mainnet