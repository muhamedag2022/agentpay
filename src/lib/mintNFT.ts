import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { signerIdentity } from '@metaplex-foundation/umi';
import { publicKey as toUmiPublicKey } from '@metaplex-foundation/umi-public-keys';
import {
  toWeb3JsLegacyTransaction,
  fromWeb3JsLegacyTransaction,
} from '@metaplex-foundation/umi-web3js-adapters';
import { mintAndSubmitAgent, mplAgentIdentity } from '@metaplex-foundation/mpl-agent-registry';
import type { Signer } from '@metaplex-foundation/umi';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function mintAgentNFT(
  agentName: string,
  agentId: string,
  walletPublicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
  const conn = new Connection(rpcUrl, 'confirmed');

  // Build a custom UMI signer from wallet publicKey + signTransaction
  const pk = toUmiPublicKey(walletPublicKey.toBase58());
  const customSigner: Signer = {
    publicKey: pk,
    signMessage: async () => {
      throw new Error('signMessage not implemented');
    },
    signTransaction: async (umiTx) => {
      const web3Tx = toWeb3JsLegacyTransaction(umiTx);
      web3Tx.feePayer = walletPublicKey;
      const signed = await signTransaction(web3Tx);
      return fromWeb3JsLegacyTransaction(signed);
    },
    signAllTransactions: async (txs) => {
      const signed = await Promise.all(
        txs.map((umiTx) => {
          const web3Tx = toWeb3JsLegacyTransaction(umiTx);
          web3Tx.feePayer = walletPublicKey;
          return signTransaction(web3Tx).then(fromWeb3JsLegacyTransaction);
        })
      );
      return signed;
    },
  };

  const umi = createUmi(rpcUrl).use(mplAgentIdentity()).use(signerIdentity(customSigner));

  const agentUri = `https://agentpay.xyz/agent/${agentId}`;
  const metadataUri = JSON.stringify({
    name: agentName,
    symbol: 'APY',
    description: `${agentName} — AI payment agent on AgentPay`,
    uri: agentUri,
    image: '',
    external_url: agentUri,
    attributes: [
      { trait_type: 'platform', value: 'AgentPay' },
      { trait_type: 'type', value: 'ai-agent' },
      { trait_type: 'agentId', value: agentId },
    ],
    properties: { files: [], category: 'agent' },
  });

  try {
    const result = await mintAndSubmitAgent(umi, {}, {
      wallet: umi.identity.publicKey,
      network: 'solana-devnet',
      name: agentName,
      uri: metadataUri,
      agentMetadata: {
        type: 'agent',
        name: agentName,
        description: `${agentName} — AI payment agent on AgentPay`,
        services: [],
        registrations: [],
        supportedTrust: [],
      },
    });
    return result.assetAddress;
  } catch (e) {
    // Fallback: write on-chain memo record if Metaplex API fails
    const { blockhash } = await conn.getLatestBlockhash();
    const memoData = Buffer.from(
      `AgentPay | Agent: ${agentName} | ID: ${agentId} | Deployed: ${new Date().toISOString()}`,
      'utf-8'
    );
    const memoTx = new Transaction();
    memoTx.recentBlockhash = blockhash;
    memoTx.feePayer = walletPublicKey;
    memoTx.add(
      new TransactionInstruction({ keys: [], programId: MEMO_PROGRAM_ID, data: memoData })
    );
    const signed = await signTransaction(memoTx);
    const sig = await conn.sendRawTransaction(signed.serialize());
    await conn.confirmTransaction(sig);
    return sig;
  }
}