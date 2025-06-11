
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient'; // Ensure Supabase client is available
import { addDays } from 'date-fns';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Schema for initializing payment
const InitializePaymentInputSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  amountInKobo: z.coerce.number().int().positive({ message: 'Amount must be a positive integer in Kobo.' }),
  reference: z.string().min(1, { message: 'A unique payment reference is required.'}),
  callbackUrl: z.string().url().optional().describe('Optional: URL to redirect to after payment. Define in your .env or pass per transaction.'),
  metadata: z.object({
    propertyId: z.string().uuid({ message: "Valid Property ID is required in metadata."}),
    tierId: z.string({ message: "Tier ID is required in metadata."}),
    tierName: z.string({ message: "Tier Name is required in metadata."}),
    tierFee: z.number({ message: "Tier Fee is required in metadata."}), // Original fee in NGN
    tierDuration: z.number().int().positive({ message: "Tier Duration in days is required in metadata."}),
    agentId: z.string().uuid({ message: "Agent ID is required in metadata."}),
    purpose: z.literal('property_promotion', { message: "Purpose must be 'property_promotion'."}),
    custom_fields: z.array(z.object({ // Paystack's standard metadata structure
        display_name: z.string(),
        variable_name: z.string(),
        value: z.any(),
    })).optional()
  }).passthrough(), // Allow other fields in metadata if needed, though we focus on defined ones
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
    console.error("Paystack InitializePaymentInputSchema validation error:", validation.error.errors);
    return { success: false, message: `Invalid input: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
  }

  const { email, amountInKobo, reference, callbackUrl, metadata } = validation.data;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('Paystack secret key is not configured.');
    return { success: false, message: 'Payment service is not configured on the server.' };
  }
  
  // Reconstruct metadata to match Paystack's expected custom_fields structure
  // while also keeping our specific flat metadata for easier access later.
  const paystackMetadata = {
    property_id: metadata.propertyId,
    tier_id: metadata.tierId,
    tier_name: metadata.tierName,
    tier_fee: metadata.tierFee,
    tier_duration: metadata.tierDuration,
    agent_id: metadata.agentId,
    purpose: metadata.purpose,
    custom_fields: [
      { display_name: "Property ID", variable_name: "property_id", value: metadata.propertyId },
      { display_name: "Tier Name", variable_name: "tier_name", value: metadata.tierName },
      { display_name: "Agent ID", variable_name: "agent_id", value: metadata.agentId },
      { display_name: "Purpose", variable_name: "purpose", value: metadata.purpose },
    ],
  };

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
        metadata: paystackMetadata, // Send the structured metadata
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

export interface PaystackVerifiedPaymentData {
  status: string; 
  reference: string;
  amount: number; 
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string | null;
  metadata: { // Define expected structure for metadata coming back from Paystack
    property_id?: string;
    tier_id?: string;
    tier_name?: string;
    tier_fee?: number;
    tier_duration?: number;
    agent_id?: string;
    purpose?: string;
    custom_fields?: Array<{ display_name: string; variable_name: string; value: any }>;
    [key: string]: any; // Allow other passthrough keys if Paystack adds them
  };
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
}


export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: PaystackVerifiedPaymentData;
  paymentSuccessful?: boolean;
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
    const paymentData = responseData.data as PaystackVerifiedPaymentData;

    if (isSuccessful && paymentData.metadata?.purpose === 'property_promotion') {
      const { property_id, tier_id, tier_name, tier_duration } = paymentData.metadata;
      
      if (property_id && tier_id && tier_name && tier_duration) {
        const promotedAtDate = new Date();
        const expiresAtDate = addDays(promotedAtDate, Number(tier_duration));

        const { error: updateError } = await supabase
          .from('properties')
          .update({
            is_promoted: true,
            promotion_tier_id: tier_id,
            promotion_tier_name: tier_name,
            promoted_at: promotedAtDate.toISOString(),
            promotion_expires_at: expiresAtDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', property_id);

        if (updateError) {
          console.error('Error updating property promotion status:', updateError);
          // Payment was successful, but DB update failed. This needs careful handling/logging.
          // For now, return success for payment, but message indicates partial failure.
          return {
            success: true, // Paystack call was successful
            message: `Payment verified successfully, but failed to update property promotion status: ${updateError.message}`,
            data: paymentData,
            paymentSuccessful: true, // Payment itself was successful
          };
        }
        console.log(`Property ${property_id} successfully promoted with tier ${tier_name}.`);
      } else {
        console.warn('Successful property promotion payment verified, but missing necessary metadata to update property:', paymentData.metadata);
        return {
          success: true,
          message: 'Payment verified successfully, but property update failed due to missing metadata.',
          data: paymentData,
          paymentSuccessful: true,
        };
      }
    }

    return {
      success: true,
      message: responseData.message,
      data: paymentData,
      paymentSuccessful: isSuccessful,
    };
  } catch (error: any) {
    console.error('Error verifying Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}

    