import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
    subscriber_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    subscribedTo_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
},{timestamps:true})

export const Subscriber = mongoose.model("Subscriber",subscriberSchema) 