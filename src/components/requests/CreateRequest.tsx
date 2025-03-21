'use client';

export enum REQUEST_STATUS {
  AWAITING_INPUT = "awaiting input",
  SUBMITTING = "submitting",
  PERSISTING_TO_IPFS = "persisting to ipfs",
  PERSISTING_ON_CHAIN = "persisting on-chain",
  REQUEST_CONFIRMED = "request confirmed",
  ERROR_OCCURRED = "error occurred"
}

export interface CreateRequestParams {
  payerAddress: string;
  expectedAmount: string;
  recipientAddress: string;
  reason?: string;
  dueDate?: string;
  isRecurring?: boolean;
  recurrence?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  };
  contentData: {
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
  onStatusChange?: (status: REQUEST_STATUS) => void;
}

export async function createRequest({
  payerAddress,
  expectedAmount,
  recipientAddress,
  reason,
  dueDate,
  isRecurring,
  recurrence,
  contentData,
  onStatusChange
}: CreateRequestParams) {
  try {
    onStatusChange?.(REQUEST_STATUS.SUBMITTING);
    
    const apiKey = process.env.NEXT_PUBLIC_REQUEST_API_KEY;
    if (!apiKey) {
      throw new Error('REQUEST_API_KEY is not set in environment variables');
    }

    const requestBody = {
      payer: payerAddress,
      payee: recipientAddress,
      amount: expectedAmount,
      invoiceCurrency: 'fUSDC-sepolia',
      paymentCurrency: 'fUSDC-sepolia',
    };

    // Only add recurrence if isRecurring is true and frequency is provided
    if (isRecurring && recurrence?.frequency) {
      Object.assign(requestBody, {
        recurrence: {
          startDate: new Date().toISOString(),
          frequency: recurrence.frequency
        }
      });
    }

    // First, create the request in Request Network
    const response = await fetch('https://api.request.network/v1/request', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // After getting requestId and paymentReference, store in MongoDB
    const invoiceData = {
      requestId: data.requestID,
      paymentReference: data.paymentReference,
      payerAddress,
      recipientAddress,
      amount: expectedAmount,
      currency: 'USDC',
      status: 'pending',
      reason,
      dueDate,
      createdAt: new Date().toISOString(),
      isRecurring,
      ...(isRecurring && recurrence && { recurrence }),
      clientDetails: contentData.clientDetails,
      businessDetails: contentData.businessDetails
    };

    // Store in MongoDB
    const storeResponse = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!storeResponse.ok) {
      const errorData = await storeResponse.json();
      console.error('Store response error:', errorData);
      if (errorData.details) {
        const errorMessage = Array.isArray(errorData.details) 
          ? errorData.details.map((err: any) => `${err.path}: ${err.message}`).join(', ')
          : errorData.details;
        throw new Error(errorMessage);
      }
      throw new Error(errorData.error || 'Failed to store invoice in database');
    }

    // Send email notifications
    // 1. Notify business
    await fetch('/api/notification/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: contentData.businessDetails.email,
        type: 'invoice_created_business',
        amount: expectedAmount,
        dueDate,
        requestId: data.requestID,
        payerAddress,
        recipientAddress,
        businessDetails: contentData.businessDetails,
        clientDetails: contentData.clientDetails,
        reason
      }),
    });

    // 2. Notify client
    await fetch('/api/notification/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: contentData.clientDetails.email,
        type: 'invoice_created_client',
        amount: expectedAmount,
        dueDate,
        requestId: data.requestID,
        payerAddress,
        recipientAddress,
        businessDetails: contentData.businessDetails,
        clientDetails: contentData.clientDetails,
        reason
      }),
    });

    // 3. Schedule reminder email for a day before due date
    if (dueDate) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);
      const now = new Date();
      
      // Only schedule if the reminder date is in the future
      if (reminderDate > now) {
        setTimeout(async () => {
          await fetch('/api/notification/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: contentData.clientDetails.email,
              type: 'due_date_reminder',
              amount: expectedAmount,
              dueDate,
              requestId: data.requestID,
              payerAddress,
              recipientAddress,
              businessDetails: contentData.businessDetails,
              clientDetails: contentData.clientDetails,
              reason
            }),
          });
        }, reminderDate.getTime() - now.getTime());
      }
    }

    onStatusChange?.(REQUEST_STATUS.REQUEST_CONFIRMED);
    return { requestData: data };

  } catch (error) {
    console.error('Error in createRequest:', error);
    onStatusChange?.(REQUEST_STATUS.ERROR_OCCURRED);
    throw error;
  }
}