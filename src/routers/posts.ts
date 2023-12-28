import { Router } from 'express';
import { PostsSchema } from '../validations/posts'
import validate from '../middlewares/validate';
import { database } from '../base/prisma';
import auth from '../middlewares/auth';
export const PostsRouter = Router();

PostsRouter.post("/:id", auth, validate({ body: PostsSchema }), async (req, res) => {
    const { description, file } = req.body;

    // TODO: upload image to aws S3, and get the id of uploaded file
    const aws = { id: "237-fdklsjgld-23987", file }

    const [_, createdPost] = await Promise.all([
        database.media.create({
            data: {
                id: aws.id,
                userId: res.locals.session.userId,
                postId: req.params.id
            }
        }),
        database.post.create({
            data: {
                id: aws.id,
                description,
                userId: res.locals.session.userId
            }
        })
    ]);

    return res.json(createdPost);
});

PostsRouter.delete("/:id", auth, async (req, res) => {
    const userPosts = await database.post.findFirst({
        where: { id: req.params.id }
    });
    if (!userPosts) {
        return res.status(401).json({ error: true, message: "forbidden" });
    }

    await Promise.all([
        database.post.delete({
            where: { id: req.params.id }
        }),
        database.media.delete({
            where: { id: userPosts.id }
        })
    ]);

    return res.sendStatus(200);
})