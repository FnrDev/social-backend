import { Router } from 'express';
import auth from '../middlewares/auth';
export const UserRouter = Router();

UserRouter.get("/@me", auth, async (req, res) => {
    return res.json(res.locals.session.user)
})