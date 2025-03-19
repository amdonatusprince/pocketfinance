export interface User {
  id: string;
  address: string;
  wallet?: {
    address: string;
  };
} 