import mongoose, { Document, Model } from "mongoose";

interface Pmdl extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  content: string;
  files?: string;
  likes: number;
  shares: number;
  impressions: number;
  tags: string[];
}

const postSchema = new mongoose.Schema<Pmdl>(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    files: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
      required: true,
    },
    impressions: {
      type: Number,
      default: 0,
      required: true,
    },
    tags: [{ type: String }],
    shares: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", content: "text", tags: 1 });

export const Post: Model<Pmdl> = mongoose.model<Pmdl>("Post", postSchema);
