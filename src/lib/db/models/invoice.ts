import mongoose, { Schema, Document } from 'mongoose';
import { Invoice } from '@/lib/schemas/invoice';

const AddressDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
}, { _id: false });

export interface IInvoice extends Document {
  requestId: string;
  paymentReference: string;
  payerAddress: string;
  recipientAddress: string;
  amount: string;
  currency: 'USDC';
  status: 'paid' | 'pending' | 'overdue';
  reason: string;
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
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

const InvoiceSchema = new Schema<IInvoice>({
  requestId: { type: String, unique: true },
  paymentReference: { type: String },
  
  payerAddress: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  amount: { type: String, required: true },
  currency: { type: String, required: true, enum: ['USDC'] },
  status: { 
    type: String, 
    required: true, 
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  
  reason: String,
  dueDate: { type: String, required: true },
  createdAt: { type: String, required: true },
  paidAt: { type: String, required: false },
  
  isRecurring: { type: Boolean, default: false },
  recurrence: {
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function(this: IInvoice) { return this.isRecurring; }
    },
    interval: { 
      type: Number, 
      required: function(this: IInvoice) { return this.isRecurring; }
    },
    endDate: { 
      type: String,
      required: false
    }
  },
  
  clientDetails: { type: AddressDetailsSchema, required: true },
  businessDetails: { type: AddressDetailsSchema, required: true },
}, {
  timestamps: true,
  collection: 'invoice'
});

// Create indexes for better query performance
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ payerAddress: 1 });
InvoiceSchema.index({ recipientAddress: 1 });

export const InvoiceModel = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema); 