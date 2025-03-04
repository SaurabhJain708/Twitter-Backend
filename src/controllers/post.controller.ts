import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";
import { Request,Response } from "express";

interface AuthRequest extends Request{
    user?:any;
}

export const addLike = AsyncHandler(async(req:AuthRequest,res:Response)=>{
    const user = req?.user
    if(!user){
        throw new ApiError(401, "Invalid credentials");
    }
    const {category,id} = req?.body
    if(category!="Video"||"Post" || !id){
        throw new ApiError(400, "Please give the id and type of post");
    }
    
})