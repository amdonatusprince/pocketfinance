import { publicClientToProvider } from "./view/RequestProvider";
import { walletClientToSigner } from "./view/RequestSigner";
import { createRequestClient } from "./utils/requestUtil";
import { hasSufficientFunds } from "@requestnetwork/payment-processor";
import { approveErc20, hasErc20Approval } from "@requestnetwork/payment-processor"
import { payRequest as processPayRequest } from "@requestnetwork/payment-processor";
import { 
  payEthFeeProxyRequest, 
  prepareEthFeeProxyPaymentTransaction,
  validateEthFeeProxyRequest 
} from "@requestnetwork/payment-processor";

export type RequestStatus = 'checking' | 'insufficient-funds' | 'needs-approval' | 'approving' | 'approved' | 'paying' | 'confirming' | 'completed' | 'error';

export interface PaymentResult {
  status: RequestStatus;
  data?: any;
  error?: string;
  transactions?: {
    data: string;
    to: string;
    value: {
      type: string;
      hex: string;
    };
  }[];
}

export async function handleERC20PayRequest(
  requestId: string,
  payerAddress: string,
  publicClient: any,
  walletClient: any,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');
    
    const requestClient = createRequestClient()
    const request = await requestClient.fromRequestId(requestId);
    const requestData = request.getData();
    const provider = publicClient ? publicClientToProvider(publicClient) : undefined;
    const signer = walletClient ? walletClientToSigner(walletClient) : undefined;
    
    // Check for sufficient funds
    const _hasSufficientFunds = await hasSufficientFunds({
      request: requestData,
      address: payerAddress as string,
      providerOptions: {
        provider: provider,
      }
    });

    if (!_hasSufficientFunds) {
      updateStatus('insufficient-funds');
      return {
        status: 'insufficient-funds',
        error: "Insufficient funds to complete this payment"
      };
    }

    // Check ERC20 approval
    updateStatus('needs-approval');
    const _hasErc20Approval = await hasErc20Approval(
        requestData,
        payerAddress,
        provider
    );


    if (!_hasErc20Approval) {
      try {
        updateStatus('approving');
        const approvalTx = await approveErc20(requestData, signer);
        await approvalTx.wait(2);
        updateStatus('approved');
      } catch (error) {
        updateStatus('error');
        return {
          status: 'error',
          error: "Failed to approve ERC20 token transfer"
        };
      }
    }

    // Process payment
    updateStatus('paying');
    const paymentTx = await processPayRequest(requestData, signer);
    await paymentTx.wait(2);

    // Wait for confirmation
    updateStatus('confirming');
    const confirmedRequestData = await request.waitForConfirmation();

    // Verify the payment was successful
    let updatedRequestData = confirmedRequestData;
    while (updatedRequestData.balance?.balance != null && 
           updatedRequestData.balance.balance < updatedRequestData.expectedAmount) {
      updatedRequestData = await request.refresh();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    updateStatus('completed');
    return {
      status: 'completed',
      data: updatedRequestData
    };

  } catch (error) {
    updateStatus('error');
    console.log(error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

export async function handlePayRequest(
  paymentReference: string,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');

    // Get payment calldata
    const response = await fetch(`https://api.request.network/v1/request/${paymentReference}/pay`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_REQUEST_API_KEY!,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we need approval for ERC20 tokens
    if (data.metadata.needsApproval) {
      updateStatus('needs-approval');
      const approvalTx = data.transactions[data.metadata.approvalTransactionIndex];
      return {
        status: 'needs-approval',
        transactions: [approvalTx]
      };
    }

    // Return payment transaction
    updateStatus('paying');
    return {
      status: 'paying',
      transactions: data.transactions
    };

  } catch (error) {
    updateStatus('error');
    console.error(error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
}

export async function checkPaymentStatus(
  paymentReference: string,
  onStatusChange?: (status: RequestStatus) => void
): Promise<PaymentResult> {
  const updateStatus = (status: RequestStatus) => {
    if (onStatusChange) onStatusChange(status);
  };

  try {
    updateStatus('checking');

    const response = await fetch(`https://api.request.network/v1/request/${paymentReference}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_REQUEST_API_KEY!',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.hasBeenPaid) {
      updateStatus('completed');
      return {
        status: 'completed',
        data
      };
    }

    return {
      status: 'paying',
      data
    };

  } catch (error) {
    updateStatus('error');
    console.error(error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    };
  }
} 