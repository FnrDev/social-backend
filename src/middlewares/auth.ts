import { Request, Response, NextFunction } from 'express';
import { database } from '../base/prisma';
import { redis } from '../base/redis';

export default async function auth(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization) return res.status(401).json({ error: true, message: "require authorization" });

    // get the session from redis cache first
    const cachedSession: string | null = await redis.get(`session_${req.headers.authorization}`);

    // session was not found in redis cache, find it in database
    if (!cachedSession) {
        const session = await database.session.findUnique({
            where: { id: req.headers.authorization },
            include: {
                user: true
            }
        });

        // session not found in database also
        if (!session) return res.status(401).json({ error: true, message: "Wrong authorization" });
        
        // store the session in redis cache also
        await redis.set(`session_${req.headers.authorization}`, JSON.stringify(session), { ex: 3600 });
        // store session in express locals
        res.locals.session = session;
        return next();
    } else {
        // session found in redis
        res.locals.session = JSON.parse(cachedSession);
        next();
    }
}