import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Agent, AgentLog } from '@/types';

const USDC_MINT_DEVNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

/** Execute a task using a session keypair (no wallet popup) */
export async function executeWithSessionKey(
  agent: Agent,
  sessionKey: Keypair,
  recipientOverride?: string
): Promise<AgentLog> {
  const logBase = {
    id: `log_${Date.now()}`,
    timestamp: Date.now(),
    action: 'execute_task',
  };

  try {
    const task = agent.tasks[0];
    if (!task) throw new Error('No task defined');

    if (agent.spent >= agent.budget) {
      return {
        ...logBase,
        result: 'error',
        message: `Budget exhausted: $${agent.budget} limit reached`,
      };
    }

    const amountMicroUSD = Math.floor((task.amount || 1) * 1_000_000);

    const sessionPublicKey = sessionKey.publicKey;
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC ||
      'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    let recipientKey: PublicKey;
    try {
      const recipientStr = recipientOverride ?? task.recipient;
      recipientKey = recipientStr ? new PublicKey(recipientStr) : sessionPublicKey;
    } catch {
      recipientKey = sessionPublicKey;
    }

    // ── Try USDC SPL transfer ─────────────────────────────────────────────
    try {
      const senderTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        sessionPublicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        recipientKey
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = sessionPublicKey;

      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          sessionPublicKey,
          recipientTokenAccount,
          recipientKey,
          USDC_MINT_DEVNET
        )
      );

      tx.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          sessionPublicKey,
          amountMicroUSD,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      tx.sign(sessionKey);
      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction(sig);

      return {
        ...logBase,
        result: 'success',
        txSignature: sig,
        amount: task.amount || 1,
        message: `✓ [Session] USDC transfer: $${task.amount || 1} → ${shortenKey(recipientKey)} | tx: ${sig.slice(0, 8)}...`,
      };
    } catch (usdcError: any) {
      // ── Fallback: small SOL transfer ─────────────────────────────────
      const amountLamports = Math.max(Math.floor((task.amount || 0.001) * 0.001 * LAMPORTS_PER_SOL), 1);

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: sessionPublicKey,
          toPubkey: recipientKey,
          lamports: amountLamports,
        })
      );
      tx.recentBlockhash = blockhash;
      tx.feePayer = sessionPublicKey;

      tx.sign(sessionKey);
      const sig = await connection.sendRawTransaction(tx.serialize());
      await connection.confirmTransaction(sig);

      return {
        ...logBase,
        result: 'success',
        txSignature: sig,
        amount: task.amount || 1,
        message: `✓ [Session] SOL fallback: ${amountLamports} lamports → ${shortenKey(recipientKey)} (USDC acct missing) | tx: ${sig.slice(0, 8)}...`,
      };
    }
  } catch (error: any) {
    return {
      ...logBase,
      result: 'error',
      message: `✗ Error: ${error?.message || 'Unknown error'}`,
    };
  }
}

/** Restore a Keypair from base64-encoded private key stored in state */
export function restoreSessionKey(privateKeyBase64: string): Keypair {
  const bytes = Buffer.from(privateKeyBase64, 'base64');
  return Keypair.fromSecretKey(bytes);
}

/** Fund a session key with SOL from the user's wallet (one Phantom approval) */
export async function fundSessionKey(
  sessionPublicKey: PublicKey,
  connection: Connection,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  userPublicKey: PublicKey,
  fundingAmount: number = 0.05 // 0.05 SOL to cover tx fees + buffer
): Promise<string> {
  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: userPublicKey,
      toPubkey: sessionPublicKey,
      lamports: Math.floor(fundingAmount * LAMPORTS_PER_SOL),
    })
  );
  tx.recentBlockhash = blockhash;
  tx.feePayer = userPublicKey;

  const funded = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(funded.serialize());
  await connection.confirmTransaction(sig);
  return sig;
}

function shortenKey(key: PublicKey): string {
  const s = key.toString();
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}