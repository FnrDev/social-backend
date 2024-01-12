import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(1).max(15),
    email: z.string().email(),
    phone_number: z.string().min(1),
    name: z.string().min(1).max(30)
})