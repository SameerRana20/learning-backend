import dotenv from "dotenv"
dotenv.config()

import {app} from "./app.js"
import connectDB from "./db/db.js"

 
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server Running at port ${process.env.PORT || 8000}`)
    } )
})
.catch((error)=> {
    console.log(`ERROR GENERATED IN INDEX.JS : ${error} `)
})  