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
    signatureVersion: "v4",
    secretAccessKey: process.env.AWS_S3_SECRET,
    accessKeyId: process.env.AWS_S3_ACCESS_KEY
})

PostsRouter.get("/", auth, async (req, res) => {
    const userPosts = await database.post.findMany({
        where: { userId: res.locals.session.userId },
    });
    const postsIds = userPosts.map(post => post.id);

    return res.json(postsIds.map(id => `https://fnrdev.tech/authy/${id}`));
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