"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  Plus,
  X,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { REQUEST_STATUS } from "@/components/requests/CreateRequest";
import { useAuth } from "@/hooks/useAuth";
import { Transaction } from "@/types/transaction";
import InvoiceForm from "@/components/InvoiceForm";
import { useInvoices } from "@/hooks/useInvoices";
import { handlePayRequest, RequestStatus } from "@/components/requests/PayRequest";
import { useWalletClient, usePublicClient } from "wagmi";
import { toast } from "react-hot-toast";
import { sepolia } from 'viem/chains';


export default function InvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [createStatus, setCreateStatus] = useState<REQUEST_STATUS>(REQUEST_STATUS.AWAITING_INPUT);
  const [paymentStatus, setPaymentStatus] = useState<RequestStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const { user } = useAuth();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { invoices, stats, loading, error, refetch } = useInvoices(user?.address);

  const receivedInvoices = invoices.filter(invoice => invoice.recipientAddress === user?.address);
  const sentInvoices = invoices.filter(invoice => invoice.payerAddress === user?.address);

  const handlePayInvoice = async (invoice: Transaction) => {
    if (!invoice.paymentReference || !walletClient || !user?.address || !publicClient) {
      toast.error('Please connect your wallet to make a payment');
      return;
    }
    
    setPaymentStatus('checking');
    try {
      const result = await handlePayRequest({
        paymentReference: invoice.paymentReference,
        publicClient,
        walletClient,
        account: user.address as `0x${string}`,
        chain: sepolia,
        onStatusChange: (status: RequestStatus) => {
          setPaymentStatus(status);
        }
      });

      if (result.status === 'completed') {
        toast.success('Payment completed successfully!');
        setIsDetailsModalOpen(false);
        setPaymentStatus(null);
        refetch();
      } else if (result.status === 'error') {
        // Handle specific error messages
        if (result.error?.includes('switch to')) {
          toast.error(
            <div className="flex items-center gap-2">
              <span>{result.error}</span>
            </div>,
            { duration: 3000 }
          );
        } else if (result.error === 'Payment cancelled by user') {
          toast.error(
            <div className="flex items-center gap-2">
              <span>Payment cancelled</span>
              {selectedInvoice && (
                <button 
                  onClick={() => handlePayInvoice(selectedInvoice)}
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  Try Again
                </button>
              )}
            </div>,
            { duration: 3000 }
          );
        } else {
          toast.error(result.error || 'Payment failed');
        }
        setPaymentStatus(null);
      } else if (result.status === 'insufficient-funds') {
        toast.error(
          <div className="flex items-center gap-2">
            <span>Insufficient funds to complete this payment</span>
          </div>,
          { duration: 3000 }
        );
        setPaymentStatus(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
      setPaymentStatus(null);
    }
  };

  // Stats cards data based on active tab
  const statsCards = [
    {
      title: activeTab === 'received' ? "Total Invoiced" : "Total Paid",
      amount: activeTab === 'received' 
        ? (stats?.totalInvoiced?.amount ?? 0)
        : (stats?.totalPaid?.amount ?? 0),
      transactions: activeTab === 'received'
        ? (stats?.totalInvoiced?.transactions ?? 0)
        : (stats?.totalPaid?.transactions ?? 0),
      icon: <ArrowUpRight className="w-4 h-4 text-green-500" />,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: activeTab === 'received' ? "Paid Invoices" : "Pending Payments",
      amount: activeTab === 'received'
        ? (stats?.paidInvoices?.amount ?? 0)
        : (stats?.pendingAmount?.amount ?? 0),
      transactions: activeTab === 'received'
        ? (stats?.paidInvoices?.transactions ?? 0)
        : (stats?.pendingAmount?.transactions ?? 0),
      icon: <ArrowDownRight className="w-4 h-4 text-blue-500" />,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pending Amount",
      amount: stats?.pendingAmount?.amount ?? 0,
      transactions: stats?.pendingAmount?.transactions ?? 0,
      icon: <RefreshCw className="w-4 h-4 text-yellow-500" />,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Status Overview",
      pending: stats?.invoiceStatus?.pending ?? 0,
      overdue: stats?.invoiceStatus?.overdue ?? 0,
      icon: (
        <div className="flex gap-1">
          <Clock className="w-4 h-4 text-yellow-500" />
          <AlertCircle className="w-4 h-4 text-red-500" />
        </div>
      ),
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
    }
  ];

  const getStatusStyle = (status: "paid" | "pending" | "overdue") => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getInvoiceStatus = (invoice: Transaction) => {
    if (invoice.status === 'paid') return 'paid';
    if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return 'overdue';
    return 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'received'
              ? 'bg-[#007BFF] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Invoices Received
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'sent'
              ? 'bg-[#007BFF] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Payments Made
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => (
          <div
            key={stat.title}
            className={`${stat.bgColor} p-4 rounded-lg shadow-sm border border-[#007BFF]/20`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{stat.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  {"amount" in stat ? (
                    <div className="flex items-center">
                      <Image
                        src="/usd-coin.svg"
                        alt="USDC"
                        width={35}
                        height={35}
                        className="mr-1"
                      />
                      <p className={`text-xl font-semibold ${stat.textColor}`}>
                        {stat.amount}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600 dark:text-yellow-400">
                          {stat.pending} pending
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {stat.overdue} overdue
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {"transactions" in stat && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {stat.transactions} transactions
                  </p>
                )}
              </div>
              <div className="p-2 rounded-full bg-white dark:bg-gray-800 shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-[#007BFF]/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'received' ? "Recent Invoices" : "Recent Payments"}
          </h2>
          {activeTab === 'received' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF] hover:text-white transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading {activeTab === 'received' ? 'invoices' : 'payments'}...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : (activeTab === 'received' ? receivedInvoices : sentInvoices).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No {activeTab === 'received' ? 'invoices' : 'payments'} found
                  </td>
                </tr>
              ) : (
                (activeTab === 'received' ? receivedInvoices : sentInvoices).map((invoice) => (
                  <tr
                    key={invoice.requestId}
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setIsDetailsModalOpen(true);
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.requestId ? `${invoice.requestId.slice(0, 4)}...${invoice.requestId.slice(-6)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {invoice.clientDetails.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <Image
                          src="/usd-coin.svg"
                          alt="USDC"
                          width={25}
                          height={25}
                        />
                        {Number(invoice.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(getInvoiceStatus(invoice))}`}
                      >
                        {getInvoiceStatus(invoice).toUpperCase()}
                    </span>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString()
                        : "-"}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-4xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-white">
                Create Invoice
              </h2>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setCreateStatus(REQUEST_STATUS.AWAITING_INPUT);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>

            <InvoiceForm
              recipientAddress={user?.wallet?.address!}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                setCreateStatus(REQUEST_STATUS.AWAITING_INPUT);
                refetch(); // Refresh the data after successful creation
              }}
            />
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
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
                      {selectedInvoice?.amount} USDC
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 sm:px-3 text-xs sm:text-sm rounded-full font-medium ${getStatusStyle(getInvoiceStatus(selectedInvoice || {} as Transaction))}`}
                    >
                      {getInvoiceStatus(selectedInvoice || {} as Transaction).toUpperCase()}
                    </span>
                    <p className="text-xs sm:text-sm mt-1 opacity-90">
                      {selectedInvoice?.createdAt
                        ? new Date(selectedInvoice.createdAt).toLocaleString()
                        : "-"}
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

            {/* Pay Button for Payer */}
            {selectedInvoice && (activeTab === 'received' ? selectedInvoice.recipientAddress === user?.address : selectedInvoice.payerAddress === user?.address) && selectedInvoice.status === 'pending' && (
              <div className="px-4 sm:px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-center">
                <button
                  onClick={() => handlePayInvoice(selectedInvoice)}
                  disabled={paymentStatus === 'paying' || paymentStatus === 'confirming' || paymentStatus === 'approving' || paymentStatus === 'needs-approval' || paymentStatus === 'checking'}
                  className="w-full max-w-md px-4 py-2 bg-[#007BFF] text-white rounded-lg hover:bg-[#0056b3] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                >
                  {paymentStatus === 'paying' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing Payment...
                    </>
                  ) : paymentStatus === 'confirming' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming Payment...
                    </>
                  ) : paymentStatus === 'approving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Approving Token Transfer...
                    </>
                  ) : paymentStatus === 'needs-approval' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Checking Token Approval...
                    </>
                  ) : paymentStatus === 'checking' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Initializing Payment...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>
              </div>
            )}

            {/* Invoice Details */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Payment Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    Invoice Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Invoice ID
                      </span>
                      <span className="text-gray-900 dark:text-white font-mono text-right break-all ml-4">
                        {selectedInvoice?.requestId}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Network
                      </span>
                      <span className="text-gray-900 dark:text-white text-right">
                        Sepolia
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Due Date
                      </span>
                      <span className="text-gray-900 dark:text-white text-right">
                        {selectedInvoice?.dueDate
                          ? new Date(
                              selectedInvoice.dueDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    {selectedInvoice?.status === 'paid' && selectedInvoice?.paidAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Paid Date
                        </span>
                        <span className="text-gray-900 dark:text-white text-right">
                          {new Date(selectedInvoice.paidAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    Invoice Purpose
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-sm text-gray-900 dark:text-white break-words">
                      {selectedInvoice?.reason || "N/A"}
                    </p>
                  </div>

                  {/* Recurrence Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3"></h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedInvoice?.isRecurring ? (
                          <span>
                            Recurring payment -{" "}
                            {selectedInvoice.recurrence?.frequency?.toLowerCase()}{" "}
                            frequency
                          </span>
                        ) : (
                          "One-time payment"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                  Wallet Addresses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      From
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedInvoice?.payerAddress}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      To
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedInvoice?.recipientAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participant Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    Client Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Name
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.clientDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Email
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.clientDetails.email}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.clientDetails.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">
                    Business Details
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Name
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.businessDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Email
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.businessDetails.email}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Address
                      </span>
                      <span className="text-gray-900 dark:text-white break-words text-right ml-4">
                        {selectedInvoice?.businessDetails.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
} 
