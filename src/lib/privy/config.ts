import type { PrivyClientConfig } from '@privy-io/react-auth';
import { baseSepolia, base } from 'viem/chains';

export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

export const PRIVY_CONFIG: PrivyClientConfig = {
  appearance: {
    accentColor: "#6A6FF5",
    theme: "#FFFFFF",
    showWalletLoginFirst: false,
    logo: "https://i.imghippo.com/files/ISvi4233ooI.png",
    walletChainType: "ethereum-only",
    walletList: [
      "detected_wallets",
      'coinbase_wallet', 
      'rainbow', 
      'wallet_connect'
    ]
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia, base],
  loginMethods: [
    "wallet",
    "email",
    // "google",
    // "twitter",
    // "github",
    // "linkedin",
  ],
  "fundingMethodConfig": {
    "moonpay": {
      "useSandbox": true
    }
  },
  embeddedWallets: {
    requireUserPasswordOnCreate: false,
    showWalletUIs: true,
    ethereum: {
      createOnLogin: "users-without-wallets"
    }
  },
  "mfa": {
    "noPromptOnMfaRequired": false
  },
}; 