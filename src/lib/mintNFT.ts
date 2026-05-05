import { Connection, Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export async function mintAgentNFT(
  walletAdapter: any,
  agentId: string,
  agentName: string
): Promise<string> {
  const conn = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    'confirmed'
  );

  const memoData = Buffer.from(
    `AgentPay | Agent: ${agentName} | ID: ${agentId} | Deployed: ${new Date().toISOString()}`,
    'utf-8'
  );

  const { blockhash } = await conn.getLatestBlockhash();
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = walletAdapter.publicKey;

  // Use the Memo program to write agent identity on-chain
  tx.add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: memoData,
    })
  );

  // Also create the agent's session keypair account on-chain
  const sessionKey = Keypair.generate();
  const space = 64; // minimal account space
  const lamports = await conn.getMinimumBalanceForRentExemption(space);

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: walletAdapter.publicKey,
      newAccountPubkey: sessionKey.publicKey,
      lamports,
      space,
      programId: SystemProgram.programId,
    })
  );

  const signed = await walletAdapter.signTransaction(tx);
  const sig = await conn.sendRawTransaction(signed.serialize());
  await conn.confirmTransaction(sig);

  return sig;
}