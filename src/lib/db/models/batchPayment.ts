import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema({
  address: { type: String, required: true },
  amount: { type: String, required: true },
  reason: { type: String }
});

const batchPaymentSchema = new mongoose.Schema({
  transactionHash: { type: String, required: true },
  payerAddress: { type: String, required: true },
  recipients: [recipientSchema],
  status: { type: String, required: true, default: 'paid' },
  paidAt: { type: Date, required: true }
}, {
  timestamps: true
});

export const BatchPaymentModel = mongoose.models.BatchPayment || mongoose.model('BatchPayment', batchPaymentSchema); 