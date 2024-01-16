import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// Routes
import userRouter from './routes/user.routes.js';

// Route declaration
app.use("/api/v1/users", userRouter)

// To check above code is hitting or not
// app.use("/api/v1/users", (req, res, next) => {
//     console.log('Request to /api/v1/users route is being processed.');
//     userRouter(req, res, next);
// });

export { app }