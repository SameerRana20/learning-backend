import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
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
         throw new apiError(400 , "All Fields required")
      }

      //check : valid email format
      if(
         !email.includes("@")||
          email.startsWith("@") ||
          email.endsWith("@")
      ) {
         throw new apiError(400, "Invalid Email Format")
      }

      //check : user already exist
      const existingUser = await User.findOne({
         $or: [
            { username: username },
            {email: email}
         ]
      })

      if(existingUser) {
         throw new apiError(409, "User with Email or Username already exists")
      }

      //check: avatar and coverimage
      const filePathAvatar= req.files?.avatar?.[0]?.path
      const filePathCoverImage= req.files?.coverImage?.[0]?.path

      console.log(filePathAvatar)

      if(!filePathAvatar) {
          throw new apiError(400, "Avatar is required");
      }

      //upload : on cloudinary
      const avatarObj= await uploadOnCloudinary(filePathAvatar)
      const coverObj = await uploadOnCloudinary(filePathCoverImage)
     
      if(!avatarObj) {
         throw new apiError(400, "Avatar file is requried")
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

      const createdUser= await User.findById(user._id).select(
         "-password -refreshToken"
      )

      if(!createdUser) {
         throw new apiError(500, "something went wrong while registering the user")
      }

      // response
      res.status(201).json( 
         new ApiResponse(200, createdUser, "user registration successfull")
       )


})

//-----------USER LOGIN------------

const loginUser =asyncHandler(async(req, res)=> {
    
//get data from frontend-- username ,email, password
   const {email, username , password}= req.body

// check if user exists
   if(!username && !email) {
      throw new apiError(400, "Username or Email is requried")
   } 

   let query = email? {email} : {username}

   const user = await User.findOne(query)

   if(!user) {
      throw new apiError(404, "user not found")
   }

// check if password is correct using  custom method isPasswordCorrect
   let checkPassword = await user.isPasswordCorrect(password) 

   if(!checkPassword) {
      throw new apiError(401, "invalid password credentials")
   }

//generate a access token and refresh token
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken()
   await user.save({validateBeforeSave: false})

   const finalUserDocument  = User.findById(user._id).select(
      "-password -refreshToken"
   )

//send  cookie  and response
   res
   .status(200)
   .cookie("accessToken" ,accessToken, {httpOnly: true, secure: true})
   .cookie("refreshToken", refreshToken, {httpOnly: true, secure: true})
   .json( 
      new ApiResponse(200 , finalUserDocument , "user Logged in successfully")
    )

   

    

})

   const logoutUser  = asyncHandler( async(req, res)=>{
      // removing refresh token from document 
      
   })

export {registerUser, loginUser}