import { Types } from "@requestnetwork/request-client.js";
import { Invoice } from '@/types/invoice';

// Dummy payment transactions (invoices where user is the payer)
export const dummyPayments: Invoice[] = [
  {
    id: 'PAY-001',
    date: '2025-03-15',
    createdAt: '2025-03-15T10:30:00Z',
    dueDate: '2024-03-30',
    client: 'Web Design Agency',
    amount: '1000000000', // 1000 USDC
    currency: {
      decimals: 6,
      value: 'USDC'
    },
    status: 'pending' as const,
    type: 'single',
    payerAddress: "0x03E15BD74ee8AdBef0C58584fc6d2b859Cd053E6", // User's address
    recipientAddress: '0x1234567890123456789012345678901234567890',
    reason: 'Website Development Services - March 2024',
    network: 'Ethereum',
    clientDetails: {
      name: 'Web Design Agency Ltd',
      email: 'billing@webdesignagency.com',
      address: '123 Design Street, Creative City, CC 12345'
    },
    businessDetails: {
      name: 'Your Company Name',
      email: 'your.email@company.com',
      address: '456 Business Ave, Enterprise City, EC 67890'
    }
  },
  {
    id: 'PAY-002',
    date: '2024-03-14',
    createdAt: '2024-03-14T15:45:00Z',
    dueDate: '2024-03-29',
    client: 'Marketing Solutions',
    amount: '500000000', // 500 USDC
    currency: {
      decimals: 6,
      value: 'USDC'
    },
    status: 'pending' as const,
    type: 'single',
    payerAddress: "0x03E15BD74ee8AdBef0C58584fc6d2b859Cd053E6", // User's address
    recipientAddress: '0x9876543210987654321098765432109876543210',
    reason: 'Digital Marketing Campaign - Q1 2024',
    network: 'Ethereum',
    clientDetails: {
      name: 'Marketing Solutions Inc',
      email: 'accounts@marketingsolutions.com',
      address: '789 Marketing Road, Digital City, DC 34567'
    },
    businessDetails: {
      name: 'Your Company Name',
      email: 'your.email@company.com',
      address: '456 Business Ave, Enterprise City, EC 67890'
    }
  },
  {
    id: 'PAY-003',
    date: '2024-03-10',
    createdAt: '2024-03-10T09:15:00Z',
    dueDate: '2024-03-25',
    client: 'Tech Consulting Group',
    amount: '2500000000', // 2500 USDC
    currency: {
      decimals: 6,
      value: 'USDC'
    },
    status: 'paid' as const,
    type: 'single',
    payerAddress: "0xfC1628EED58440b7a587d7ff3dc54654D0850e2A", // User's address
    recipientAddress: '0x5555555555555555555555555555555555555555',
    reason: 'Technical Consultation Services - February 2024',
    network: 'Ethereum',
    clientDetails: {
      name: 'Tech Consulting Group LLC',
      email: 'finance@techconsulting.com',
      address: '321 Tech Park, Innovation City, IC 89012'
    },
    businessDetails: {
      name: 'Your Company Name',
      email: 'your.email@company.com',
      address: '456 Business Ave, Enterprise City, EC 67890'
    }
  },
  {
    id: 'PAY-004',
    date: '2024-03-05',
    createdAt: '2024-03-05T14:20:00Z',
    dueDate: '2024-03-20',
    client: 'Content Writers Co',
    amount: '750000000', // 750 USDC
    currency: {
      decimals: 6,
      value: 'USDC'
    },
    status: 'paid' as const,
    type: 'single',
    payerAddress: "0xfC1628EED58440b7a587d7ff3dc54654D0850e2A", // User's address
    recipientAddress: '0x6666666666666666666666666666666666666666',
    reason: 'Content Writing Services - Q1 2024',
    network: 'Ethereum',
    clientDetails: {
      name: 'Content Writers Co',
      email: 'payments@contentwriters.com',
      address: '654 Writing Lane, Creative District, CD 45678'
    },
    businessDetails: {
      name: 'Your Company Name',
      email: 'your.email@company.com',
      address: '456 Business Ave, Enterprise City, EC 67890'
    }
  }
]; 