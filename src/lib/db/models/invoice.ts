import mongoose from 'mongoose';
import { Invoice } from '@/lib/schemas/invoice';

const AddressDetailsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
}, { _id: false });

const InvoiceSchema = new mongoose.Schema<Invoice>({
  requestId: { type: String, unique: true },
  paymentReference: { type: String },
  
  payerAddress: { type: String, required: true },
  recipientAddress: { type: String, required: true },
  amount: { type: String, required: true },
  currency: { type: String, required: true, default: 'USDC' },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  
  reason: String,
  dueDate: { type: String, required: true },
  createdAt: { type: String, required: true },
  
  isRecurring: { type: Boolean, default: false },
  recurrence: {
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
      required: function(this: Invoice) { return this.isRecurring; }
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

export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema); 