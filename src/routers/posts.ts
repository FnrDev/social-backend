import { Router } from 'express';
import { PostsSchema } from '../validations/posts'
import validate from '../middlewares/validate';
import { database } from '../base/prisma';
import auth from '../middlewares/auth';
import S3 from 'aws-sdk/clients/s3';
import { randomUUID } from 'crypto';
import fileUpload from 'express-fileupload';
export const PostsRouter = Router();

const bucket = new S3({
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: "auto"
})

PostsRouter.post("/:id", auth, validate({ body: PostsSchema }), async (req, res) => {
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
            ContentType: file.mimetype
        }).promise(),
        database.media.create({
            data: {
                id: objectId,
                userId: res.locals.session.userId,
                postId: req.params.id
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

    return res.json(createdPost);
});

PostsRouter.delete("/:id", auth, async (req, res) => {
    const userPosts = await database.post.findUnique({
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