import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { WagmiConfigProvider } from "@/components/providers/WagmiProvider";
import { AuthProvider } from "@/components/providers/AuthProvider"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pocket Finance",
  description: "Manage your finances with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiConfigProvider>
          <AuthProvider>
          {children}
          <Toaster position="top-right" />
          </AuthProvider>
        </WagmiConfigProvider>
      </body>
    </html>
  );
}
