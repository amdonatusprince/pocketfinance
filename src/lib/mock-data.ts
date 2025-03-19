import { Transaction } from '@/types/transaction';

export const mockInvoices: Transaction[] = [
  {
    date: '2024-03-09',
    paymentId: 'INV-001',
    client: 'Tech Solutions Inc.',
    amount: 2500,
    currency: 'USDC',
    status: 'pending',
    dueDate: '2024-03-25',
    fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    reason: 'Web Development Services - Phase 1',
    network: 'Ethereum',
    clientDetails: {
      name: 'Tech Solutions Inc.',
      email: 'billing@techsolutions.com',
      address: '123 Tech Park, Silicon Valley, CA'
    },
    businessDetails: {
      name: 'Your Business Name',
      email: 'finance@yourbusiness.com',
      address: '456 Business Ave, San Francisco, CA'
    }
  },
  {
    date: '2024-03-08',
    paymentId: 'INV-002',
    client: 'Digital Marketing Pro',
    amount: 1800,
    currency: 'USDC',
    status: 'paid',
    dueDate: '2024-03-22',
    fromAddress: '0x2345678901abcdef2345678901abcdef23456789',
    toAddress: '0xbcdef1234567890abcdef1234567890abcdef123',
    reason: 'UI/UX Design Services',
    network: 'Ethereum',
    clientDetails: {
      name: 'Digital Marketing Pro',
      email: 'accounts@dmp.com',
      address: '789 Marketing Street, New York, NY'
    },
    businessDetails: {
      name: 'Your Business Name',
      email: 'finance@yourbusiness.com',
      address: '456 Business Ave, San Francisco, CA'
    }
  },
  {
    date: '2024-03-07',
    paymentId: 'INV-003',
    client: 'Global Innovations Ltd',
    amount: 3500,
    currency: 'USDC',
    status: 'overdue',
    dueDate: '2024-03-05',
    fromAddress: '0x3456789012abcdef3456789012abcdef34567890',
    toAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
    reason: 'Software Development Consulting',
    network: 'Ethereum',
    clientDetails: {
      name: 'Global Innovations Ltd',
      email: 'finance@globalinnovations.com',
      address: '321 Innovation Hub, London, UK'
    },
    businessDetails: {
      name: 'Your Business Name',
      email: 'finance@yourbusiness.com',
      address: '456 Business Ave, San Francisco, CA'
    }
  }
]; 