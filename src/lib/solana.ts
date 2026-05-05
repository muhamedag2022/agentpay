import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';

export const NETWORK = 'devnet';
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet'),
  'confirmed'
);

export const CASH_MINT_DEVNET = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC devnet placeholder
);

export async function getBalance(walletAddress: string): Promise<number> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function requestAirdrop(walletAddress: string): Promise<string | null> {
  try {
    const pubkey = new PublicKey(walletAddress);
    const sig = await connection.requestAirdrop(pubkey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig);
    return sig;
  } catch {
    return null;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}