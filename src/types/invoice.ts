export interface Invoice {
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
} 