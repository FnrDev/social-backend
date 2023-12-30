import { z } from 'zod';

export const UserSchema = z.object({
    name: z.string().max(25).optional(),
    email: z.string().email().optional(),
    phone_number: z.string()
}).strict();