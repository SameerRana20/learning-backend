import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

//import router
import router from "./routes/user.routes.js"

app.use("/api/v1/user", router) // https://localhost:8000/api/v1/user/registerUser


export { app }