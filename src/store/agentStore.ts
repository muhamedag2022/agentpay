import { create } from 'zustand';
import { Agent, AgentLog, AgentStatus, AgentTask } from '@/types';

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
}

export const useAgentStore = create<AgentStore>((set) => ({
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
}));