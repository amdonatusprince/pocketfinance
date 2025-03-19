import { Transaction } from '@/types/transaction';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  getStatusStyle: (status: 'completed' | 'paid' | 'pending' | 'overdue') => string;
}

export default function TransactionDetails({ transaction, getStatusStyle }: TransactionDetailsProps) {
  if (!transaction) return null;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
      {/* Payment Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
              <span className="text-gray-900 dark:text-white font-mono text-right break-all ml-4">{transaction.paymentId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Network</span>
              <span className="text-gray-900 dark:text-white text-right">{transaction.network}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Due Date</span>
              <span className="text-gray-900 dark:text-white text-right">
                {transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Transaction Purpose</h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-sm text-gray-900 dark:text-white break-words">{transaction.reason || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Wallet Addresses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {transaction.fromAddress}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
              {transaction.toAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Participant Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Client Details</h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Name</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.clientDetails.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.clientDetails.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Address</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.clientDetails.address}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Business Details</h3>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Name</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.businessDetails.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.businessDetails.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Address</span>
              <span className="text-gray-900 dark:text-white break-words text-right ml-4">{transaction.businessDetails.address}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 