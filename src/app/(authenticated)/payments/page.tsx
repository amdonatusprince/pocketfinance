'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { dummyPayments } from '@/lib/dummy-data';
import { formatDistanceToNow } from 'date-fns';
import { CreditCard, CheckSquare, X, Plus, Download, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import BatchPaymentForm from '@/components/BatchPaymentForm';
import { Invoice } from '@/types/invoice';

interface Recipient {
  address: string;
  amount: string;
  reason?: string;
}

export default function PaymentsPage() {
  const [isBatchPaymentOpen, setIsBatchPaymentOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Invoice | null>(null);
  const { user } = useAuth();

  console.log(user);

  // Filter payments where current user is the payer
  const payments = dummyPayments.filter(
    payment => payment.payerAddress === (user?.wallet?.address)
  );

  // Calculate stats
  const totalPaid = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount) / Math.pow(10, payment.currency.decimals), 0);

  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + Number(payment.amount) / Math.pow(10, payment.currency.decimals), 0);

  const thisMonthPayments = payments
    .filter(payment => new Date(payment.date).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + Number(payment.amount) / Math.pow(10, payment.currency.decimals), 0);

  const batchPayments = payments
    .filter(payment => payment.type === 'batch')
    .reduce((sum, payment) => sum + Number(payment.amount) / Math.pow(10, payment.currency.decimals), 0);

  const handleBatchPayment = (recipients: Recipient[]) => {
    console.log('Processing batch payment:', recipients);
    setIsBatchPaymentOpen(false);
  };

  const downloadTemplate = () => {
    window.open('/batch-payment-template.csv', '_blank');
  };

  const getStatusStyle = (status: 'paid' | 'pending' | 'cancelled') => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Stats cards data
  const stats = [
    {
      title: 'Total Paid',
      amount: totalPaid,
      transactions: payments.filter(p => p.status === 'paid').length,
      icon: <ArrowUpRight className="w-4 h-4 text-green-500" />,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Pending Payments',
      amount: pendingAmount,
      transactions: payments.filter(p => p.status === 'pending').length,
      icon: <Clock className="w-4 h-4 text-yellow-500" />,
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'This Month',
      amount: thisMonthPayments,
      transactions: payments.filter(p => new Date(p.date).getMonth() === new Date().getMonth()).length,
      icon: <ArrowDownRight className="w-4 h-4 text-blue-500" />,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Batch Payments',
      amount: batchPayments,
      transactions: payments.filter(p => p.type === 'batch').length,
      icon: <CreditCard className="w-4 h-4 text-purple-500" />,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} p-4 rounded-lg shadow-sm border border-[#007BFF]/20`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="flex items-center">
                    <Image
                      src="/usd-coin.svg"
                      alt="USDC"
                      width={35}
                      height={35}
                      className="mr-1"
                    />
                    <p className={`text-xl font-semibold ${stat.textColor}`}>
                      {stat.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {stat.transactions} transactions
                </p>
              </div>
              <div className="p-2 rounded-full bg-white dark:bg-gray-800 shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
        </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <div className="flex flex-row w-full sm:w-auto gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-1.5 px-2 py-1 text-xs rounded-lg bg-[#007BFF] text-white hover:bg-transparent hover:text-[#007BFF] hover:border-[#007BFF] border border-transparent transition-colors"
          >
            <Download className="w-3 h-3" />
            CSV Template
          </button>
          <button
            onClick={() => setIsBatchPaymentOpen(true)}
            className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs rounded-lg border border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF] hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
            Batch Payment
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-[#007BFF]/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => {
                    setSelectedPayment(payment);
                    setIsDetailsModalOpen(true);
                  }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.type || 'single'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {payment.recipientAddress.slice(0, 6)}...{payment.recipientAddress.slice(-4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center gap-1">
                      <Image src="/usd-coin.svg" alt="USDC" width={20} height={20} />
                      {(Number(payment.amount) / Math.pow(10, payment.currency.decimals)).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(payment.status)}`}>
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      <Dialog
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Modal Header with Amount and Status */}
            <div className="bg-[#007BFF] text-white p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium opacity-90">Amount</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl sm:text-3xl font-bold">
                      {selectedPayment ? (Number(selectedPayment.amount) / Math.pow(10, selectedPayment.currency.decimals)).toFixed(2) : '0'} USDC
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 sm:px-3 text-xs sm:text-sm rounded-full font-medium ${getStatusStyle(selectedPayment?.status || 'pending')}`}>
                      {selectedPayment?.status?.toUpperCase()}
                    </span>
                    <p className="text-xs sm:text-sm mt-1 opacity-90">
                      {selectedPayment?.date ? new Date(selectedPayment.date).toLocaleString() : '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-white/80 hover:text-white"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Payment Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Payment Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Payment ID</span>
                      <span className="text-gray-900 dark:text-white font-mono text-right break-all ml-4">{selectedPayment?.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Network</span>
                      <span className="text-gray-900 dark:text-white text-right">{selectedPayment?.network}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Due Date</span>
                      <span className="text-gray-900 dark:text-white text-right">
                        {selectedPayment?.dueDate ? new Date(selectedPayment.dueDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Payment Purpose</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white break-words">{selectedPayment?.reason || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Wallet Addresses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">From (You)</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedPayment?.payerAddress}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">To</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedPayment?.recipientAddress}
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
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.clientDetails.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.clientDetails.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Address</span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.clientDetails.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Business Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Name</span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.businessDetails.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Email</span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.businessDetails.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Address</span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">{selectedPayment?.businessDetails.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              {selectedPayment?.status === 'pending' && (
                <div className="mt-6">
                  <button
                    onClick={() => {
                      // TODO: Implement payment logic
                      console.log('Processing payment for:', selectedPayment.id);
                    }}
                    className="w-full px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors"
                  >
                    Pay Now
                  </button>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Batch Payment Modal */}
      {isBatchPaymentOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Batch Payment</h2>
              <button
                onClick={() => setIsBatchPaymentOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <BatchPaymentForm
                onSubmit={handleBatchPayment}
                onCancel={() => setIsBatchPaymentOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 