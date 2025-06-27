'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import type { CommunityProjectInterestStatus, DevelopmentProjectInterestStatus, AuthenticatedUser, PlatformAdmin } from '@/lib/types';


// Helper to get the admin client
function getSupabaseAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Server is not configured for admin actions. Supabase URL or Service Role Key is missing.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// --- Community Project Interest Actions ---

export async function getCommunityInterestConversation(interestId: string) {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
        .from('community_project_interest_messages')
        .select('*')
        .eq('interest_id', interestId)
        .order('timestamp', { ascending: true });

    if (error) {
        console.error(`Admin action error fetching community conversation for ${interestId}:`, error);
        return { success: false, data: null, message: error.message };
    }
    return { success: true, data, message: 'Conversation fetched.' };
}

export async function replyToCommunityInterest(interestId: string, content: string, currentStatus: CommunityProjectInterestStatus, adminUser: PlatformAdmin) {
    const supabaseAdmin = getSupabaseAdminClient();
    
    const newMessageData: TablesInsert<'community_project_interest_messages'> = {
      interest_id: interestId,
      sender_id: adminUser.id,
      sender_role: 'platform_admin',
      sender_name: adminUser.name,
      content,
    };

    const { data: savedMessage, error: messageError } = await supabaseAdmin
      .from('community_project_interest_messages')
      .insert(newMessageData)
      .select()
      .single();

    if (messageError) {
        return { success: false, message: `Failed to send reply: ${messageError.message}` };
    }

    if (currentStatus === 'new') {
        const { error: statusError } = await supabaseAdmin
            .from('community_project_interests')
            .update({ status: 'contacted', updated_at: new Date().toISOString() })
            .eq('id', interestId);
        if (statusError) {
             return { success: false, message: `Reply sent, but failed to update status: ${statusError.message}` };
        }
    }
    
    revalidatePath('/admin/dashboard/project-interests');
    return { success: true, message: 'Reply sent successfully.', data: savedMessage };
}


// --- Development Project Interest Actions ---

export async function getDevelopmentInterestConversation(interestId: string) {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data, error } = await supabaseAdmin
        .from('development_project_interest_messages')
        .select('*')
        .eq('interest_id', interestId)
        .order('timestamp', { ascending: true });

    if (error) {
        console.error(`Admin action error fetching development conversation for ${interestId}:`, error);
        return { success: false, data: null, message: error.message };
    }
    return { success: true, data, message: 'Conversation fetched.' };
}


export async function replyToDevelopmentInterest(interestId: string, content: string, currentStatus: DevelopmentProjectInterestStatus, adminUser: PlatformAdmin) {
    const supabaseAdmin = getSupabaseAdminClient();
    
    const newMessageData: TablesInsert<'development_project_interest_messages'> = {
      interest_id: interestId,
      sender_id: adminUser.id,
      sender_role: 'platform_admin',
      sender_name: adminUser.name,
      content,
    };

    const { data: savedMessage, error: messageError } = await supabaseAdmin
      .from('development_project_interest_messages')
      .insert(newMessageData)
      .select()
      .single();

    if (messageError) {
        return { success: false, message: `Failed to send reply: ${messageError.message}` };
    }

    if (currentStatus === 'new') {
        const { error: statusError } = await supabaseAdmin
            .from('development_project_interests')
            .update({ status: 'contacted', updated_at: new Date().toISOString() })
            .eq('id', interestId);
        if (statusError) {
             return { success: false, message: `Reply sent, but failed to update status: ${statusError.message}` };
        }
    }
    
    revalidatePath('/admin/dashboard/development-project-interests');
    return { success: true, message: 'Reply sent successfully.', data: savedMessage };
}