import { apiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"

const verifyJWT= (req, res , next)=>{
    try {
        const token  = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token) {
           return next( new apiError(401, "Unauthorized request"))
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken) {
            return next( new apiError(401, "invalid access token"))
        }
    
        req.user = decodedToken
    
        next()
    } catch (error) {
      return next( new apiError(401, "invalid access token"))
    }
}

export { verifyJWT }