import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";
import { Request,Response } from "express";
import { Post } from "../models/post.model";

interface AuthRequest extends Request{
    user?:any;
}

export const addLike = AsyncHandler(async(req:AuthRequest,res:Response)=>{
    const session = await mongoose.startSession()
    session.startTransaction()
   try {
     const user = req?.user
     if(!user){
         throw new ApiError(401, "Invalid credentials");
     }
     const {category,id} = req?.body
     if(category!="Video"||"Post"||"Comment" || !id){
         throw new ApiError(400, "Please give the id and type of post");
     }
     if(category=="Post"){
         const checkifPostExists = await Post.findByIdAndUpdate(id,{likes:{$max:1}}).session(session).exec()
         if(!checkifPostExists){
            throw new ApiError(404,"Post not found")
         }
         const checkifAlreadyLiked = await 
     }
   } catch (error) {
    await session.abortTransaction()
    throw error
   }finally{
    await session.endSession()
   }
})