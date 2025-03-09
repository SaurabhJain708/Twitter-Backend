import mongoose, { Model } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Request, Response } from "express";
import { Post } from "../models/post.model.js";
import { Liked } from "../models/likes.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Video from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

interface AuthRequest extends Request {
  user?: any;
}

export const addLike = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const { category, id } = req?.body;
    if (!["Video", "Post", "Comment"].includes(category) || !id) {
      throw new ApiError(400, "Please give the id and type of post");
    }
    let Model: Model<any> = Post;
    if (category == "Post") {
      Model = Post;
    } else if (category == "Video") {
      Model = Video;
    } else if (category == "Comment") {
      Model = Comment;
    }
    const checkifPostExists = await Model.findById(id).session(session).exec();
    if (!checkifPostExists) {
      throw new ApiError(404, "Post not found");
    }
    const checkifAlreadyLiked = await Liked.findOne({
      file_id: id,
      likedBy: user._id,
      category,
    })
      .session(session)
      .exec();
    if (checkifAlreadyLiked) {
      throw new ApiError(400, "User already liked this content");
    }
    const addlike = await Liked.insertMany(
      [{ category, file_id: id, likedBy: user._id }],
      { session }
    );
    if (!addlike) {
      throw new ApiError(500, "Something went wrong while liking user");
    }
    const updatePost = await Model.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true, session }
    ).exec();
    if (!updatePost) {
      throw new ApiError(500, "Something went wrong while updating liked post");
    }
    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Post liked successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const unLike = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const { category, id } = req?.body;
    if (!["Video", "Post", "Comment"].includes(category) || !id) {
      throw new ApiError(400, "Please give the id and type of post");
    }

    let Model: Model<any> = Post;
    if (category == "Post") {
      Model = Post;
    } else if (category == "Video") {
      Model = Video;
    } else if (category == "Comment") {
      Model = Comment;
    }

    const unlikecontent = await Liked.findOneAndDelete({
      category,
      likedBy: user._id,
      file_id: id,
    })
      .session(session)
      .exec();
    if (!unlikecontent) {
      throw new ApiError(404, "User never liked this content");
    }

    const updateContent = await Model.findByIdAndUpdate(
      id,
      { $inc: { likes: -1 } },
      { new: true, session }
    ).exec();

    if (!updateContent) {
      throw new ApiError(
        500,
        "Something went wrong while updating unliked content"
      );
    }

    await session.commitTransaction();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Content unliked successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

export const updateViews = AsyncHandler(async (req: Request, res: Response) => {
  const { category, id } = req?.body;
  if (!["Video", "Post"].includes(category) || !id) {
    throw new ApiError(400, "Please give the id and type of post");
  }

  let Model: Model<any> = Post;
  if (category == "Post") {
    Model = Post;
  } else if (category == "Video") {
    Model = Video;
  }
  const updateView = await Model.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  ).exec();
  if (!updateView) {
    throw new ApiError(404, "Content not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "View added successfully"));
});
