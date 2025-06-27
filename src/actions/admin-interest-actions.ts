// src/actions/admin-interest-actions.ts
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database, TablesInsert } from '@/lib/database.types';
import type { AuthenticatedUser, CommunityProjectInterest, DevelopmentProjectInterest, CommunityProjectInterestMessage, DevelopmentProjectInterestMessage } from '@/lib/types';

type ProjectType = 'community' | 'development';

async function getAdminSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Server is not configured for admin actions. Supabase URL or Service Role Key is missing.');
    }
    return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function fetchInterestWithConversation(
    interestId: string,
    projectType: ProjectType
): Promise<(CommunityProjectInterest | DevelopmentProjectInterest) & { conversation: any[] }> {
    const supabaseAdmin = await getAdminSupabaseClient();
    const interestTable = projectType === 'community' ? 'community_project_interests' : 'development_project_interests';
    const messageTable = projectType === 'community' ? 'community_project_interest_messages' : 'development_project_interest_messages';

    // Fetch the main interest object
    const { data: interestData, error: interestError } = await supabaseAdmin
        .from(interestTable)
        .select('*')
        .eq('id', interestId)
        .single();

    if (interestError) {
        console.error(`Error fetching ${projectType} interest:`, interestError);
        throw new Error(`Failed to fetch interest: ${interestError.message}`);
    }

    // Fetch the conversation for that interest
    const { data: messages, error: messagesError } = await supabaseAdmin
        .from(messageTable)
        .select('*')
        .eq('interest_id', interestId)
        .order('timestamp', { ascending: true });

    if (messagesError) {
        console.error(`Error fetching messages for ${projectType} interest ${interestId}:`, messagesError);
        // We can still return the interest data even if messages fail
        return { ...interestData, conversation: [] };
    }

    return { ...interestData, conversation: messages || [] };
}


export async function addAdminReplyToInterest(
  interestId: string,
  projectType: ProjectType,
  adminUser: AuthenticatedUser,
  replyMessage: string
): Promise<{ success: boolean; message: string; newMessage?: any }> {
  const supabaseAdmin = await getAdminSupabaseClient();
  const messageTable = projectType === 'community' ? 'community_project_interest_messages' : 'development_project_interest_messages';
  const interestTable = projectType === 'community' ? 'community_project_interests' : 'development_project_interests';
  
  const newMessageData = {
    interest_id: interestId,
    sender_id: adminUser.id,
    sender_role: 'platform_admin' as const,
    sender_name: adminUser.name,
    content: replyMessage,
  };

  const { data: savedMessage, error: messageError } = await supabaseAdmin
    .from(messageTable)
    .insert(newMessageData as any) // Using 'as any' because TS can't reconcile the union type here easily
    .select()
    .single();

  if (messageError) {
    console.error(`Error sending reply for ${projectType}:`, messageError);
    return { success: false, message: `Failed to send reply: ${messageError.message}` };
  }
  
  // Also update the interest status to 'contacted'
  await supabaseAdmin
    .from(interestTable)
    .update({ status: 'contacted', updated_at: new Date().toISOString() })
    .eq('id', interestId);

  return { success: true, message: 'Reply sent successfully.', newMessage: savedMessage };
}
