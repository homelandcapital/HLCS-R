
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
    console.error("[PaystackActions] InitializePaymentInputSchema validation error:", validation.error.errors);
    return { success: false, message: `Invalid input: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}` };
  }

  const { email, amountInKobo, reference, callbackUrl, metadata } = validation.data;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('[PaystackActions] Paystack secret key is not configured.');
    return { success: false, message: 'Payment service is not configured on the server.' };
  }
  
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

  console.log(`[PaystackActions] Initializing payment for reference: ${reference} with metadata:`, JSON.stringify(paystackMetadata, null, 2));

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInKobo,
        reference,
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
        metadata: paystackMetadata,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('[PaystackActions] Paystack initialization error:', responseData);
      return { success: false, message: responseData.message || 'Failed to initialize payment with Paystack.' };
    }

    return {
      success: true,
      message: responseData.message,
      data: responseData.data,
    };
  } catch (error: any) {
    console.error('[PaystackActions] Error initializing Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}


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
  metadata: {
    property_id?: string;
    tier_id?: string;
    tier_name?: string;
    tier_fee?: number;
    tier_duration?: any; // Can be string or number from Paystack
    agent_id?: string;
    purpose?: string;
    custom_fields?: Array<{ display_name: string; variable_name: string; value: any }>;
    [key: string]: any; 
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
    console.error("[PaystackActions] VerifyPaymentInputSchema validation error:", validation.error.errors);
    return { success: false, message: `Invalid input: ${validation.error.errors.map(e => e.message).join(', ')}` };
  }
  
  const { reference } = validation.data;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    console.error('[PaystackActions] Paystack secret key is not configured for verification.');
    return { success: false, message: 'Payment service is not configured on the server.' };
  }

  console.log(`[PaystackActions] Verifying payment for reference: ${reference}`);

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      console.error('[PaystackActions] Paystack verification error response:', responseData);
      return { success: false, message: responseData.message || 'Failed to verify payment with Paystack.' };
    }
    
    const paymentData = responseData.data as PaystackVerifiedPaymentData;
    console.log('[PaystackActions] verifyPayment: Full paymentData from Paystack:', JSON.stringify(paymentData, null, 2));
    const isSuccessful = paymentData.status === 'success';

    if (isSuccessful && paymentData.metadata?.purpose === 'property_promotion') {
      console.log('[PaystackActions] verifyPayment: Condition for property promotion met. Metadata:', JSON.stringify(paymentData.metadata, null, 2));
      
      const property_id = paymentData.metadata.property_id;
      const tier_id = paymentData.metadata.tier_id;
      const tier_name = paymentData.metadata.tier_name;
      const tier_duration_from_meta = paymentData.metadata.tier_duration;

      console.log(`[PaystackActions] verifyPayment: Extracted metadata - property_id: ${property_id}, tier_id: ${tier_id}, tier_name: ${tier_name}, tier_duration_from_meta: ${tier_duration_from_meta} (type: ${typeof tier_duration_from_meta})`);

      const tier_duration = tier_duration_from_meta ? Number(tier_duration_from_meta) : null;
      console.log(`[PaystackActions] verifyPayment: Converted tier_duration: ${tier_duration}`);
      
      if (property_id && tier_id && tier_name && tier_duration && tier_duration > 0) {
        const promotedAtDate = new Date();
        const expiresAtDate = addDays(promotedAtDate, tier_duration);

        console.log(`[PaystackActions] verifyPayment: Preparing to update Supabase for property ${property_id}. Promoted At: ${promotedAtDate.toISOString()}, Expires At: ${expiresAtDate.toISOString()}`);

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
          console.error('[PaystackActions] verifyPayment: Error updating property promotion status in Supabase:', JSON.stringify(updateError, null, 2));
          return {
            success: true, 
            message: `Payment verified successfully, but failed to update property promotion status: ${updateError.message}`,
            data: paymentData,
            paymentSuccessful: true,
          };
        }
        console.log(`[PaystackActions] verifyPayment: Property ${property_id} successfully promoted in Supabase with tier ${tier_name}.`);
      } else {
        console.warn('[PaystackActions] verifyPayment: Successful property promotion payment verified, but missing necessary metadata to update property or tier_duration is invalid.', { property_id, tier_id, tier_name, tier_duration_from_meta, tier_duration });
        return {
          success: true,
          message: 'Payment verified successfully, but property update failed due to missing or invalid metadata.',
          data: paymentData,
          paymentSuccessful: true,
        };
      }
    } else {
        console.log('[PaystackActions] verifyPayment: Condition for property promotion NOT met or payment not successful.', { isSuccessful, metadataPurpose: paymentData.metadata?.purpose });
    }

    return {
      success: true,
      message: responseData.message,
      data: paymentData,
      paymentSuccessful: isSuccessful,
    };
  } catch (error: any) {
    console.error('[PaystackActions] Error verifying Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}
