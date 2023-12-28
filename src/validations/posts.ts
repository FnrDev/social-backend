import { z } from 'zod';

export const PostsSchema = z.object({
    description: z.string().min(1).max(255)
})