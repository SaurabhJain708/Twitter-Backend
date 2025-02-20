import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "postType",
      required: true,
    },
    postType: {
      type: String,
      required: true,
      enum: ["Video", "Post", "Comment"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    likes: {
      type: Number,
      required: true,
      default: 0,
    },
    replies: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);
