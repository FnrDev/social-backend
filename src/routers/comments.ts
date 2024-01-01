import { Router } from 'express';
import auth from '../middlewares/auth';
import validate from '../middlewares/validate';
import { CommentsSchema } from '../validations/comments';
import { database } from '../base/prisma';
export const CommentsRouter = Router();

CommentsRouter.post("/:id", auth, validate({ body: CommentsSchema }), async (req, res) => {
    const { content } = req.body;

    const comment = await database.comments.create({
        data: {
            postId: req.params.id,
            userId: res.locals.session.userId,
            content
        },
        include: { likes: true }
    });

    return res.json(comment);
});

CommentsRouter.post("/:id/:commentId/likes", auth, async (req, res) => {
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId },
        include: { likes: true }
    });
    if (!comment) {
        return res.sendStatus(404);
    }

    // user already like the comment
    if (comment.likes.some(like => like.userId === res.locals.session.userId)) {
        return res.status(400).json({ error: true, message: "You already liked this comment" });
    }

    const updated = await database.comments.update({
        where: { id: req.params.commentId },
        data: {
            likes: {
                create: {
                    userId: res.locals.session.userId
                }
            }
        },
        // TODO: move liked users into another route
        include: {
            likes: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            }
        }
    });

    return res.json(updated);
});

CommentsRouter.delete("/:id/:commentId/likes/:likeId", auth, async (req, res) => {
    const comment = await database.comments.findUnique({
        where: { id: req.params.commentId },
        include: { likes: true }
    });
    if (!comment) {
        return res.sendStatus(404);
    }

    if (!comment.likes.some(like => like.userId === res.locals.session.userId)) {
        return res.status(403).json({ error: true, message: "You didn't liked this comment" });
    }

    const updated = await database.comments.update({
        where: { id: req.params.commentId },
        data: {
            likes: {
                delete: {
                    id: req.params.likeId
                }
            }
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