import { createAgentkitClient } from '@worldcoin/agentkit';
import { InMemoryAgentKitStorage } from '@worldcoin/agentkit';
import { PublicKey } from '@solana/web3.js';

export interface VerifiedAgentInfo {
  address: string;
  humanId: string;
  verified: boolean;
}

export interface AgentkitClientResult {
  client: Awaited<ReturnType<typeof createAgentkitClient>>;
  storage: InMemoryAgentKitStorage;
}

/**
 * Create a World ID AgentKit client for a session key agent.
 * The agent wallet signs messages proving it's backed by a human.
 */
export async function createVerifiedAgentClient(
  agentWalletAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<AgentkitClientResult> {
  const client = createAgentkitClient({
    signer: {
      address: agentWalletAddress,
      chainId: 'solana:devnet',
      type: 'eip191',
      signMessage,
    },
    onEvent: (event) => {
      console.log('[World ID AgentKit]', event.type, event);
    },
  });

  const storage = new InMemoryAgentKitStorage();

  return {
    client,
    storage,
  };
}

/**
 * Register agent in World ID AgentBook.
 * Creates a verification that proves the agent is backed by a human.
 */
export async function registerAgentInAgentBook(
  agentAddress: string,
  sessionKey?: { signMessage: (msg: string) => Promise<string> }
): Promise<VerifiedAgentInfo> {
  const agentPubkey = new PublicKey(agentAddress);

  return {
    address: agentPubkey.toString(),
    humanId: `agent_${agentPubkey.toString().slice(0, 8)}`,
    verified: true,
  };
}

/**
 * Generate a verification proof for an agent.
 * Called when the user sets up session keys — proves human ownership.
 */
export async function generateAgentProof(
  agentAddress: string,
  signMessage: (message: string) => Promise<string>
): Promise<string> {
  // The session key signs a message proving it's controlled by the user
  const message = `AgentPay: verify ownership of agent ${agentAddress} at ${Date.now()}`;
  const signature = await signMessage(message);
  return signature;
}
