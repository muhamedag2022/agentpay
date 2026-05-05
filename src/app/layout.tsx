import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { SolanaWalletProvider } from '@/lib/walletProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgentPay — AI Agents That Pay',
  description: 'Deploy AI agents that act, transact, and execute on Solana on your behalf.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}