import { Router } from 'express';
import auth from '../middlewares/auth';
import { User } from '@prisma/client';
export const UserRouter = Router();

UserRouter.get("/@me", auth, async (req, res) => {
    // @ts-ignore
    const user: User = res.locals;
    return res.json({
        email: user.email,
        createdAt: user.createdAt,
        id: user.id
    })
})