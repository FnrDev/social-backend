import { z } from 'zod';

export const LoginSchema = z.object({
    email: z.string().email(),
    phone_number: z.string().min(1),
    name: z.string().min(1).max(30)
})