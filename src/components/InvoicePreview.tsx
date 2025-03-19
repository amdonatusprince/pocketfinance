import Image from 'next/image';
import { Clock } from 'lucide-react';

interface InvoicePreviewProps {
  data: {
    payerAddress: string;
    amount: string;
    reason: string;
    dueDate: string;
    isRecurring: boolean;
    frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
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
  };
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">INVOICE</h2>
          <div className="space-y-1 mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Due Date: {data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Not specified'}
            </p>
            {data.isRecurring && (
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <Clock className="w-4 h-4" />
                <span>Recurring {data.frequency?.toLowerCase() || 'monthly'} payment</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <Image src="/usd-coin.svg" alt="USDC" width={30} height={30} />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {data.amount || '0.00'}
            </span>
          </div>
          {data.isRecurring && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Billed {data.frequency?.toLowerCase() || 'monthly'}
            </p>
          )}
        </div>
      </div>

      {/* Business & Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">From</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-medium">{data.businessDetails.name || 'Business Name'}</p>
            <p>{data.businessDetails.email || 'business@example.com'}</p>
            <p className="whitespace-pre-wrap">{data.businessDetails.address || 'Business Address'}</p>
            <p className="font-mono mt-2 text-xs break-all">{data.payerAddress || '0x...'}</p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">To</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p className="font-medium">{data.clientDetails.name || 'Client Name'}</p>
            <p>{data.clientDetails.email || 'client@example.com'}</p>
            <p className="whitespace-pre-wrap">{data.clientDetails.address || 'Client Address'}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {data.reason || 'No description provided'}
        </p>
      </div>

      {/* Payment Terms */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Payment Terms</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p>Payment in USDC via Ethereum network</p>
          {data.isRecurring ? (
            <p className="mt-1">
              This is a recurring payment that will be billed {data.frequency?.toLowerCase() || 'monthly'}
            </p>
          ) : (
            <p className="mt-1">One-time payment due by {new Date(data.dueDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          This invoice will be processed on the Ethereum network using USDC.
          {data.isRecurring && ' Recurring payments will be automatically processed based on the specified schedule.'}
        </p>
      </div>
    </div>
  );
} 