'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bot, Zap, Shield, Coins } from 'lucide-react';

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) router.push('/dashboard');
  }, [connected]);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot size={28} color="#9945FF" />
          <span style={{ fontSize: '1.4rem', fontWeight: 700 }} className="gradient-text">
            AgentPay
          </span>
        </div>
        <WalletMultiButton style={{
          background: 'linear-gradient(135deg, #9945FF, #7c3aed)',
          borderRadius: '10px', fontWeight: 600
        }} />
      </nav>

      {/* Hero */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: '6rem 2rem 4rem', gap: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(153,69,255,0.1)', border: '1px solid rgba(153,69,255,0.3)',
          borderRadius: '50px', padding: '0.4rem 1rem',
          fontSize: '0.85rem', color: '#9945FF', fontWeight: 500
        }}>
          ⚡ Built on Solana — Frontier Hackathon 2026
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1 }}>
          AI Agents That{' '}
          <span className="gradient-text">Act & Pay</span>
          <br />On Your Behalf
        </h1>

        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', lineHeight: 1.7 }}>
          Deploy intelligent agents that execute tasks, make payments in CASH stablecoin,
          and operate autonomously — while you stay in full control.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <WalletMultiButton style={{
            background: 'linear-gradient(135deg, #9945FF, #7c3aed)',
            borderRadius: '10px', fontWeight: 600, fontSize: '1rem',
            padding: '0.85rem 2rem'
          }} />
          <button className="btn-secondary">
            View Demo ↗
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '3rem', marginTop: '2rem',
          flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {[
            { label: 'Transaction Speed', value: '400ms' },
            { label: 'Fee per Task', value: '< $0.001' },
            { label: 'Agent Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }} className="gradient-text">
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem' }}>
          Why <span className="gradient-text">AgentPay</span>?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[
            {
              icon: <Bot size={32} color="#9945FF" />,
              title: 'AI-Powered Agents',
              desc: 'Intelligent agents that understand your goals and execute complex multi-step tasks autonomously.'
            },
            {
              icon: <Coins size={32} color="#14F195" />,
              title: 'Real Payments',
              desc: 'Agents spend CASH stablecoin within your defined budget — real transactions on Solana.'
            },
            {
              icon: <Shield size={32} color="#9945FF" />,
              title: 'Human Verified',
              desc: 'World ID proof ensures every agent is controlled by a real human — not a bot farm.'
            },
            {
              icon: <Zap size={32} color="#14F195" />,
              title: 'Solana Speed',
              desc: '400ms finality, sub-cent fees. Your agents execute instantly without waiting or overpaying.'
            },
          ].map((f) => (
            <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {f.icon}
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-secondary)', fontSize: '0.85rem'
      }}>
        AgentPay © 2026 — Built for Solana Frontier Hackathon
      </footer>
    </main>
  );
}