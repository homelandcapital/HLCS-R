
'use server';

import { createClient } from '@supabase/supabase-js';
import type { Database, TablesUpdate } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';
import type { UpdateUserFormValues } from '@/lib/schemas';


export async function updateUserByAdmin(userId: string, data: UpdateUserFormValues) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Admin user update failed: Supabase URL or Service Role Key is not configured.');
        return { success: false, message: 'Server is not configured for admin actions.' };
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
    
    const updateData: TablesUpdate<'users'> = {
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        agency: data.agency || null,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user by admin:', error);
        return { success: false, message: `Failed to update user: ${error.message}` };
    }

    revalidatePath('/admin/dashboard/user-management');
    return { success: true, message: 'User updated successfully!' };
}
