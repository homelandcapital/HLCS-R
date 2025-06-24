
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


export async function updateUserBanStatus(userId: string, shouldBeBanned: boolean) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return { success: false, message: 'Server is not configured for admin actions.' };
    }

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    const banDuration = shouldBeBanned ? 'none' : '0s'; // 'none' for indefinite, '0s' to unban
    const bannedUntilForDb = shouldBeBanned ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() : null; // Far-future date for 'indefinite' or null for active

    // First, update the auth user's status
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: banDuration,
    });

    if (authError) {
        console.error('Error updating user auth status:', authError);
        return { success: false, message: `Failed to update user auth status: ${authError.message}` };
    }

    // Then, update our public users table to reflect the change for easier querying
    const { error: profileError } = await supabaseAdmin
        .from('users')
        .update({ banned_until: bannedUntilForDb, updated_at: new Date().toISOString() })
        .eq('id', userId);

    if (profileError) {
        console.error('Error updating user profile ban status:', profileError);
        // This is a tricky state. Auth user is banned but our table is out of sync.
        // A more robust system might try to revert the auth change, but for now, we report the error.
        return { success: false, message: `Auth status updated, but failed to update profile: ${profileError.message}` };
    }

    revalidatePath('/admin/dashboard/user-management');
    const message = shouldBeBanned ? 'User has been suspended successfully.' : 'User has been reinstated successfully.';
    return { success: true, message };
}
