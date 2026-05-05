import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Agent, AgentLog, AgentStatus } from '@/types';

interface SessionKeyInfo {
  privateKeyBase64: string;
  publicKeyBase64: string;
  agentId: string;
  fundedAt: number;
}

// Module-level store for session keys (not persisted directly)
const _sessionKeyStore: Record<string, SessionKeyInfo> = {};

interface AgentStore {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;

  addAgent: (agent: Agent) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  addLog: (agentId: string, log: AgentLog) => void;
  selectAgent: (id: string | null) => void;
  updateAgentSpent: (id: string, amount: number) => void;
  setLoading: (val: boolean) => void;
  removeAgent: (id: string) => void;
  updateAgentNFT: (id: string, nftMint: string) => void;
  updateAgentVerified: (id: string, verified: boolean) => void;
  setSessionKey: (agentId: string, key: SessionKeyInfo) => void;
  getSessionKey: (agentId: string) => SessionKeyInfo | null;
  removeSessionKey: (agentId: string) => void;
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
      agents: [],
      selectedAgentId: null,
      isLoading: false,

      addAgent: (agent) =>
        set((state) => ({ agents: [...state.agents, agent] })),

      updateAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, status, lastActive: Date.now() } : a
          ),
        })),

      addLog: (agentId, log) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, logs: [...a.logs, log] } : a
          ),
        })),

      selectAgent: (id) => set({ selectedAgentId: id }),

      updateAgentSpent: (id, amount) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, spent: a.spent + amount } : a
          ),
        })),

      setLoading: (val) => set({ isLoading: val }),

      removeAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        })),

      updateAgentNFT: (id, nftMint) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, nftMint } : a
          ),
        })),

      updateAgentVerified: (id, verified) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, worldIdVerified: verified } : a
          ),
        })),

      setSessionKey: (agentId, key) => {
        _sessionKeyStore[agentId] = key;
      },

      getSessionKey: (agentId) => {
        return _sessionKeyStore[agentId] ?? null;
      },

      removeSessionKey: (agentId) => {
        delete _sessionKeyStore[agentId];
      },
    }),
    {
      name: 'agentpay-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        agents: state.agents,
        selectedAgentId: state.selectedAgentId,
      }),
    }
  )
);

// Export getter for use outside React
export function getStoredSessionKey(agentId: string): SessionKeyInfo | null {
  return _sessionKeyStore[agentId] ?? null;
}