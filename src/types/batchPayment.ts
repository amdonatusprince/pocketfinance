export interface Recipient {
  address: string;
  amount: string;
  reason?: string;
}

export interface BatchPayment {
  id: string;
  date: string;
  payerAddress: string;
  recipients: Recipient[];
  status: 'paid' | 'pending';
  totalAmount: string;
  currency: {
    decimals: number;
  };
} 