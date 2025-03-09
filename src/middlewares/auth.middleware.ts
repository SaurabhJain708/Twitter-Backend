import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?:any; 
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(400,"User token not found")
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;
    } catch (error) {
      throw new ApiError(401,"Invalid or expired token")
    }

    if (!decodedToken || !decodedToken.id) {
      throw new ApiError(401,"Invalid or expired token")
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      throw new ApiError(404,"User not found")
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(500,"Internal server error")
  }
};
