
'use server';

import { z } from 'zod';
import { addDays, formatISO } from 'date-fns';
import type { Database } from '@/lib/database.types'; // Your generated types
import { createClient } from '@supabase/supabase-js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// Default Supabase client (uses anon key, RLS will apply if not overridden)
import { supabase } from '@/lib/supabaseClient';


const CustomFieldSchema = z.object({
  display_name: z.string(),
  variable_name: z.string(),
  value: z.string(), 
});

const MetadataSchema = z.object({
  custom_fields: z.array(CustomFieldSchema),
  property_title_for_display: z.string().optional(), 
});

const InitializePaymentInputSchema = z.object({
  email: z.string().email(),
  amountInKobo: z.number().positive(),
  reference: z.string().min(1),
  metadata: MetadataSchema, 
  callbackUrl: z.string().url().optional(),
});
export type InitializePaymentInput = z.infer<typeof InitializePaymentInputSchema>;

interface InitializePaymentResponse {
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

  const { email, amountInKobo, reference, metadata, callbackUrl } = validation.data;

  if (!PAYSTACK_SECRET_KEY) {
    console.error('[PaystackActions] initializePayment: PAYSTACK_SECRET_KEY is not set.');
    return { success: false, message: 'Paystack secret key not configured on server.' };
  }
  if (!PAYSTACK_CALLBACK_URL && !callbackUrl) {
     console.error('[PaystackActions] initializePayment: PAYSTACK_CALLBACK_URL is not set and no specific callbackUrl provided.');
    return { success: false, message: 'Paystack callback URL not configured.' };
  }

  const payload = {
    email,
    amount: amountInKobo,
    reference,
    callback_url: callbackUrl || PAYSTACK_CALLBACK_URL,
    metadata: metadata, 
  };

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.status) {
      return { success: false, message: responseData.message || 'Failed to initialize Paystack transaction.' };
    }
    return { success: true, message: 'Authorization URL created', data: responseData.data };
  } catch (error: any) {
    console.error('[PaystackActions] initializePayment: Error initializing Paystack transaction:', error);
    return { success: false, message: `Error initializing Paystack transaction: ${error.message}` };
  }
}


interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: any; 
  paymentSuccessful?: boolean;
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('[PaystackActions] verifyPayment: PAYSTACK_SECRET_KEY is not set.');
    return { success: false, message: 'Paystack secret key not configured on server.' };
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });
    const paymentData = await response.json();

    if (!paymentData.status || paymentData.data.status !== 'success') {
      return { success: false, message: paymentData.data.gateway_response || 'Payment verification failed.', paymentSuccessful: false };
    }

    const metadata = paymentData.data.metadata;
    const customFields = metadata?.custom_fields || [];

    const getCustomFieldValue = (fieldName: string) => customFields.find((f: any) => f.variable_name === fieldName)?.value;

    const property_id = getCustomFieldValue('property_id');
    const tier_id = getCustomFieldValue('tier_id');
    const tier_name = getCustomFieldValue('tier_name');
    const tier_duration_from_meta = getCustomFieldValue('tier_duration'); 
    const purposeFromMeta = getCustomFieldValue('purpose');


    const isSuccessful = paymentData.data.status === 'success';

    if (isSuccessful && purposeFromMeta === 'property_promotion') {
      const tier_duration = Number(tier_duration_from_meta);

      if (property_id && tier_id && tier_name && tier_duration && tier_duration > 0) {
        const promotedAtDate = new Date();
        const expiresAtDate = addDays(promotedAtDate, tier_duration);

        const updatePayload: Partial<Database['public']['Tables']['properties']['Row']> = {
          is_promoted: true,
          promotion_tier_id: tier_id,
          promotion_tier_name: tier_name,
          promoted_at: formatISO(promotedAtDate),
          promotion_expires_at: formatISO(expiresAtDate),
          updated_at: formatISO(new Date()),
        };
        
        let dbClient = supabase; // Default to anon key client
        const supabaseServiceKey = SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = NEXT_PUBLIC_SUPABASE_URL;

        if (supabaseServiceKey && supabaseServiceKey.startsWith('ey') && supabaseUrl) {
          console.log('[PaystackActions] verifyPayment: Using admin client for DB updates.');
          dbClient = createClient<Database>(supabaseUrl, supabaseServiceKey);
        } else if (supabaseServiceKey && supabaseUrl) {
           console.warn('[PaystackActions] verifyPayment: SUPABASE_SERVICE_ROLE_KEY is present BUT DOES NOT LOOK VALID. Using default (anon) client. DB update might fail.');
        }
        else {
          console.warn('[PaystackActions] verifyPayment: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL is NOT SET for admin client. Using default (anon) client. DB update might fail due to RLS.');
        }
        
        const { error: updateError } = await dbClient
          .from('properties')
          .update(updatePayload)
          .eq('id', property_id);

        if (updateError) {
          console.error(`[PaystackActions] verifyPayment: Supabase update error for property ${property_id}:`, JSON.stringify(updateError, null, 2));
          return { success: true, message: `Payment verified, but DB update failed: ${updateError.message}`, data: paymentData.data, paymentSuccessful: true };
        }
        return { success: true, message: `Payment verified and property ${property_id} successfully promoted.`, data: paymentData.data, paymentSuccessful: true };
      } else {
        console.warn(`[PaystackActions] verifyPayment: Payment successful for promotion, but essential details (property_id, tier_id, tier_name, or tier_duration) were missing/invalid from metadata. Property ID: ${property_id}, Tier ID: ${tier_id}, Tier Name: ${tier_name}, Tier Duration: ${tier_duration}`);
        return { success: true, message: `Payment verified, but essential details (property_id: ${property_id}, tier_id: ${tier_id}, tier_name: ${tier_name}, tier_duration: ${tier_duration}) were missing/invalid. Promotion not applied.`, data: paymentData.data, paymentSuccessful: true };
      }
    } else if (isSuccessful) {
      return { success: true, message: `Payment verified, but purpose was '${purposeFromMeta}', not 'property_promotion'.`, data: paymentData.data, paymentSuccessful: true };
    } else {
      return { success: false, message: paymentData.data.gateway_response || 'Payment not successful.', data: paymentData.data, paymentSuccessful: false };
    }

  } catch (error: any) {
    console.error('[PaystackActions] verifyPayment: Error verifying Paystack transaction:', error);
    return { success: false, message: `Error verifying transaction: ${error.message}`, paymentSuccessful: false };
  }
}
