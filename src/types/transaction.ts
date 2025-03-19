export interface Transaction {
  date: string;
  paymentId: string;
  requestId?: string;
  client: string;
  amount: number;
  currency: string;
  status: 'completed' | 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  fromAddress: string;
  toAddress: string;
  reason: string;
  network: string;
  clientDetails: {
    name: string;
    email: string;
    address: string;
  };
  businessDetails: {
    name: string;
    email: string;
    address: string;
  };
} 