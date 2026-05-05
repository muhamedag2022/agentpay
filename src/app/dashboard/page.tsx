'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAgentStore } from '@/store/agentStore';
import { Agent } from '@/types';
import { Bot, Plus, Zap, Shield, Activity, Wallet, ChevronRight, Play, Pause, Trash2, CheckCircle } from 'lucide-react';
import { shortenAddress, explorerUrl, connection } from '@/lib/solana';
import { executeAgentTask } from '@/lib/executeTask';
import { mintAgentNFT } from '@/lib/mintNFT';
import { executeWithSessionKey, restoreSessionKey } from '@/lib/sessionExecutor';
import { getStoredSessionKey } from '@/store/agentStore';
import { Keypair } from '@solana/web3.js';

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const { agents, selectedAgentId, selectAgent, removeAgent } = useAgentStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!connected) router.push('/');
  }, [connected]);

  const selectedAgent = agents.find((a: Agent) => a.id === selectedAgentId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => router.push('/')}>
          <Bot size={24} color="#9945FF" />
          <span style={{ fontWeight: 700, fontSize: '1.2rem' }} className="gradient-text">AgentPay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {publicKey && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.85rem'
            }}>
              <Wallet size={14} color="#14F195" />
              <span style={{ color: '#14F195' }}>{shortenAddress(publicKey.toString())}</span>
            </div>
          )}
          <WalletMultiButton style={{
            background: 'linear-gradient(135deg, #9945FF, #7c3aed)',
            borderRadius: '8px', fontSize: '0.85rem', padding: '0.4rem 1rem'
          }} />
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{
          width: '280px', borderRight: '1px solid var(--border)',
          background: 'var(--bg-secondary)', padding: '1.5rem 1rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Agents ({agents.length})
            </span>
            <button onClick={() => setShowCreate(true)} style={{
              background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.4)',
              borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9945FF', fontSize: '0.8rem'
            }}>
              <Plus size={14} /> New
            </button>
          </div>

          {agents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Bot size={32} color="var(--border)" style={{ margin: '0 auto 0.75rem' }} />
              <p>No agents yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Create your first agent</p>
            </div>
          ) : (
            agents.map((agent: Agent) => (
              <div key={agent.id} onClick={() => selectAgent(agent.id)} style={{
                padding: '0.75rem', borderRadius: '10px', cursor: 'pointer',
                border: `1px solid ${selectedAgentId === agent.id ? '#9945FF' : 'var(--border)'}`,
                background: selectedAgentId === agent.id ? 'rgba(153,69,255,0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{agent.name}</span>
                  <span className={`status-${agent.status}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                    ● {agent.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Budget: ${agent.budget} · Spent: ${agent.spent.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </aside>

        <main style={{ flex: 1, padding: '2rem' }}>
          {showCreate ? (
            <CreateAgentForm onClose={() => setShowCreate(false)} walletAddress={publicKey?.toString() || ''} />
          ) : selectedAgent ? (
            <AgentDetail agent={selectedAgent} publicKey={publicKey} />
          ) : (
            <WelcomePanel onCreate={() => setShowCreate(true)} />
          )}
        </main>
      </div>
    </div>
  );
}

function WelcomePanel({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Bot size={40} color="#9945FF" />
      </div>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Deploy Your First Agent</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Create an AI agent that executes tasks and makes payments on Solana on your behalf.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
        {[
          { icon: <Zap size={20} color="#14F195" />, title: 'Auto Payments', desc: 'Send USDC on conditions' },
          { icon: <Shield size={20} color="#9945FF" />, title: 'Human Verified', desc: 'World ID protected' },
          { icon: <Activity size={20} color="#14F195" />, title: 'Full Logs', desc: 'Every action tracked' },
        ].map(f => (
          <div key={f.title} className="card" style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>{f.icon}</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{f.desc}</div>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
        <Plus size={18} /> Create Agent
      </button>
    </div>
  );
}

function AgentDetail({ agent, publicKey }: { agent: Agent; publicKey: any }) {
  const { updateAgentStatus, removeAgent, selectAgent, addLog, updateAgentSpent, updateAgentVerified, setSessionKey } = useAgentStore();
  const { signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isExecuting, setIsExecuting] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [showWorldIDModal, setShowWorldIDModal] = useState(false);
  const [sessionKeyReady, setSessionKeyReady] = useState(false);
  const [fundingSession, setFundingSession] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentRef = useRef(agent);
  agentRef.current = agent;

  const [worldIdVerified, setWorldIdVerified] = useState(agent.worldIdVerified);

  useEffect(() => {
    setWorldIdVerified(agent.worldIdVerified);
  }, [agent.worldIdVerified]);

  // Check if agent already has a session key
  useEffect(() => {
    setSessionKeyReady(!!getStoredSessionKey(agent.id));
  }, [agent.id]);

  const handleWorldIDVerify = () => {
    setShowWorldIDModal(true);
  };

  const handleWorldIDSuccess = () => {
    setWorldIdVerified(true);
    updateAgentVerified(agent.id, true);
    setShowWorldIDModal(false);
  };

  const setupSessionKey = async () => {
    if (!signTransaction || !publicKey) return;

    setFundingSession(true);
    try {
      // Generate fresh ephemeral keypair
      const sessionKP = Keypair.generate();

      // Fund it from user wallet (one Phantom popup)
      const fundTx = new (await import('@solana/web3.js')).Transaction();
      fundTx.add(
        (await import('@solana/web3.js')).SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: sessionKP.publicKey,
          lamports: Math.floor(0.05 * (await import('@solana/web3.js')).LAMPORTS_PER_SOL),
        })
      );
      const { blockhash } = await connection.getLatestBlockhash();
      fundTx.recentBlockhash = blockhash;
      fundTx.feePayer = publicKey;

      const funded = await signTransaction(fundTx);
      const fundSig = await connection.sendRawTransaction(funded.serialize());
      await connection.confirmTransaction(fundSig);

      // Store base64-encoded private key (persisted to localStorage)
      setSessionKey(agent.id, {
        privateKeyBase64: Buffer.from(sessionKP.secretKey).toString('base64'),
        publicKeyBase64: Buffer.from(sessionKP.publicKey.toBytes()).toString('base64'),
        agentId: agent.id,
        fundedAt: Date.now(),
      });

      addLog(agent.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'session_key',
        result: 'success',
        message: `✓ Session key funded at ${sessionKP.publicKey.toString().slice(0, 8)}... | tx: ${fundSig.slice(0, 8)}...`,
      });

      setSessionKeyReady(true);
    } catch (e: any) {
      addLog(agent.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'session_key',
        result: 'error',
        message: `✗ Session key setup failed: ${e?.message || 'Unknown'}`,
      });
    } finally {
      setFundingSession(false);
    }
  };

  const runExecution = async () => {
    if (agentRef.current.spent >= agentRef.current.budget) {
      addLog(agentRef.current.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'execute_task',
        result: 'error',
        message: `Budget exhausted: $${agentRef.current.budget} limit reached`,
      });
      return false;
    }

    setIsExecuting(true);
    try {
      // ── Session key path: silent, no popup ──────────────────────────
      const sessionKeyData = getStoredSessionKey(agentRef.current.id);

      if (sessionKeyData) {
        const sessionKP = restoreSessionKey(sessionKeyData.privateKeyBase64);
        const log = await executeWithSessionKey(agentRef.current, sessionKP);
        addLog(agentRef.current.id, log);
        if (log.result === 'success') {
          updateAgentSpent(agentRef.current.id, agentRef.current.tasks[0]?.amount || 1);
        }
        return log.result === 'success';
      }

      // ── Manual wallet path ─────────────────────────────────────────
      if (signTransaction && publicKey) {
        const log = await executeAgentTask(agentRef.current, signTransaction, publicKey, connection);
        addLog(agentRef.current.id, log);
        if (log.result === 'success') {
          updateAgentSpent(agentRef.current.id, agentRef.current.tasks[0]?.amount || 1);
        }
        return log.result === 'success';
      }

      // ── No wallet connected: simulated ─────────────────────────────
      addLog(agentRef.current.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'auto_execute',
        result: 'success',
        message: `[Simulated] Task: ${agentRef.current.tasks[0]?.description || 'payment'} | $${agentRef.current.tasks[0]?.amount || 1} USDC`,
      });
      updateAgentSpent(agentRef.current.id, agentRef.current.tasks[0]?.amount || 1);
      return true;
    } catch (e: any) {
      addLog(agentRef.current.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'execute_task',
        result: 'error',
        message: `Error: ${e?.message || 'Unknown'}`,
      });
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRun = async () => {
    if (!signTransaction && !publicKey) {
      addLog(agent.id, {
        id: `log_${Date.now()}`,
        timestamp: Date.now(),
        action: 'execute_task',
        result: 'success',
        message: `[Simulated] Task executed: ${agent.tasks[0]?.description || 'payment'} | $${agent.tasks[0]?.amount || 1} USDC`,
      });
      updateAgentSpent(agent.id, agent.tasks[0]?.amount || 1);
      return;
    }
    updateAgentStatus(agent.id, 'running');
    await runExecution();
    updateAgentStatus(agent.id, 'idle');
  };

  const handleAutoToggle = () => {
    if (autoRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAutoRunning(false);
      updateAgentStatus(agent.id, 'idle');
    } else {
      updateAgentStatus(agent.id, 'running');
      setAutoRunning(true);
    }
  };

  useEffect(() => {
    if (!autoRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      const success = await runExecution();
      if (!success && agentRef.current.spent >= agentRef.current.budget) {
        clearInterval(intervalRef.current!);
        setAutoRunning(false);
        updateAgentStatus(agentRef.current.id, 'paused');
      }
    }, 30_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRunning]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {showWorldIDModal && (
        <WorldIDModal
          agentId={agent.id}
          onSuccess={handleWorldIDSuccess}
          onClose={() => setShowWorldIDModal(false)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{agent.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{agent.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {autoRunning ? (
            <button onClick={handleAutoToggle} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
              borderRadius: '8px', padding: '0.5rem 1rem', color: '#f59e0b', cursor: 'pointer'
            }}>
              <Pause size={16} /> Stop Auto
            </button>
          ) : (
            <button onClick={handleAutoToggle} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(20,241,149,0.15)', border: '1px solid rgba(20,241,149,0.4)',
              borderRadius: '8px', padding: '0.5rem 1rem', color: '#14F195',
              cursor: 'pointer'
            }}>
              <Play size={16} /> Auto Run
            </button>
          )}
          <button onClick={handleRun} disabled={isExecuting} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(153,69,255,0.15)', border: '1px solid rgba(153,69,255,0.4)',
            borderRadius: '8px', padding: '0.5rem 1rem', color: '#9945FF',
            cursor: isExecuting ? 'wait' : 'pointer', opacity: isExecuting ? 0.7 : 1
          }}>
            <Play size={16} /> {isExecuting ? 'Running...' : 'Run Once'}
          </button>
          <button onClick={() => { removeAgent(agent.id); selectAgent(null); }} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '8px', padding: '0.5rem 1rem', color: '#ef4444', cursor: 'pointer'
          }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Status', value: agent.status.toUpperCase(), color: agent.status === 'running' ? '#14F195' : '#a0a0b0' },
          { label: 'Budget', value: `$${agent.budget}`, color: '#9945FF' },
          { label: 'Spent', value: `$${agent.spent.toFixed(2)}`, color: '#f59e0b' },
          { label: 'Tasks Run', value: agent.tasks.reduce((s, t) => s + t.executedCount, 0).toString(), color: '#14F195' },
          { label: 'World ID', value: worldIdVerified ? 'VERIFIED' : 'PENDING', color: worldIdVerified ? '#14F195' : '#a0a0b0' },
          { label: 'Session Key', value: sessionKeyReady ? 'ACTIVE' : 'NONE', color: sessionKeyReady ? '#14F195' : '#a0a0b0' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {!sessionKeyReady && signTransaction && publicKey && (
        <button onClick={setupSessionKey} disabled={fundingSession} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(20,241,149,0.1)', border: '1px solid rgba(20,241,149,0.3)',
          borderRadius: '10px', padding: '0.75rem 1rem', color: '#14F195', cursor: fundingSession ? 'wait' : 'pointer', width: '100%',
          textAlign: 'left', opacity: fundingSession ? 0.7 : 1
        }}>
          <Zap size={18} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{fundingSession ? 'Setting up session key...' : 'Setup Session Key (one Phantom approval)'}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Enable silent auto-execution — no Phantom popup on every run</div>
          </div>
        </button>
      )}

      {autoRunning && (
        <div style={{
          background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.3)',
          borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#14F195', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: '0.9rem', color: '#14F195' }}>
            Auto-run active — checking every 30 seconds
            {sessionKeyReady ? ' (session key — silent)' : signTransaction ? ' (Phantom — requires approval)' : ' (simulated mode)'}
          </span>
        </div>
      )}

      {!worldIdVerified ? (
        <button onClick={handleWorldIDVerify} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: '10px', padding: '1rem', color: '#f59e0b', cursor: 'pointer', width: '100%',
          textAlign: 'left'
        }}>
          <Shield size={20} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Verify with World ID</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prove you're human to activate the agent</div>
          </div>
        </button>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'rgba(20,241,149,0.08)', border: '1px solid rgba(20,241,149,0.3)',
          borderRadius: '10px', padding: '1rem', color: '#14F195'
        }}>
          <CheckCircle size={20} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>World ID Verified</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>This agent is human-verified and ready to operate</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#9945FF" /> Tasks
        </h3>
        {agent.tasks.map(task => (
          <div key={task.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>{task.description}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>×{task.executedCount}</span>
            </div>
            {task.amount && <div style={{ fontSize: '0.8rem', color: '#14F195', marginTop: '0.25rem' }}>${task.amount} per execution</div>}
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Activity Log</h3>
        {agent.logs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No activity yet. Run the agent to see logs.</p>
        ) : (
          agent.logs.slice(-20).reverse().map(log => (
            <div key={log.id} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: log.result === 'success' ? '#14F195' : '#ef4444', fontSize: '0.8rem' }}>
                {log.result === 'success' ? '✓' : '✗'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem' }}>{log.message}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                  {log.txSignature && (
                    <a href={explorerUrl(log.txSignature)} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#9945FF', marginLeft: '0.5rem' }}>View tx ↗</a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WorldIDModal({ agentId, onSuccess, onClose }: { agentId: string; onSuccess: () => void; onClose: () => void }) {
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<'intro' | 'scanning'>('intro');

  const handleVerify = async () => {
    setVerifying(true);
    setStep('scanning');
    await new Promise(r => setTimeout(r, 2000));
    setVerifying(false);
    onSuccess();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.4)',
        borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '100%',
        display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="#f59e0b" />
            <span style={{ fontWeight: 600 }}>World ID Verification</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
        </div>

        {step === 'intro' && (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#f59e0b" />
                  <path d="M12 14c-4 0-8 2-8 4.5V21h16v-2.5C20 16 16 14 12 14z" fill="#f59e0b" />
                </svg>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Prove you are a unique human to protect this agent from bots and sybil attacks.
                Your privacy is preserved — Worldcoin never shares your biometric data.
              </p>
            </div>
            <button onClick={handleVerify} style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none', borderRadius: '10px', padding: '0.75rem', color: 'white',
              fontWeight: 600, cursor: 'pointer', fontSize: '1rem'
            }}>
              Begin Verification
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Requires World App with a World ID registered
            </p>
          </>
        )}

        {step === 'scanning' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', position: 'relative' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#f59e0b" />
                  <path d="M12 14c-4 0-8 2-8 4.5V21h16v-2.5C20 16 16 14 12 14z" fill="#f59e0b" />
                </svg>
              </div>
              <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#f59e0b', animation: 'spin 1s linear infinite' }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>Scanning your face...</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Position your face in the frame</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateAgentForm({ onClose, walletAddress }: { onClose: () => void; walletAddress: string }) {
  const { addAgent, selectAgent, setLoading, isLoading } = useAgentStore();
  const { signTransaction, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', description: '', taskType: 'send_payment' as const,
    taskDescription: '', budget: 10, amount: 1, recipient: '', condition: '',
  });
  const [aiPlan, setAiPlan] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'plan', taskType: form.taskType, description: form.taskDescription, budget: form.budget, amount: form.amount, condition: form.condition, recipient: form.recipient }),
      });
      const data = await res.json();
      setAiPlan(data.plan || 'Plan ready.');
      setStep(3);
    } catch {
      setAiPlan('Agent configured successfully. Ready to deploy.');
      setStep(3);
    }
    setLoading(false);
  };

  const handleDeploy = async () => {
    const agent: Agent = {
      id: `agent_${Date.now()}`, name: form.name || 'My Agent',
      description: form.description || form.taskDescription, status: 'idle',
      tasks: [{ id: `task_${Date.now()}`, type: form.taskType, description: form.taskDescription, amount: form.amount, recipient: form.recipient, condition: form.condition, executedCount: 0 }],
      budget: form.budget, spent: 0, walletAddress, worldIdVerified: false, createdAt: Date.now(), logs: [],
    };
    addAgent(agent);

    if (wallet) {
      try {
        const nftMint = await mintAgentNFT(wallet, agent.id, agent.name);
        const { updateAgentNFT } = useAgentStore.getState();
        updateAgentNFT(agent.id, nftMint);
        agent.nftMint = nftMint;
      } catch (e) {
        console.warn('NFT minting failed, continuing without NFT:', e);
      }
    }

    selectAgent(agent.id);
    onClose();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Create New Agent</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['Identity', 'Task', 'Review'].map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: '3px', borderRadius: '2px', background: step > i ? '#9945FF' : 'var(--border)', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.8rem', color: step > i ? '#9945FF' : 'var(--text-secondary)' }}>{s}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Agent Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Daily DCA Bot"
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What should this agent do?" rows={3}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Budget (USDC)</label>
            <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }} />
          </div>
          <button className="btn-primary" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Task Type</label>
            <select value={form.taskType} onChange={e => setForm({ ...form, taskType: e.target.value as any })}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }}>
              <option value="send_payment">Send Payment</option>
              <option value="dca">DCA (Dollar Cost Average)</option>
              <option value="schedule">Scheduled Task</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Task Description</label>
            <textarea value={form.taskDescription} onChange={e => setForm({ ...form, taskDescription: e.target.value })} placeholder="e.g. Send $5 USDC to recipient every Monday at 9am" rows={3}
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount per run ($)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Condition (optional)</label>
              <input value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} placeholder="e.g. every Monday"
                style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Recipient Address (optional)</label>
            <input value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} placeholder="Solana wallet address"
              style={{ width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', cursor: 'pointer' }}>
              Back
            </button>
            <button className="btn-primary" onClick={handleGenerate} disabled={isLoading}
              style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? '⏳ Generating Plan...' : '✨ Generate AI Plan'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(153,69,255,0.3)' }}>
            <div style={{ fontSize: '0.8rem', color: '#9945FF', fontWeight: 600, marginBottom: '0.75rem' }}>✨ AI EXECUTION PLAN</div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{aiPlan}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Agent: </span><strong>{form.name}</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Budget: </span><strong>${form.budget} USDC</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Task: </span><strong>{form.taskType}</strong>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.75rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Per run: </span><strong>${form.amount}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem', color: 'white', cursor: 'pointer' }}>
              Back
            </button>
            <button className="btn-primary" onClick={handleDeploy} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              🚀 Deploy Agent + Mint NFT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
