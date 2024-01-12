import { Router } from 'express';
import { randomBytes } from 'node:crypto'
import validate from '../middlewares/validate';
import { LoginSchema } from '../validations/login';
import { database } from '../base/prisma';

export const LoginRouter = Router();

LoginRouter.post("/", validate({ body: LoginSchema }), async (req, res) => {
    // create a session token
    const token = randomBytes(32).toString("hex");

    // upsert the user
    const user = await database.user.upsert({
        where: { phone_number: req.body.phone_number },
        create: {
            username: req.body.username,
            phone_number: req.body.phone_number,
            email: req.body.email,
            name: req.body.name
        },
        update: {},
    });

    await database.session.create({
        data: { id: token, userId: user.id }
    });

    return res.json({ token });
})