import { z } from 'zod';

// Shared sub-schemas
const AddressDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  address: z.string().min(1, 'Address is required'),
});

export const InvoiceStatus = z.enum([
  'pending',
  'paid',
  'overdue'
]);

export const PaymentFrequency = z.enum([
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
]);

export const InvoiceSchema = z.object({
  // Request Network specific fields
  requestId: z.string().optional(),
  paymentReference: z.string().optional(),
  
  // Payment details
  payerAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.string(),
  currency: z.literal('USDC'),
  status: InvoiceStatus.default('pending'),
  
  // Invoice metadata
  reason: z.string().optional(),
  dueDate: z.string(),
  createdAt: z.string(),
  
  // Recurrence
  isRecurring: z.boolean().default(false),
  recurrence: z.object({
    frequency: PaymentFrequency,
  }).optional().nullable(),
  
  // Additional details
  clientDetails: AddressDetailsSchema,
  businessDetails: AddressDetailsSchema,
});

export type Invoice = z.infer<typeof InvoiceSchema>; 