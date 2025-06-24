
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabaseClient';
import { uploadAgentIdImage, uploadAvatarImage } from './upload-images';
import { revalidatePath } from 'next/cache';
import type { TablesUpdate } from '@/lib/database.types';

export async function updateAgentProfile(agentId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const agency = formData.get('agency') as string;
    const idFile = formData.get('government_id') as File | null;
    const avatarFile = formData.get('avatar') as File | null;

    let government_id_url: string | undefined = undefined;
    let avatar_url: string | undefined = undefined;

    if (idFile && idFile.size > 0) {
      const idImageData = new FormData();
      idImageData.append('files', idFile);
      const uploadResult = await uploadAgentIdImage(idImageData);

      if (uploadResult.error) {
        return { success: false, message: `ID image upload failed: ${uploadResult.error}` };
      }
      government_id_url = uploadResult.urls?.[0];
    }
    
    if (avatarFile && avatarFile.size > 0) {
      const avatarImageData = new FormData();
      avatarImageData.append('files', avatarFile);
      const uploadResult = await uploadAvatarImage(avatarImageData);
      if (uploadResult.error) {
        return { success: false, message: `Avatar image upload failed: ${uploadResult.error}` };
      }
      avatar_url = uploadResult.urls?.[0];
    }
    
    const updateData: TablesUpdate<'users'> = {
      name,
      phone,
      agency: agency || null,
      updated_at: new Date().toISOString(),
    };

    if (government_id_url) {
      updateData.government_id_url = government_id_url;
    }
    if (avatar_url) {
        updateData.avatar_url = avatar_url;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', agentId);
      
    if (error) {
      return { success: false, message: `Failed to update profile: ${error.message}` };
    }
    
    // If avatar was updated, also update it in the auth user metadata
    if (avatar_url) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.warn('Admin profile update part failed: Supabase URL or Service Role Key is not configured.');
            // This is not a fatal error, the public profile is updated. We can proceed.
        } else {
             const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
             const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
                agentId,
                { user_metadata: { avatar_url: avatar_url } }
             );
             if (authError) {
                 console.error('Error updating user auth metadata:', authError);
                 // Also not fatal, but worth noting.
             }
        }
    }


    revalidatePath('/agents/dashboard/profile');
    return { success: true, message: 'Profile updated successfully!' };

  } catch (error: any) {
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}
