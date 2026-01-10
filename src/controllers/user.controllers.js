import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//-----------USER REGISTRATION------------

const registerUser = asyncHandler(async (req, res)=>{
 
   // get data from frontend | username , email, fullName , password ,  avatar, coverImage
      const { username, email , password, fullName } = req.body;

   //validation - not empty
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

   //check if user already exist using either email OR username
      const existingUser = await User.findOne({
         $or: [
            { username: username },
            {email: email}
         ]
      })

      if(existingUser) {
         throw new apiError(409, "User with Email or Username already exists")
      }

   //check from image  and avatar 
      const filePathAvatar= req.files?.avatar?.[0]?.path
      const filePathCoverImage= req.files?.coverImage?.[0]?.path

      console.log(filePathAvatar)

      if(!filePathAvatar) {
          throw new apiError(400, "Avatar is required");
      }

   // upload to cloudinary coverimage and avatar and get a string form cloudinary
      const avatarObj= await uploadOnCloudinary(filePathAvatar)
      const coverObj = await uploadOnCloudinary(filePathCoverImage)
     
      if(!avatarObj) {
         throw new apiError(400, "Avatar file is requried")
      }

    //createa a user object and save it in database
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

   //return response 
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
     if(!password) {
      throw new apiError(400, "Password is required")
   }

   let checkPassword = await user.isPasswordCorrect(password) 

   if(!checkPassword) {
      throw new apiError(401, "Invalid email or password")
   }

//generate a access token and refresh token
   const accessToken = user.generateAccessToken()
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   const finalUserDocument  = await     User.findById(user._id).select(
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

//-----------USER LOGOUT------------
const logoutUser  = asyncHandler( async(req, res)=>{

   const { _id } = req.user
   
//Delete refresh token from database- Undefined
    await User.findByIdAndUpdate(_id , {
      $set: {refreshToken : null}
    })

//Delete Access token and Refresh token from cookies
//Provide Reponse
    res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true , secure: true })
    .clearCookie("refreshToken" , { httpOnly: true , secure: true})
    .json(
      new ApiResponse(200, {}, "User logged out")
    )
      
   })

//-----------REFRESH ACCESS TOKEN------------

const refreshAccessToken = asyncHandler(async(req, res)=>{

//get refresh token from cookies
   const incomingRefreshToken =req.cookies?.refreshToken || res.body?.refreshToken 

   if(!incomingRefreshToken) {
      throw new apiError(400, "unauthorized request")
   }

//decode refresh token Because refresh token sent to usercookie is different fron what saved in databse
   const decodedRefreshToken = jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET)

//get user info 
   const user =  await User.findById(decodedRefreshToken?._id)

   if(!user) {
      throw new apiError(400 , "invalid refresh token")
   }
   //check if incoming token is same as stored one
   if(user?.refreshToken != incomingRefreshToken) {
      throw new apiError(400, "invalid refresh token")
   }

//generate accessToken 
   const accessToken= user.generateAccessToken()

//send response and cookie  
   res
   .status(200)
   .cookie("accessToken", accessToken, { httpOnly:true , secure: true})
   .json(
      new ApiResponse(200,accessToken, "access token refreshed")
   )
})

//-----------CHANGE CURRENT PASSWORD------------

const changeCurrentPassword = asyncHandler(async (req, res)=>{
//get password from request body 
   const {oldPassword, newPassword, confirmPassword} = req.body

//check if the user is logged in and get user data
   const userId = req.user?._id

   const user = await User.findById(userId)

   if(!user) {
      throw new apiError(400, "Login is required")
   }

//check if password is correct
   const checkPassword= await user.isPasswordCorrect(oldPassword)
   if(!checkPassword) {
      throw new apiError(400, "invalid old passsword")
   }

   if(!(newPassword == confirmPassword)) {
      throw new apiError(400, "password dosen't match")
   }

//change password  and save it in database
   user.password = newPassword
   await user.save({validateBeforeSave: false})

//send response
   res.
   status(200)
   .json(
      new ApiResponse(200,{} , "Password Changed successfull")
   )
})

//-----------FETCH CURRENT USER------------
const getCurrentUser= asyncHandler(async(req, res)=>{
   res.status(200).json(
      new ApiResponse(200, req.user, "current user fetched successfull")
   )
})

//-----------CHANGE USER INFO------------
const updateUserInfo =  asyncHandler(async(req,res)=>{
   const { fullName, email }= req.body

   if(!fullName && !email) {
      throw new apiError(400, "fullname and email bhot are requried")
   }

   if(
         !email.includes("@")||
          email.startsWith("@") ||
          email.endsWith("@")
      ) {
         throw new apiError(400, "Invalid Email Format")
      }

   const user = await User.findByIdAndUpdate(
      req.user?._id, 
      {
         $set: {
            fullName,
            email
         }
      },
      {new:true}).select("-password -refreshToken")

      res
      .status(200)
      .json(200, user, "account details updated succesfully")
})

//-----------UPDATE AVATAR------------

const updateUserAvatar = asyncHandler(async(req, res)=>{
   const avatarPath = req.file?.path

   if(!avatarPath) {
      throw new apiError(400, "avatar file is missing")
   }
   const avatar = await uploadOnCloudinary(avatarPath)

   if(!avatar.url) {
      throw new error(200, "Error while uploading avatar")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
       {
      $set: { avatar: avatar.url},
      },
      {
         new:true
      }.select("-password -refreshToken")
   )

   res.status(200).json(
      new ApiResponse(200, "Avatar updated successfully")
   )
})

//-----------UPDATE COVER IMAGE------------

const updateUserCoverImage = asyncHandler(async(req, res)=>{
   const coverPath = req.file?.path

   if(!coverPath) {
      throw new apiError(400, "Cover image file is missing")
   }
   const coverImage = await uploadOnCloudinary(coverPath)

   if(!coverImage.url) {
      throw new error(200, "Error while uploading cover Image")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
       {
      $set: { coverImage: coverImage.url},
      },
      {
         new:true
      }.select("-password -refreshToken")
   )

   res.status(200).json(
      new ApiResponse(200, "Cover image updated successfully")
   )
})

export {
   registerUser,
   loginUser, 
   logoutUser,
   refreshAccessToken,
      changeCurrentPassword,
      getCurrentUser,
      updateUserInfo,
      updateUserAvatar,
      updateUserCoverImage

}