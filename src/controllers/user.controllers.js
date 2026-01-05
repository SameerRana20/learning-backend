import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res)=>{
     // get data from frontend | username , email, fullName , password ,  avatar, coverImage
     //validation - not empty
     //check if user already exist using either email OR username
     //check from image  and avatar
     // upload to cloudinary coverimage and avatar and get a string form cloudinary
     //createa a userobject and save it in database
     //check for user creation 
     //return response 

      const { username, email , password, fullName } = req.body;

      //check: not empty
      if([username, email, password, fullName].some((field)=> field?.trim() ==="")) 
      {
         throw new ApiError(400 , "All Fields required")
      }

      //check : valid email format
      if(
         !email.includes("@")||
          email.startsWith("@") ||
          email.endsWith("@")
      ) {
         throw new ApiError(400, "Invalid Email Format")
      }

      //check : user already exist
      const existingUser = await User.findOne({
         $or: [
            { username: username },
            {email: email}
         ]
      })

      if(existingUser) {
         throw new ApiError(409, "User with Email or Username already exists")
      }

      //check: avatar and coverimage
      const filePathAvatar= req.files?.avatar?.[0]
      const filePathCoverImage= req.files?.coverImage?.[0]

      if(!filePathAvatar) {
         throw new ApiError(400, "Avatar is required");
      }

      //upload : on cloudinary
      const avatarObj= await uploadOnCloudinary(filePathAvatar.path)
      const coverObj = await uploadOnCloudinary(filePathCoverImage.path)

      if(!avatarObj) {
         throw new ApiError(400, "Avatar file is requried")
      }

      // Upload : database 
      const user =  await User.create({
         username: username.toLowerCase(),
         password,
         fullName,
         email,
         avatar: avatarObj.url,
         coverImage: coverObj?.url || ""
      })

      //check : user created and remove sensitive information

      const createdUser= await user.findById(user._id).select(
         "-password -refreshToken"
      )

      if(!createdUser) {
         throw new ApiError(500, "something went wrong while registering the user")
      }

      // response
      res.status(201).json( 
         new ApiResponse(200, createdUser, "user registration successfull")
       )


})

export {registerUser}