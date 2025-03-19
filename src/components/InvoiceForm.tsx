'use client';

import { useState } from 'react';
import { createRequest } from './requests/CreateRequest';
import { useWalletClient } from 'wagmi';
import { toast } from 'react-hot-toast';
import InvoicePreview from './InvoicePreview';
import { Eye, EyeOff } from 'lucide-react';

interface InvoiceFormProps {
  recipientAddress: string;
  onSuccess?: () => void;
}

export default function InvoiceForm({ recipientAddress, onSuccess }: InvoiceFormProps) {
  const { data: walletClient } = useWalletClient();
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFormState = {
    payerAddress: '',
    amount: '',
    reason: '',
    dueDate: '',
    isRecurring: false,
    frequency: 'MONTHLY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    clientDetails: {
      name: '',
      email: '',
      address: ''
    },
    businessDetails: {
      name: '',
      email: '',
      address: ''
    }
  };
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setShowPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletClient) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        payerAddress: formData.payerAddress,
        expectedAmount: formData.amount,
        recipientAddress: recipientAddress,
        reason: formData.reason,
        dueDate: formData.dueDate,
        isRecurring: formData.isRecurring,
        ...(formData.isRecurring && {
          recurrence: {
            frequency: formData.frequency
          }
        }),
        contentData: {
          clientDetails: formData.clientDetails,
          businessDetails: formData.businessDetails
        }
      };

      await createRequest(requestData);
      toast.success('Invoice created successfully!');
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show Preview
            </>
          )}
        </button>
      </div>

      {showPreview ? (
        <InvoicePreview data={formData} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
          {/* Payment Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payer Wallet Address
                </label>
                <input
                  type="text"
                  name="payerAddress"
                  value={formData.payerAddress}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Recurring Payment Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isRecurring: e.target.checked
                  }))}
                  className="h-4 w-4 text-[#007BFF] focus:ring-[#007BFF] border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Recurring Payment
                </label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Purpose/Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter the purpose of this invoice..."
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                rows={2}
                required
              />
            </div>
          </div>

          {/* Client and Business Details in a two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Details</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="clientDetails.name"
                    value={formData.clientDetails.name}
                    onChange={handleChange}
                    placeholder="Client's full name"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="clientDetails.email"
                    value={formData.clientDetails.email}
                    onChange={handleChange}
                    placeholder="client@example.com"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="clientDetails.address"
                    value={formData.clientDetails.address}
                    onChange={handleChange}
                    placeholder="Client's business address"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Details</h4>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="businessDetails.name"
                    value={formData.businessDetails.name}
                    onChange={handleChange}
                    placeholder="Your business name"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="businessDetails.email"
                    value={formData.businessDetails.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="businessDetails.address"
                    value={formData.businessDetails.address}
                    onChange={handleChange}
                    placeholder="Your business address"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-[#007BFF] focus:border-[#007BFF] bg-white dark:bg-gray-800 text-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={!walletClient || isSubmitting}
              className="w-full px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                'Create Invoice'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 