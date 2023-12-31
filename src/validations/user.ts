import { z } from 'zod';

export const UserSchema = z.object({
    name: z.string().max(25).optional(),
    email: z.string().email().optional(),
    avatar: z.string().regex(/^https:\/\/cdn\.fnrdev\.tech\/.*/).optional(),
    phone_number: z.string().optional(),
}).strict();