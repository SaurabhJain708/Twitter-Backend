import mongoose, { Document, Model } from "mongoose";

interface Bkuser extends Document {
  blockedBy: mongoose.Types.ObjectId;
  blocked: mongoose.Types.ObjectId;
}

const blockSchema = new mongoose.Schema<Bkuser>(
  {
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

export const BlockedUser: Model<Bkuser> = mongoose.model<Bkuser>(
  "BlockedUser",
  blockSchema
);
