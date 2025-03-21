'use client';

import { WalletClient, Chain, PublicClient } from 'viem';

export type RequestStatus = 
  | 'checking'
  | 'needs-approval'
  | 'approving'
  | 'paying'
  | 'confirming'
  | 'completed'
  | 'error'
  | 'insufficient-funds';

interface PayRequestParams {
  paymentReference: string;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: `0x${string}`;
  chain: Chain;
  onStatusChange?: (status: RequestStatus) => void;
}

interface PaymentCalldata {
  transactions: {
    data: string;
    to: string;
    value: bigint;
  }[];
  metadata: {
    stepsRequired: number;
    needsApproval: boolean;
    approvalTransactionIndex: number;
  };
}

export async function handlePayRequest({
  paymentReference,
  publicClient,
  walletClient,
  account,
  chain,
  onStatusChange
}: PayRequestParams) {
  try {
    onStatusChange?.('checking');

    // Check if user is on the correct network
    const currentChain = await publicClient.getChainId();
    if (currentChain !== chain.id) {
      return {
        status: 'error' as const,
        error: `Please switch to ${chain.name} network to make this payment`
      };
    }

    const apiKey = process.env.NEXT_PUBLIC_REQUEST_API_KEY;
    if (!apiKey) {
      throw new Error('REQUEST_API_KEY is not set in environment variables');
    }

    // Get payment calldata from Request Network API
    const response = await fetch(`https://api.request.network/v1/request/${paymentReference}/pay`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const paymentData: PaymentCalldata = await response.json();

    // Check if approval is needed
    if (paymentData.metadata.needsApproval) {
      onStatusChange?.('needs-approval');
      
      // Get the approval transaction
      const approvalTx = paymentData.transactions[paymentData.metadata.approvalTransactionIndex];
      
      try {
        // Send approval transaction
        onStatusChange?.('approving');
        const approvalHash = await walletClient.sendTransaction({
          account,
          chain,
          to: approvalTx.to as `0x${string}`,
          data: approvalTx.data as `0x${string}`,
          value: approvalTx.value
        });

        // Wait for approval confirmation
        await publicClient.waitForTransactionReceipt({ hash: approvalHash });
      } catch (error: any) {
        if (error.name === 'UserRejectedRequestError' || 
            error.message?.includes('User denied transaction signature') ||
            error.message?.includes('User rejected the request')) {
          return {
            status: 'error' as const,
            error: 'Payment cancelled by user'
          };
        }
        if (error.message?.includes('does not match the target chain')) {
          return {
            status: 'error' as const,
            error: `Please switch to ${chain.name} network to make this payment`
          };
        }
        throw error;
      }
    }

    try {
      // Send payment transaction
      onStatusChange?.('paying');
      const paymentTx = paymentData.transactions[paymentData.metadata.stepsRequired - 1];
      const paymentHash = await walletClient.sendTransaction({
        account,
        chain,
        to: paymentTx.to as `0x${string}`,
        data: paymentTx.data as `0x${string}`,
        value: paymentTx.value
      });

      // Wait for payment confirmation
      onStatusChange?.('confirming');
      await publicClient.waitForTransactionReceipt({ hash: paymentHash });
    } catch (error: any) {
      if (error.name === 'UserRejectedRequestError' || 
          error.message?.includes('User denied transaction signature') ||
          error.message?.includes('User rejected the request')) {
        return {
          status: 'error' as const,
          error: 'Payment cancelled by user'
        };
      }
      if (error.message?.includes('does not match the target chain')) {
        return {
          status: 'error' as const,
          error: `Please switch to ${chain.name} network to make this payment`
        };
      }
      throw error;
    }

    // Update invoice status in database
    const updateResponse = await fetch(`/api/invoices/${paymentReference}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'paid',
        paidAt: new Date().toISOString()
      }),
    });

    if (!updateResponse.ok) {
      console.error('Failed to update invoice status in database');
    }

    try {
      // Get invoice details for notifications
      const invoiceResponse = await fetch(`/api/invoices/${paymentReference}`);
      if (!invoiceResponse.ok) {
        throw new Error('Failed to fetch invoice details');
      }

      const invoice = await invoiceResponse.json();

      if (!invoice.businessDetails?.email || !invoice.clientDetails?.email) {
        throw new Error('Missing email details in invoice');
      }

      // Send payment received notification to recipient
      const recipientResponse = await fetch('/api/notification/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: invoice.businessDetails.email,
          type: 'payment_received',
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          requestId: invoice.requestId,
          payerAddress: account,
          recipientAddress: invoice.recipientAddress,
          businessDetails: invoice.businessDetails,
          clientDetails: invoice.clientDetails,
          reason: invoice.reason
        }),
      });

      if (!recipientResponse.ok) {
        const error = await recipientResponse.json();
        throw new Error(`Failed to send recipient notification: ${error.message}`);
      }

      // Send payment sent notification to payer
      const payerResponse = await fetch('/api/notification/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: invoice.clientDetails.email,
          type: 'payment_sent',
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          requestId: invoice.requestId,
          payerAddress: account,
          recipientAddress: invoice.recipientAddress,
          businessDetails: invoice.businessDetails,
          clientDetails: invoice.clientDetails,
          reason: invoice.reason
        }),
      });

      if (!payerResponse.ok) {
        const error = await payerResponse.json();
        throw new Error(`Failed to send payer notification: ${error.message}`);
      }

      console.log('Payment notifications sent successfully');
    } catch (error) {
      console.error('Error sending payment notifications:', error);
      // Don't throw the error as we don't want to fail the whole payment process
      // just because notifications failed
    }

    onStatusChange?.('completed');
    return { status: 'completed' as const };

  } catch (error: any) {
    console.error('Error in handlePayRequest:', error);
    onStatusChange?.('error');
    
    // Check for specific error conditions
    if (error.message?.includes('insufficient funds')) {
      onStatusChange?.('insufficient-funds');
      return { 
        status: 'insufficient-funds' as const,
        error: 'Insufficient funds to complete the payment'
      };
    }

    return { 
      status: 'error' as const,
      error: error.message || 'Failed to process payment'
    };
  }
}
