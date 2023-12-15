import { Router } from 'express';
import { randomBytes } from 'node:crypto'
import validate from '../middlewares/validate';
import { LoginSchema } from '../validations/login';
import { database } from '../base/prisma';
import auth from '../middlewares/auth';

export const LoginRouter = Router();

LoginRouter.post("/", auth, validate({ body: LoginSchema }), async (req, res) => {
    // create a session token
    const token = randomBytes(32).toString("hex");

    // register the session for the user
    await database.session.create({
        data: {
            id: token,
            userId: res.locals.session.userId
        }
    })

    // return the token to frontend, to store it in local storage
    return res.json({ token });
})