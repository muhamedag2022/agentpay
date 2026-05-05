export type AgentStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export type TaskType = 'send_payment' | 'dca' | 'schedule' | 'custom';

export interface AgentTask {
  id: string;
  type: TaskType;
  description: string;
  condition?: string;
  amount?: number;
  recipient?: string;
  interval?: number; // minutes
  maxExecutions?: number;
  executedCount: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  tasks: AgentTask[];
  budget: number; // CASH in USD
  spent: number;
  walletAddress?: string;
  nftMint?: string;
  worldIdVerified: boolean;
  createdAt: number;
  lastActive?: number;
  logs: AgentLog[];
}

export interface AgentLog {
  id: string;
  timestamp: number;
  action: string;
  result: 'success' | 'error' | 'pending';
  txSignature?: string;
  amount?: number;
  message: string;
}

export interface UserState {
  wallet: string | null;
  worldIdVerified: boolean;
  agents: Agent[];
}