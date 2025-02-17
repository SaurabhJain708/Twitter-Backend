import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    creator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    thumbnail:{
        type:String,
        required:true,
    },
    likes:{
        type:Number,
        default:0
    },
    shares:{
        type:Number,
        default:0
    },
    views:{
        type:Number,
        default:0
    },
    videoFile:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    tags:[String],
},{timestamps:true})

const Video = mongoose.model("Video",videoSchema)

export default Video