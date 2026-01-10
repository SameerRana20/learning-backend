import mongoose, { Schema } from "mongoose"

const sub = mongoose.Schema({
    suscriber : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Subscription = mongoose.Model("Subscription", sub )