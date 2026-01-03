import mongoose, { Schema }  from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new  Schema({
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true,
        index: true
    },
    email : {
        type : String , 
        unique: true,
        lowercase: true,
        required: true,
        trim: true,
    },
    fullName: {
        type: String , 
        required: true
    },
    password: {
        type : String,
        required: [true,  "Password is required"]
    },
    avatar: {
        type: String, // cloudinary url
        required: true,
    },
    coverImage: {
        type : String ,// cloudinary url
    },
    watchHistory: [
        {type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
      refreshToken: {
    type: String
    
  }
},{timestamps: true})

// hashing the password using bcrypt
userSchema.pre("save", async function(next) {//  await User.create , await  User.find etc
    if(!this.isModified("password")) return next();

    this.password =  await bcrypt.hash(this.password, 10)
})

//compare password \returns true or false 
userSchema.methods.isPasswordCorrect = async function(sentPassword) {
  return await bcrypt.compare(sentPassword , this.password)
}

//Generating access token 
userSchema.methods.generateAccessToken= function() {
   return  jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}

//Generating refresh token
userSchema.methods.generateRefreshToken= function() {
   return  jwt.sign(
        {
            _id : this._id,
            
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User", userSchema)