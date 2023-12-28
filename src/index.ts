import express from 'express';
import 'dotenv/config';
import { LoginRouter } from './routers/login';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { LogoutRouter } from './routers/logout';
import { PostsRouter } from './routers/posts';
import { CommentsRouter } from './routers/comments';

const app = express();

// required middlewares
app.use(express.json());
app.use(cors());
app.use(fileUpload({
    limits: { fileSize: 6 * 1024 * 1024 }
}));

app.get("/", (req, res) => res.send("hello"))

app.use("/login", LoginRouter);
app.use("/logout", LogoutRouter);
app.use("/posts", PostsRouter);
app.use("/comments", CommentsRouter);

app.listen(process.env.PORT, () => console.log(`Backend is ready at port ${process.env.PORT}`));