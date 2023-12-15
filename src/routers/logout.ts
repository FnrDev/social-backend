import { Router } from 'express';
import auth from '../middlewares/auth';
import { database } from '../base/prisma';
import { redis } from '../base/redis';
export const LogoutRouter = Router();

LogoutRouter.post("/", auth, async (req, res) => {
    await database.session.delete({
        where: { id: req.headers.authorization }
    });
    await redis.del(`session_${req.headers.authorization}`);

    return res.sendStatus(204);
})