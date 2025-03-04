import mongoose, { Document, Model } from "mongoose";

interface Lmdl extends Document {
  category: "Post" | "Video" | "Comment";
  likedBy: mongoose.Types.ObjectId;
  file_id: mongoose.Types.ObjectId;
}

const likeSchema = new mongoose.Schema<Lmdl>(
  {
    category: {
      type: String,
      enum: ["Post", "Video", "Comment"],
      required: true,
    },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    file_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "category",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Liked: Model<Lmdl> = mongoose.model<Lmdl>("Liked", likeSchema);
