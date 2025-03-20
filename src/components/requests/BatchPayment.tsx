import { Types } from "@requestnetwork/request-client.js";
import { RequestNetwork } from "@requestnetwork/request-client.js";
import { Web3SignatureProvider } from "@requestnetwork/web3-signature";
import { CurrencyTypes, RequestLogicTypes } from "@requestnetwork/types";
import { 
  approveErc20BatchConversionIfNeeded,
  payBatchConversionProxyRequest,
} from "@requestnetwork/payment-processor";
import { EnrichedRequest } from "@requestnetwork/payment-processor/dist/types";

interface Recipient {
  address: string;
  amount: string;
  reason?: string;
}

interface BatchPaymentParams {
  walletClient: any;
  payerAddress: string;
  recipients: Recipient[];
  onStatusChange?: (status: string) => void;
  onEmployeeProgress?: (completed: number, total: number) => void;
}

export async function createBatchPayment({
  walletClient,
  payerAddress,
  recipients,
  onStatusChange,
  onEmployeeProgress
}: BatchPaymentParams) {
  try {
    onStatusChange?.("Creating batch payment requests...");
    
    // Create in-memory RequestNetwork instance
    const web3SignatureProvider = new Web3SignatureProvider(walletClient);
    const inMemoryRequestNetwork = new RequestNetwork({
      nodeConnectionConfig: {
        baseURL: "https://gnosis.gateway.request.network",
      },
      signatureProvider: web3SignatureProvider,
      skipPersistence: true,
      useMockStorage: true
    });

    // Create individual requests for each recipient
    const enrichedRequests: EnrichedRequest[] = [];
    const requests: Types.IRequestData[] = [];
    let completedRequests = 0;

    const currency = {
      type: RequestLogicTypes.CURRENCY.ERC20,
      value: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
      network: 'sepolia' as CurrencyTypes.EvmChainName,
      // decimals: 6
    };

    for (const recipient of recipients) {
      const feeAmount = (Number(recipient.amount) * 0.001).toString(); // 0.1% fee
      const requestParameters = {
        requestInfo: {
          currency,
          expectedAmount: recipient.amount,
          payee: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: recipient.address
          },
          payer: {
            type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
            value: payerAddress
          },
          timestamp: Date.now(),
          paymentNetwork: {
            id: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
            parameters: {
              paymentNetworkName: 'sepolia',
              paymentAddress: recipient.address,
              feeAddress: "0x85CA836d014dA00537FdC04dFe8b07aeDc20FB69",  
              feeAmount,
            },
          },

        },
        signer: {
          type: Types.Identity.TYPE.ETHEREUM_ADDRESS,
          value: payerAddress
        }
      };

      onStatusChange?.(`Recipient ${completedRequests + 1}/${recipients.length}: Creating request...`);
      const inMemoryRequest = await inMemoryRequestNetwork.createRequest(requestParameters);
      const requestData = await inMemoryRequest.getData();
      console.log('Request data:', requestData);
      requests.push(requestData);
      
      enrichedRequests.push({
        paymentNetworkId: Types.Extension.PAYMENT_NETWORK_ID.ERC20_FEE_PROXY_CONTRACT,
        request: requestData,
        paymentSettings: { 
          maxToSpend: '0',
          currency
        }
      });

      completedRequests++;
      onEmployeeProgress?.(completedRequests, recipients.length);
    }

    // Handle USDC batch payment
    onStatusChange?.("Approving tokens for batch payment...");
    await approveErc20BatchConversionIfNeeded(
      enrichedRequests[0].request,
      payerAddress,
      walletClient,
      undefined,
      {
        currency,
        maxToSpend: '0'
      }
    );

    onStatusChange?.("Executing USDC batch payment...");
    const batchTx = await payBatchConversionProxyRequest(
      enrichedRequests,
      walletClient,
      {
        skipFeeUSDLimit: true,
        conversion: {
          currencyManager: undefined,
          currency
        }
      }
    );

    onStatusChange?.("Waiting for batch payment confirmation...");
    const receipt = await batchTx.wait(2);

    // Save each processed transaction to the database
    for (const [index, recipient] of recipients.entries()) {
      try {
        const response = await fetch('/api/batch-payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionHash: receipt.transactionHash,
            payerAddress,
            recipients: [recipient],
            status: 'paid',
            paidAt: new Date().toISOString(),
            batchIndex: index + 1,
            totalRecipients: recipients.length
          }),
        });

        if (!response.ok) {
          console.error(`Failed to store transaction for recipient ${index + 1}`);
        }
      } catch (error) {
        console.error(`Error saving transaction for recipient ${index + 1}:`, error);
      }
    }

    onStatusChange?.("Batch payment completed!");
    return {
      transactionHash: receipt.transactionHash,
      requests: enrichedRequests,
      receipt
    };

  } catch (error) {
    onStatusChange?.("Error in batch payment");
    console.error("Batch payment error:", error);
    throw error;
  }
}
