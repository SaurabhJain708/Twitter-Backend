import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import User from "../models/user.model";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?:any; 
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "User not found, Please login again" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as jwt.JwtPayload;
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found, Please login again" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
