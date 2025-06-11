
'use server';

import { z } from 'zod';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Schema for initializing payment
const InitializePaymentInputSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  amountInKobo: z.coerce.number().int().positive({ message: 'Amount must be a positive integer in Kobo.' }),
  reference: z.string().min(1, { message: 'A unique payment reference is required.'}),
  callbackUrl: z.string().url().optional().describe('Optional: URL to redirect to after payment. Define in your .env or pass per transaction.'),
  metadata: z.record(z.any()).optional().describe('Optional: Any additional data to pass to Paystack.'),
});
export type InitializePaymentInput = z.infer<typeof InitializePaymentInputSchema>;

export interface InitializePaymentResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResponse> {
  const validation = InitializePaymentInputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }

  const { email, amountInKobo, reference, callbackUrl, metadata } = validation.data;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('Paystack secret key is not configured.');
    return { success: false, message: 'Payment service is not configured on the server.' };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo, // Paystack expects amount in Kobo
        reference,
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
        metadata,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Paystack initialization error:', responseData);
      return { success: false, message: responseData.message || 'Failed to initialize payment with Paystack.' };
    }

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error: any) {
    console.error('Error initializing Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}


// Schema for verifying payment
const VerifyPaymentInputSchema = z.object({
  reference: z.string().min(1, { message: 'Payment reference is required to verify.' }),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInputSchema>;

// You might want to expand this interface based on what data you need from Paystack's verification response
export interface PaystackVerifiedPaymentData {
  status: string; // e.g., "success", "failed", "abandoned"
  reference: string;
  amount: number; // Amount in Kobo
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string | null;
  metadata: any;
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    risk_action: string;
  };
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
    bank: string;
    country_code: string;
    brand: string;
    reusable: boolean;
    signature: string | null;
    account_name: string | null;
  };
  // Add other fields as needed
}


export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: PaystackVerifiedPaymentData; // The data from Paystack's verification
  paymentSuccessful?: boolean; // Convenience flag
}


export async function verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResponse> {
  const validation = VerifyPaymentInputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }
  
  const { reference } = validation.data;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('Paystack secret key is not configured.');
    return { success: false, message: 'Payment service is not configured on the server.' };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('Paystack verification error:', responseData);
      return { success: false, message: responseData.message || 'Failed to verify payment with Paystack.' };
    }
    
    const isSuccessful = responseData.data.status === 'success';

    // Here, you would typically update your database based on the payment status.
    // For example, if isSuccessful and it's for a property promotion:
    // 1. Find the property by an ID stored in responseData.data.metadata
    // 2. Update its promotion status and expiry date in your 'properties' table.
    // 3. Record the transaction in a 'transactions' table.

    return {
      success: true,
      message: responseData.message,
      data: responseData.data as PaystackVerifiedPaymentData,
      paymentSuccessful: isSuccessful,
    };
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}
