import { Router } from 'express';
import { createHash, randomBytes } from 'node:crypto'
import validate from '../middlewares/validate';
import { LoginSchema } from '../validations/login';
import { database } from '../base/prisma';

export const LoginRouter = Router();

type AuthBody = {
    email: string;
    password: string;
    name: string;
}

LoginRouter.post("/", validate({ body: LoginSchema }), async (req, res) => {
    // get the email, password from request body
    const { email, password, name }: AuthBody = req.body;

    // hash the password to store it latter in database
    const hasedPassword = createHash("sha256").update(password).digest("hex");

    // create a session token
    const token = randomBytes(32).toString("hex");

    try {
        // create a user
        const user = await database.user.create({
            data: {
                password: hasedPassword,
                email,
                name
            }
        });

        // register the session for the user
        await database.session.create({
            data: {
                id: token,
                userId: user.id
            }
        })
    } catch (err: any) {
        // user already exisit, see https://www.prisma.io/docs/orm/reference/error-reference#p2002
        if (err.code === "P2002") {
            return res.status(400).json({ error: true, message: "user already exisit" })
        }
    }

    // return the token to frontend, to store it in local storage
    return res.json({ token });
})