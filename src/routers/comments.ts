import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { CommentsSchema } from '../validations/comments';
import { database } from '../base/prisma';
export const CommentsRouter = Router();

CommentsRouter.get("/:id", async (req, res) => {
    const comments = await database.comments.findMany({
        where: { postId: req.params.id },
        // for now only return 25 comments
        // TODO: use pagantion
        take: 25,
        include: {
            user: {
                select: { name: true, id: true }
            }
        }
    });

    return res.json(comments);
})

CommentsRouter.post("/:id", auth, validate({ body: CommentsSchema }), async (req, res) => {
    const { content } = req.body;

    const comment = await database.comments.create({
        data: {
            postId: req.params.id,
            userId: res.locals.session.userId,
            content
        }
    });

    return res.json(comment);
});

CommentsRouter.post("/:id/:commentId/likes", auth, async (req, res) => {
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId }
    });
    if (!comment) {
        return res.sendStatus(404);
    }

    if (comment.userId === res.locals.session.userId) {
        return res.status(403).json({ error: true, message: "You can't like your own comment" });
    }

    const updated = await database.comments.update({
        where: { id: req.params.commentId },
        data: {
            likes: { increment: 1 }
        }
    });

    return res.json(updated);
});

CommentsRouter.delete("/:id/:commentId/likes", auth, async (req, res) => {
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId }
    });
    if (!comment) {
        return res.sendStatus(404);
    }

    if (comment.userId === res.locals.session.userId) {
        return res.status(403).json({ error: true, message: "You didn't liked this comment" });
    }

    const updated = await database.comments.update({
        where: { id: req.params.commentId },
        data: {
            likes: { decrement: 1 }
        }
    });

    return res.json(updated);
});

CommentsRouter.patch("/:id/:commentId", auth, validate({ body: CommentsSchema }), async (req, res) => {
    const { content } = req.body;
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId }
    })
    if (!comment) {
        return res.sendStatus(404);
    }

    if (comment.userId !== res.locals.session.userId) {
        return res.status(403).json({ error: true, message: "forbidden" });
    }

    const updated = await database.comments.update({
        where: { id: req.params.commentId },
        data: {
            content
        }
    });

    return res.json(updated);
})

CommentsRouter.delete("/:id/:commentId", auth, async (req, res) => {
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId }
    });
    if (!comment) {
        return res.sendStatus(404);
    }

    if (comment.userId !== res.locals.session.userId) {
        return res.status(403).json({ error: true, message: "forbidden" });
    }

    await database.comments.delete({
        where: { id: req.params.commentId }
    });

    return res.sendStatus(200);
})