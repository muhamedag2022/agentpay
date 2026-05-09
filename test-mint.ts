/**
 * Test mintAndSubmitAgent on devnet via Metaplex API directly.
 * Bypasses TypeScript issues with a simpler approach.
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { mintAndSubmitAgent, mplAgentIdentity, safeFetchAgentIdentityV1, findAgentIdentityV1Pda } from '@metaplex-foundation/mpl-agent-registry';
import type { Keypair as UmiKeypair } from '@metaplex-foundation/umi';

const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const conn = new Connection(rpcUrl, 'confirmed');

async function test() {
  const base64Key = process.env.TEST_SECRET_KEY_BASE64;
  if (!base64Key) {
    console.error('Set TEST_SECRET_KEY_BASE64 env var (base64 64-byte secret key)');
    process.exit(1);
  }

  const keypair = Keypair.fromSecretKey(Buffer.from(base64Key, 'base64'));
  console.log(`Wallet: ${keypair.publicKey.toString()}`);

  const balance = await conn.getBalance(keypair.publicKey);
  console.log(`Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  if (balance < 0.05 * 1e9) {
    console.error('Need SOL!');
    process.exit(1);
  }

  // Create Umi
  const umi = createUmi(rpcUrl).use(mplAgentIdentity());
  const sk = keypair.secretKey;
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(sk.buffer, sk.byteOffset, sk.byteLength)
  );
  umi.use(keypairIdentity(umiKeypair as UmiKeypair));

  const agentId = `agent-${Date.now()}`;
  const metadataUri = JSON.stringify({
    name: 'AgentPay Agent',
    symbol: 'APY',
    description: 'AI payment agent on AgentPay',
    uri: `https://agentpay.xyz/agent/${agentId}`,
    image: '',
    external_url: `https://agentpay.xyz/agent/${agentId}`,
    attributes: [
      { trait_type: 'platform', value: 'AgentPay' },
      { trait_type: 'type', value: 'ai-agent' },
      { trait_type: 'agentId', value: agentId },
    ],
    properties: { files: [], category: 'agent' },
  });

  console.log('=== mintAndSubmitAgent ===');
  const start = Date.now();
  const result = await mintAndSubmitAgent(umi, {}, {
    wallet: umi.identity.publicKey,
    network: 'solana-devnet',
    name: 'AgentPay Agent',
    uri: metadataUri,
    agentMetadata: {
      type: 'agent', name: 'AgentPay Agent', description: 'AI payment agent on AgentPay',
      services: [], registrations: [], supportedTrust: [],
    },
  });
  console.log(`✓ Done in ${Date.now() - start}ms`);
  console.log(`  Asset: ${result.assetAddress}`);

  console.log('\n=== Verify Identity PDA ===');
  const [identityPda] = await findAgentIdentityV1Pda(umi, { asset: result.assetAddress as any });
  console.log(`  PDA: ${identityPda}`);
  const identity = await safeFetchAgentIdentityV1(umi, identityPda);
  console.log(identity ? `  ✓ Verified! Asset: ${identity.asset}` : '  ✗ Not found');

  console.log('\n=== Explorer ===');
  console.log(`Asset:   https://explorer.solana.com/address/${result.assetAddress}?cluster=devnet`);
  console.log(`Identity: https://explorer.solana.com/address/${identityPda}?cluster=devnet`);
}

test().catch(e => { console.error('Error:', e.message); process.exit(1); });