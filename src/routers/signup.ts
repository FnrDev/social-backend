import { createHash } from 'crypto';
import { Router } from 'express';
import { database } from '../base/prisma';
export const SignUpRouter = Router();

type AuthBody = {
    email: string;
    password: string;
    name: string;
}

SignUpRouter.post("/", async (req, res) => {
    // get the email, password from request body
    const { email, password, name }: AuthBody = req.body;

    // hash the password to store it latter in database
    const hasedPassword = createHash("sha256").update(password).digest("hex");

    try {
        // create a user
        const user = await database.user.create({
            data: {
                password: hasedPassword,
                email,
                name
            }
        });
    } catch (err: any) {
        // user already exisit, see https://www.prisma.io/docs/orm/reference/error-reference#p2002
        if (err.code === "P2002") {
            return res.status(400).json({ error: true, message: "user already exisit" })
        }
    }

    return res.sendStatus(200);
})