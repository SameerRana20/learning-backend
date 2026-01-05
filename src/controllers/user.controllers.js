import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler((req, res)=>{
    res.status(200).json({
        msg : "hello world from sameer"
    })
})

export {registerUser}