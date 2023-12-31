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
    try {
        const updated = await database.user.update({
            where: { id: res.locals.session.userId },
            data: { ...req.body }
        });
    
        return res.json(updated);
    } catch (err: any) {
        console.error(err);
        // deplicted values in unique field
        if (err.code === "P2002") {
            return res.status(400).json({ error: true, message: "User with phone number or email already exists" });
        }
    }
})