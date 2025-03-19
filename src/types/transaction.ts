export interface Transaction {
  date: string;
  id: string;
  requestId?: string;
  paymentReference?: string;
  client: string;
  amount: string;
  currency: {
    decimals: number;
    value: string;
  };
  status: 'paid' | 'pending' | 'overdue';
  dueDate?: string;
  paidAt?: string;
  payerAddress: string;
  recipientAddress: string;
  reason: string;
  network: string;
  type?: 'single' | 'batch';
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
  createdAt: string;
  isRecurring?: boolean;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  };
} 