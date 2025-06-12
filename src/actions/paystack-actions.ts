
'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient'; 
import { addDays } from 'date-fns';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const CustomFieldSchema = z.object({
  display_name: z.string(),
  variable_name: z.string(),
  value: z.any(), 
});

const MetadataSchema = z.object({
  custom_fields: z.array(CustomFieldSchema).min(1, "custom_fields array cannot be empty"),
}).passthrough(); // .passthrough() allows other top-level keys if needed for display

const InitializePaymentInputSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  amountInKobo: z.coerce.number().int().positive({ message: 'Amount must be a positive integer in Kobo.' }),
  reference: z.string().min(1, { message: 'A unique payment reference is required.'}),
  callbackUrl: z.string().url().optional().describe('Optional: URL to redirect to after payment for server-to-server. Not primary for inline.'),
  metadata: MetadataSchema, // Expects metadata to be { custom_fields: [...] }
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
  
  console.log(`[PaystackActions] Initializing payment for reference: ${reference} with metadata:`, JSON.stringify(metadata, null, 2));

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
        callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL, // For server-to-server if inline fails or for Paystack's records
        metadata: metadata, // Pass the already structured metadata directly
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
    custom_fields?: Array<{ display_name: string; variable_name: string; value: any }>;
    // Allow other direct properties for flexibility, though custom_fields is preferred
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
    let purposeFromMeta: string | undefined;
    const customFields = paymentData.metadata?.custom_fields;

    if (customFields && Array.isArray(customFields)) {
        console.log('[PaystackActions] verifyPayment: custom_fields is an array:', JSON.stringify(customFields));
        purposeFromMeta = customFields.find(f => f.variable_name === 'purpose')?.value;
    } else if (paymentData.metadata?.purpose) { 
        console.log('[PaystackActions] verifyPayment: custom_fields NOT an array or missing. Falling back to paymentData.metadata.purpose.');
        purposeFromMeta = paymentData.metadata.purpose;
    } else {
        console.log('[PaystackActions] verifyPayment: Could not find purpose in metadata or custom_fields.');
    }
    
    console.log('[PaystackActions] verifyPayment: isSuccessful:', isSuccessful, 'Purpose from metadata:', purposeFromMeta);

    if (isSuccessful && purposeFromMeta === 'property_promotion') {
      console.log('[PaystackActions] verifyPayment: Condition for property promotion met. Metadata:', JSON.stringify(paymentData.metadata, null, 2));
      
      let property_id: string | undefined;
      let tier_id: string | undefined;
      let tier_name: string | undefined;
      let tier_duration_from_meta: any; 

      if (customFields && Array.isArray(customFields)) {
        console.log('[PaystackActions] verifyPayment: Attempting to extract from custom_fields array.');
        property_id = customFields.find(f => f.variable_name === 'property_id')?.value;
        tier_id = customFields.find(f => f.variable_name === 'tier_id')?.value;
        tier_name = customFields.find(f => f.variable_name === 'tier_name')?.value;
        tier_duration_from_meta = customFields.find(f => f.variable_name === 'tier_duration')?.value;
      } else {
        console.warn('[PaystackActions] verifyPayment: custom_fields array not found or not an array in metadata. This might cause issues if data is only in custom_fields.');
        // Fallback to direct metadata properties (less reliable for custom data from Paystack)
        property_id = paymentData.metadata.property_id; // This might be undefined if data is only in custom_fields
        tier_id = paymentData.metadata.tier_id;
        tier_name = paymentData.metadata.tier_name;
        tier_duration_from_meta = paymentData.metadata.tier_duration;
      }
      
      console.log(`[PaystackActions] verifyPayment: Extracted metadata values - property_id: ${property_id}, tier_id: ${tier_id}, tier_name: ${tier_name}, tier_duration_from_meta: ${tier_duration_from_meta} (type: ${typeof tier_duration_from_meta})`);

      const tier_duration = tier_duration_from_meta !== undefined && tier_duration_from_meta !== null && !isNaN(Number(tier_duration_from_meta))
        ? Number(tier_duration_from_meta)
        : null;
      console.log(`[PaystackActions] verifyPayment: Converted tier_duration: ${tier_duration}`);
      
      if (property_id && tier_id && tier_name && tier_duration && tier_duration > 0) {
        const promotedAtDate = new Date();
        const expiresAtDate = addDays(promotedAtDate, tier_duration);

        console.log(`[PaystackActions] verifyPayment: Preparing to update Supabase for property ${property_id}. Promoted At: ${promotedAtDate.toISOString()}, Expires At: ${expiresAtDate.toISOString()}`);

        const updatePayload = {
            is_promoted: true,
            promotion_tier_id: tier_id,
            promotion_tier_name: tier_name,
            promoted_at: promotedAtDate.toISOString(),
            promotion_expires_at: expiresAtDate.toISOString(),
            updated_at: new Date().toISOString()
        };
        console.log('[PaystackActions] verifyPayment: Supabase update payload:', JSON.stringify(updatePayload, null, 2));
        
        const { error: updateError } = await supabase
          .from('properties')
          .update(updatePayload)
          .eq('id', property_id);

        if (updateError) {
          console.error('[PaystackActions] verifyPayment: Error updating property promotion status in Supabase:', JSON.stringify(updateError, null, 2));
          return {
            success: true, 
            message: `Payment verified successfully, but failed to update property promotion status in our database: ${updateError.message}. Please contact support with reference: ${reference}.`,
            data: paymentData,
            paymentSuccessful: true, 
          };
        }
        console.log(`[PaystackActions] verifyPayment: Property ${property_id} successfully promoted in Supabase with tier ${tier_name}.`);
        return {
            success: true,
            message: `Payment verified and property ${property_id} successfully promoted.`,
            data: paymentData,
            paymentSuccessful: true,
        };

      } else {
        console.warn('[PaystackActions] verifyPayment: Successful property promotion payment verified, but missing necessary metadata to update property or tier_duration is invalid.', { property_id, tier_id, tier_name, tier_duration_from_meta, tier_duration });
        return {
          success: true, 
          message: `Payment verified, but essential details (property ID, tier ID/Name, or valid duration) were missing/invalid in Paystack's metadata. DB not updated. Ref: ${reference}. Details: P_ID=${property_id}, T_ID=${tier_id}, T_Name=${tier_name}, T_Dur=${tier_duration}`,
          data: paymentData,
          paymentSuccessful: true,
        };
      }
    } else {
        let detailedMessage = responseData.message;
        if (isSuccessful && purposeFromMeta !== 'property_promotion') {
            detailedMessage = `Payment successful via Paystack, but the transaction purpose was '${purposeFromMeta || "not set"}', not 'property_promotion'. Property promotion status in DB not updated. Ref: ${reference}.`;
            console.log('[PaystackActions] verifyPayment:', detailedMessage);
        } else if (!isSuccessful) {
            detailedMessage = `Payment was not successful according to Paystack. Status: ${paymentData.status}. DB not updated. Ref: ${reference}.`;
            console.log('[PaystackActions] verifyPayment:', detailedMessage);
        } else {
            console.log('[PaystackActions] verifyPayment: Condition for property promotion NOT met or payment not successful (unknown reason if purpose was correct).', { isSuccessful, metadataPurpose: purposeFromMeta });
        }
        return {
          success: true, 
          message: detailedMessage, 
          data: paymentData,
          paymentSuccessful: isSuccessful,
        };
    }

  } catch (error: any) {
    console.error('[PaystackActions] Error verifying Paystack payment:', error);
    return { success: false, message: `An unexpected error occurred during verification: ${error.message}` };
  }
}
