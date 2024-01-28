import { Router } from 'express';
import { PostsSchema } from '../validations/posts'
import validate from '../middlewares/validate';
import { database } from '../base/prisma';
import auth from '../middlewares/auth';
import { randomUUID } from 'crypto';
import fileUpload from 'express-fileupload';
import { bucket } from '../base/aws';
import pagination from '../utils/pagination';
import { posthog } from '../base/posthog';
export const PostsRouter = Router();

PostsRouter.get("/", auth, async (req, res) => {
    const userPosts = await database.post.findMany({
        where: { userId: res.locals.session.userId },
        ...(pagination(req.query.page as string, req.query.limit as string)),
        include: {
            commnets: {
                include: {
                    user: {
                        select: { name: true, id: true, avatar: true }
                    }
                }
            }
        }
    });
    const data = [];
    for (const post of userPosts) {
        data.push({
            ...post,
            image: `https://cdn.fnrdev.tech/authy/${post.id}`
        })
    }

    return res.json(data)
})

PostsRouter.get("/:id/likes", auth, async (req, res) => {
    const postLikes = await database.postLikes.findMany({
        where: { postId: req.params.id },
        ...(pagination(req.query.page as string, req.query.limit as string)),
        include: {
            user: {
                select: { id: true, name: true, avatar: true }
            }
        }
    });
    const users = postLikes.map(c => c.user);

    return res.json(users);
})

PostsRouter.put("/:id/likes", auth, async (req, res) => {
    const post = await database.post.findUnique({
        where: { id: req.params.id },
        include: { likes: true }
    });
    if (!post) {
        return res.sendStatus(404);
    }

    // user already liked the post
    if (post.likes.some(likes => likes.userId === res.locals.session.userId)) {
        return res.status(401).json({ error: true, message: "You already liked the post" });
    }

    const updated = await database.post.update({
        where: { id: req.params.id },
        data: {
            likes: {
                create: {
                    userId: res.locals.session.userId
                }
            }
        }
    });

    return res.json(updated);
})

PostsRouter.delete("/:id/likes/:likeId", auth, async (req, res) => {
    const post = await database.post.findUnique({
        where: { id: req.params.id },
        include: { likes: true }
    });
    if (!post) {
        return res.sendStatus(404);
    }

    // user didn't like the post, so we can't remove something that don't exist
    if (!post.likes.some(like => like.userId === res.locals.session.userId)) {
        return res.status(401).json({ error: true, message: "You didn't like this post" });
    }

    const updated = await database.post.update({
        where: { id: req.params.id },
        data: {
            likes: {
                delete: {
                    id: req.params.likeId
                }
            }
        },
        include: { likes: true }
    });

    return res.json(updated);
})

PostsRouter.post("/", auth, validate({ body: PostsSchema }), async (req, res) => {
    // validations to check if file in body
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ error: true, message: "no file provided" });
    }
    const file = req.files.file as fileUpload.UploadedFile;
    if ("mimetype" in file && !file.mimetype.includes("image")) {
        return res.status(400).json({ error: true, message: "file type not supported" });
    }

    const { description } = req.body;
    const objectId = randomUUID();

    const [_, __, createdPost] = await Promise.all([
        bucket.putObject({
            Bucket: "authy",
            Key: objectId,
            Body: file.data,
            ContentType: file.mimetype,
            Metadata: { userId: res.locals.session.userId }
        }).promise(),
        database.media.create({
            data: {
                id: objectId,
                userId: res.locals.session.userId,
            }
        }),
        database.post.create({
            data: {
                id: objectId,
                description,
                userId: res.locals.session.userId
            }
        })
    ]);

    posthog.capture({
        distinctId: res.locals.session.userId,
        event: "post created",
        properties: {
            postId: createdPost.id
        }
    })

    return res.json(createdPost);
});

PostsRouter.delete("/:id", auth, async (req, res) => {
    const post = await database.post.findUnique({
        where: { id: req.params.id }
    });
    if (!post) {
        return res.sendStatus(404);
    }

    if (post.userId !== res.locals.session.userId) {
        return res.status(403).json({ error: true, message: "forbidden" });
    }

    await Promise.all([
        database.post.delete({
            where: { id: req.params.id }
        }),
        database.media.delete({
            where: { id: post.id }
        }),
        bucket.deleteObject({ Bucket: "authy", Key: post.id }).promise()
    ]);

    return res.sendStatus(200);
})