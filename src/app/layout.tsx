import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VaultFlow — Inventory Management',
  description: 'Modern inventory management system with real-time tracking and beautiful UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="noise"></div>
        <div className="glow"></div>
        {children}
      </body>
    </html>
  );
} 