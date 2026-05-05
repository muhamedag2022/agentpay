import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { Agent, AgentLog } from '@/types';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export async function executeAgentTask(
  agent: Agent,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  walletPublicKey: PublicKey
): Promise<AgentLog> {
  const logBase = {
    id: `log_${Date.now()}`,
    timestamp: Date.now(),
    action: 'execute_task',
  };

  try {
    const task = agent.tasks[0];
    if (!task) throw new Error('No task defined');

    // Check budget
    if (agent.spent >= agent.budget) {
      return {
        ...logBase,
        result: 'error',
        message: `Budget exhausted: $${agent.budget} limit reached`,
      };
    }

    // Build transaction — send small SOL amount as demo
    const amountLamports = Math.floor((task.amount || 0.001) * 0.001 * LAMPORTS_PER_SOL);
    
    // Use recipient or send back to self (demo)
    let recipientKey: PublicKey;
    try {
      recipientKey = task.recipient 
        ? new PublicKey(task.recipient)
        : walletPublicKey; // send to self if no recipient
    } catch {
      recipientKey = walletPublicKey;
    }

    const { blockhash } = await connection.getLatestBlockhash();
    
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,
        toPubkey: recipientKey,
        lamports: amountLamports,
      })
    );
    
    tx.recentBlockhash = blockhash;
    tx.feePayer = walletPublicKey;

    // Sign with wallet
    const signed = await signTransaction(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(sig);

    return {
      ...logBase,
      result: 'success',
      txSignature: sig,
      amount: task.amount || 1,
      message: `✓ Task executed: sent ${amountLamports} lamports | tx: ${sig.slice(0, 8)}...`,
    };

  } catch (error: any) {
    return {
      ...logBase,
      result: 'error',
      message: `✗ Error: ${error?.message || 'Unknown error'}`,
    };
  }
}