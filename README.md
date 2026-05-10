# AgentPay — AI Agents That Act & Pay on Solana

> Deploy intelligent AI agents that execute tasks, make real USDC payments, and operate autonomously on Solana — while you stay in full control.

Built for **Solana Frontier Hackathon 2026** | Deadline: May 10, 2026

---
## 🔗 Quick Links
* **Live Demo:** [agentpay-eta.vercel.app](https://agentpay-eta.vercel.app)
* **Video Walkthrough:** [Watch on YouTube](https://youtu.be/RCl9f3fYpXY)
* **GitHub:** [github.com/muhamedag2022/agentpay](https://github.com/muhamedag2022/agentpay)
---

## Features

### AI Agent Deployment
- Create agents with natural language task descriptions
- AI planner generates execution plan using Claude Haiku via DGrid AI Gateway
- 3-step wizard: Identity → Task → Review & Deploy

### Autonomous USDC Payments
- Agents send real USDC on Solana devnet using SPL Token transfer
- Idempotent token account creation (handles recipients without existing ATA)
- Falls back to SOL lamports transfer when USDC account missing
- Configurable budget — agent stops when budget exhausted

### Session Keys (No Phantom Popups)
- One Phantom approval sets up a session keypair via Swig
- Auto-execution runs every 30 seconds — **no popups**
- Session key funded with 0.05 SOL, stored in localStorage
- Perfect for DCAs, scheduled payments, monitoring agents

### World ID Human Verification
- **World ID 4.0** via IDKit v4 with `IDKitRequestWidget`
- Orb-based proof of humanity verification
- `orbLegacy` preset — accepts both v3 and v4 proofs
- Staging mode → simulator at `https://simulator.worldcoin.org`
- Agents cannot run until human verification is complete
- Privacy-preserving — biometrics never leave device

### On-Chain Agent Identity
- Metaplex Agent Registry via `mintAndSubmitAgent()`
- **Atomic single-transaction** flow: Core NFT + Agent Identity PDA created together
- No more two-step mint → register; everything in one atomic call
- Identity PDA verified on-chain after mint via `safeFetchAgentIdentityV1`
- Every action logged with timestamp, result, and tx signature
- Full audit trail visible in activity log

---

## Architecture

```
User connects Phantom Wallet
         ↓
┌─────────────────────────────┐
│   AgentPay Dashboard         │
│   (Next.js 16 + Zustand)    │
│   IDKitRequestWidget        │
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
   │   • Metaplex Core NFT    │
   │   • Agent Identity PDA   │
   │   • Memo program txs     │
   └─────────────────────────┘
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 16 + TypeScript + Zustand |
| **Blockchain** | Solana Web3.js + SPL Token + Phantom Adapter |
| **AI** | Claude Haiku via DGrid AI Gateway |
| **Identity** | World ID 4.0 (IDKit v4) + Metaplex Agent Registry |
| **State** | Zustand + localStorage |

---

## Sponsor Integrations

| Sponsor | Integration |
|---------|-------------|
| **Phantom** | Wallet connection, tx signing, session key funding |
| **World ID** | Human verification before agent activation (IDKit v4) |
| **Metaplex** | Atomic agent identity: Core NFT + Identity PDA via `mintAndSubmitAgent()` |
| **Swig** | Session keypairs — silent auto-execution model |

---

## Quick Start

```bash
git clone https://github.com/muhamedag2022/agentpay.git
cd agentpay
npm install
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
DGRID_API_KEY=your_dgrid_api_key
DGRID_BASE_URL=https://api.dgrid.ai/v1

# World ID 4.0
NEXT_PUBLIC_WLD_APP_ID=app_49297c3787f9cd09bf4f2ad66a8b441b
NEXT_PUBLIC_WLD_RP_ID=rp_7d40e425a355a274
RP_SIGNING_KEY=rp_signing_key_here
```

```bash
npm run dev
```

Visit `http://localhost:3000`, connect Phantom wallet, and deploy your first agent.

---

## Testing the Mint Flow

```bash
# Set your funded test keypair (base64 64-byte secret key)
export TEST_SECRET_KEY_BASE64="$(cat ~/.config/solana/id.json | python3 -c 'import sys,json; import base64; print(base64.b64encode(json.load(sys.stdin)[:32]).decode())')"

# Run the test script
npx ts-node --esm test-mint.ts
```

Or test via the UI:
1. `npm run dev` → connect Phantom → Dashboard → Create Agent → Deploy
2. Sign Phantom popup for mint transaction
3. Complete World ID verification (staging/simulator)
4. Check asset on Solana Explorer devnet

---

## Key Files

| File | Purpose |
|------|---------|
| `src/store/agentStore.ts` | Zustand store with persist middleware |
| `src/app/dashboard/page.tsx` | Main UI — agent list, detail, create form + IDKit widget |
| `src/lib/executeTask.ts` | USDC/SOL dual-path transaction executor |
| `src/lib/sessionExecutor.ts` | Session key auto-execution via Swig |
| `src/lib/mintNFT.ts` | `mintAndSubmitAgent()` — atomic Core NFT + Identity PDA |
| `src/app/api/agent/route.ts` | DGrid AI Gateway → Claude Haiku planner |
| `src/app/api/rp-signature/route.ts` | World ID RP context signer (ECDSA) |
| `src/app/api/verify-proof/route.ts` | World ID proof verification against developer API |

---

## World ID 4.0 Integration

```
User clicks "Verify with World ID" button
         ↓
Client → POST /api/rp-signature { action: "verify-human" }
         ↓ (returns sig, nonce, created_at, expires_at)
Client → IDKitRequestWidget opens (staging/simulator mode)
         ↓ (user scans with World App or simulator)
World App → Returns proof to IDKit widget
         ↓
Client → POST /api/verify-proof { rp_id, idkitResponse }
         ↓
Server → World ID developer API v4 verifies proof
         ↓
Agent marked as worldIdVerified = true
```

**Action `verify-human` must exist in the World ID Developer Portal** under this app.

---

## Use Cases

1. **DCA Bot** — Agent buys USDC/SOL on schedule within budget
2. **Freelancer Payment** — Auto-releases payment when work delivered
3. **Subscription Manager** — Recurring USDC payments to service providers
4. **AI Assistant with Budget** — GPT/Claude agent that can pay for services autonomously

---

## API

### AI Planner (`POST /api/agent`)

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

### World ID RP Signature (`POST /api/rp-signature`)

```json
{ "action": "verify-human" }
→ { "sig": "0x...", "nonce": "abc123", "created_at": 1746..., "expires_at": 1746... }
```

### World ID Verify (`POST /api/verify-proof`)

```json
{
  "rp_id": "rp_7d40e425a355a274",
  "idkitResponse": { /* full IDKitResult */ }
}
→ { "success": true }
```

---

## Links

- **GitHub**: [github.com/muhamedag2022/agentpay](https://github.com/muhamedag2022/agentpay)
- **Devnet**: `https://api.devnet.solana.com`
- **Solana Explorer**: [explorer.solana.com](https://explorer.solana.com)
- **World ID Simulator**: [simulator.worldcoin.org](https://simulator.worldcoin.org)
- **Metaplex Core**: [core.metaplex.com](https://core.metaplex.com)

---

## Hackathon

**Solana Frontier Hackathon 2026**
- Track: Consumer / DeFi / DAO / Payments
- Team: @Simowolf369
- Devnet only — no mainnet