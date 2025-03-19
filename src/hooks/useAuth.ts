'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const { 
    login, 
    logout, 
    authenticated, 
    user, 
    ready 
  } = usePrivy();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (!authenticated) {
        await login();
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user: user ? {
      id: user.id,
      address: user.wallet?.address || '',
      wallet: user.wallet
    } : null,
    loading: !ready,
    logout: handleLogout,
    login: handleLogin
  };
} 