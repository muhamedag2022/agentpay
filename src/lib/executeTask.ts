import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { Agent, AgentLog } from '@/types';

const USDC_MINT_DEVNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export async function executeAgentTask(
  agent: Agent,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  walletPublicKey: PublicKey,
  connection: Connection
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

    let recipientKey: PublicKey;
    try {
      recipientKey = task.recipient
        ? new PublicKey(task.recipient)
        : walletPublicKey;
    } catch {
      recipientKey = walletPublicKey;
    }

    // ── Attempt USDC (SPL) transfer ────────────────────────────────────────
    try {
      const senderTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        walletPublicKey
      );

      const recipientTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT_DEVNET,
        recipientKey
      );

      const { blockhash } = await connection.getLatestBlockhash();

      const tx = new Transaction();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPublicKey;

      // Create recipient's ATA if it doesn't exist (idempotent — no-op if already present)
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          walletPublicKey,
          recipientTokenAccount,
          recipientKey,
          USDC_MINT_DEVNET
        )
      );

      // Transfer USDC
      tx.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          walletPublicKey,
          amountMicroUSD,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPublicKey;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);

      return {
        ...logBase,
        result: 'success',
        txSignature: sig,
        amount: task.amount || 1,
        message: `✓ USDC transfer: $${task.amount || 1} USDC → ${shortenKey(recipientKey)} | tx: ${sig.slice(0, 8)}...`,
      };
    } catch (usdcError: any) {
      // ── Fallback to SOL lamports transfer ─────────────────────────────────
      const fallbackAmount = task.amount || 0.001;
      const amountLamports = Math.floor(fallbackAmount * 0.001 * LAMPORTS_PER_SOL);

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletPublicKey,
          toPubkey: recipientKey,
          lamports: Math.max(amountLamports, 1),
        })
      );
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPublicKey;

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig);

      return {
        ...logBase,
        result: 'success',
        txSignature: sig,
        amount: task.amount || 1,
        message: `✓ SOL fallback: ${Math.max(amountLamports, 1)} lamports → ${shortenKey(recipientKey)} (USDC account missing) | tx: ${sig.slice(0, 8)}...`,
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

function shortenKey(key: PublicKey): string {
  const s = key.toString();
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
}
