import mongoose, { Document, Model } from "mongoose";

interface Dacc extends Document {
  userId: mongoose.Schema.Types.ObjectId;
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
