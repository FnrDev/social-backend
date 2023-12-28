import express from 'express';
import 'dotenv/config';
import { LoginRouter } from './routers/login';
import cors from 'cors';
import { LogoutRouter } from './routers/logout';
import { SignUpRouter } from './routers/signup';
import { PostsRouter } from './routers/posts';

const app = express();

// required middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("hello"))

app.use("/login", LoginRouter);
app.use("/signup", SignUpRouter);
app.use("/logout", LogoutRouter);
app.use("/posts", PostsRouter);

app.listen(process.env.PORT, () => console.log(`Backend is ready at port ${process.env.PORT}`));