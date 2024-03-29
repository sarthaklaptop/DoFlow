import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

// cors
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

// configuration

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit:"16kb"}))

app.use(express.static("public"))

app.use(cookieParser())

import registerUser from "./routes/user.routes.js"

app.use("/api/v1/users", registerUser)

export {app}