import mongoose from "mongoose"

const videoSchema  = new mongoose.Schema(
    {
        videoFile : {
            type: String , // cloudinary
            required: true
        },
        thumbnail : {
            type : String, // cloudinary
            required : trusted,
        },
        title: {
             type: String,
             requred: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: number,// provided by cloudinary
            required: true
        },
        views: {
            type: number,
            default: 0
        },
        isPublished: {
            type : Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },
{timestamps: true} )

export const Video = mongoose.model("Video", videoSchema)