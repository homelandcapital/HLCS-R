'use server';

import { supabase } from '@/lib/supabaseClient';
import { uploadAgentIdImage } from './upload-images';
import { revalidatePath } from 'next/cache';
import type { TablesUpdate } from '@/lib/database.types';

export async function updateAgentProfile(agentId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const agency = formData.get('agency') as string;
    const idFile = formData.get('government_id') as File | null;

    let government_id_url: string | undefined = undefined;

    if (idFile && idFile.size > 0) {
      const idImageData = new FormData();
      idImageData.append('files', idFile);
      const uploadResult = await uploadAgentIdImage(idImageData);

      if (uploadResult.error) {
        return { success: false, message: `Image upload failed: ${uploadResult.error}` };
      }
      government_id_url = uploadResult.urls?.[0];
    }
    
    const updateData: TablesUpdate<'users'> = {
      name,
      phone,
      agency: agency || null, // Ensure null if empty
      updated_at: new Date().toISOString(),
    };

    if (government_id_url) {
      updateData.government_id_url = government_id_url;
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', agentId);
      
    if (error) {
      return { success: false, message: `Failed to update profile: ${error.message}` };
    }

    revalidatePath('/agents/dashboard/profile');
    return { success: true, message: 'Profile updated successfully!' };

  } catch (error: any) {
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}
