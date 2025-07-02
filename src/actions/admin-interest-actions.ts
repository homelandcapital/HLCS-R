// src/actions/admin-interest-actions.ts
'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { AuthenticatedUser, CommunityProjectInterest, DevelopmentProjectInterest, MachineryRequest } from '@/lib/types';

type ProjectType = 'community' | 'development' | 'machinery_request';

// This function now returns an object with either the client or an error,
// allowing us to handle the missing configuration gracefully.
async function getAdminSupabaseClient(): Promise<{ client: SupabaseClient<Database> | null; error: string | null }> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseServiceKey.includes('YOUR_SUPABASE_KEY')) {
        const errorMessage = 'Server is not configured for admin actions. Supabase URL or Service Role Key is missing or using placeholder values in the production environment.';
        console.error(errorMessage);
        return { client: null, error: errorMessage };
    }
    return { client: createClient<Database>(supabaseUrl, supabaseServiceKey), error: null };
}

export async function fetchInterestWithConversation(
    interestId: string,
    projectType: ProjectType
): Promise<(CommunityProjectInterest | DevelopmentProjectInterest | MachineryRequest) & { conversation: any[] }> {
    const { client: supabaseAdmin, error: clientError } = await getAdminSupabaseClient();
    if (clientError || !supabaseAdmin) {
        // This specific error message will be shown to the user in production, guiding them to the fix.
        throw new Error('Server configuration error. Please ensure environment variables are set correctly for the production environment.');
    }

    let interestTable: string;
    let messageTable: string;
    let messageForeignKey: string;

    switch (projectType) {
        case 'community':
            interestTable = 'community_project_interests';
            messageTable = 'community_project_interest_messages';
            messageForeignKey = 'interest_id';
            break;
        case 'development':
            interestTable = 'development_project_interests';
            messageTable = 'development_project_interest_messages';
            messageForeignKey = 'interest_id';
            break;
        case 'machinery_request':
            interestTable = 'machinery_requests';
            messageTable = 'machinery_request_messages';
            messageForeignKey = 'request_id';
            break;
        default:
            throw new Error(`Invalid project type: ${projectType}`);
    }

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
        .eq(messageForeignKey, interestId)
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
  const { client: supabaseAdmin, error: clientError } = await getAdminSupabaseClient();
  if (clientError || !supabaseAdmin) {
    return { success: false, message: 'Cannot send reply: Server is not configured correctly. Please contact support.' };
  }

  let interestTable: string;
  let messageTable: string;
  let messageForeignKey: string;

  switch (projectType) {
      case 'community':
          interestTable = 'community_project_interests';
          messageTable = 'community_project_interest_messages';
          messageForeignKey = 'interest_id';
          break;
      case 'development':
          interestTable = 'development_project_interests';
          messageTable = 'development_project_interest_messages';
          messageForeignKey = 'interest_id';
          break;
      case 'machinery_request':
          interestTable = 'machinery_requests';
          messageTable = 'machinery_request_messages';
          messageForeignKey = 'request_id';
          break;
      default:
        return { success: false, message: `Invalid project type: ${projectType}` };
  }
  
  const newMessageData = {
    [messageForeignKey]: interestId,
    sender_id: adminUser.id,
    sender_role: 'platform_admin' as const,
    sender_name: adminUser.name,
    content: replyMessage,
  };

  const { data: savedMessage, error: messageError } = await supabaseAdmin
    .from(messageTable)
    .insert(newMessageData as any) 
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
