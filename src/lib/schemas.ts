
import { z } from 'zod';

// This schema defines what an admin can update for a user.
export const updateUserFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.enum(['user', 'agent', 'platform_admin']),
  phone: z.string().optional(),
  agency: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
