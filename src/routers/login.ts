import { Router } from 'express';
import { randomBytes } from 'node:crypto'
import validate from '../middlewares/validate';
import { LoginSchema } from '../validations/login';
import { database } from '../base/prisma';
import { posthog } from '../base/posthog';

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

    posthog.capture({
        distinctId: user.id,
        event: "user logged in",
        properties: {
            phone: req.body.phone_number
        }
    });

    return res.json({ token });
})