import { Router } from 'express';
import auth from '../middlewares/auth';
import { User } from '@prisma/client';
import validate from '../middlewares/validate';
import { UserSchema } from '../validations/user';
import { database } from '../base/prisma';
export const UserRouter = Router();

UserRouter.get("/@me", auth, async (req, res) => {
    const user: User = res.locals.session;
    return res.json(user);
})

UserRouter.put("/@me", auth, validate({ body: UserSchema }), async (req, res) => {
    const updated = await database.user.update({
        where: { id: res.locals.session.userId },
        data: { ...req.body }
    });

    return res.json(updated);
})