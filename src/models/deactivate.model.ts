import mongoose, { Document, Model } from "mongoose";

export interface Dacc extends Document {
  userId: mongoose.Types.ObjectId;
}

const DeactivatedAccSchema = new mongoose.Schema<Dacc>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const DeactivatedAccount: Model<Dacc> = mongoose.model<Dacc>("DeactivatedAccount", DeactivatedAccSchema);
