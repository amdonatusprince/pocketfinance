import { Types } from "@requestnetwork/request-client.js";
import { createRequestClient } from "./utils/requestUtil";


export const retrieveRequest = async (paymentReference: string) => {
  const response = await fetch(`https://api.request.network/v1/request/${paymentReference}`, {
    method: 'GET',
    headers: {
      'x-api-key': process.env.REQUEST_API_KEY!,
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const retrieveSingleRequest = async (requestId: string) => {
  const requestClient = createRequestClient();
  const request = await requestClient.fromRequestId(requestId);
  const requestData = request.getData();
  return requestData;
};

export const initiateDirectPayment = async (
  payee: string,
  amount: string,
  invoiceCurrency: string,
  paymentCurrency: string
) => {
  const response = await fetch('https://api.request.network/v1/pay', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_REQUEST_API_KEY!,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payee,
      amount,
      invoiceCurrency,
      paymentCurrency
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
