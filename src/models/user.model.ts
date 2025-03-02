import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface Iuser extends Document {
  username: string;
  email: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  avatar?: string;
  coverImage?: string;
  videos?: mongoose.Types.ObjectId[];
  bio?: string;
  password: string;
  refreshToken: string;
  subscribers: number;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  Deactivate?: mongoose.Types.ObjectId;
  blocked?:mongoose.Types.ObjectId[];
  blockedBy?:mongoose.Types.ObjectId[];
}

const userSchema = new mongoose.Schema<Iuser>(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        index:true
      },
    ],
    bio: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    subscribers: {
      type: Number,
      required: true,
      default: 0,
    },
    Deactivate: {
      type: mongoose.Types.ObjectId,
      ref: "DeactivatedAccount",
      required: false,
    },
    blocked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlockedUser",
        index:true
      },
    ],
    blockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlockedUser",
        index:true
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre<Iuser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string): Promise<boolean> {
  const user = await User.findById(this._id).select("+password");
  return user ? bcrypt.compare(password, user.password) : false;
};


userSchema.methods.generateAccessToken = function (): string {
  const secretKey: string = process.env.ACCESS_TOKEN_SECRET!;
  return jwt.sign(
    {
      id: this._id,
    },
    secretKey,
    {
      expiresIn: "1d",
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secretKey: string = process.env.REFRESH_TOKEN_SECRET!;
  return jwt.sign(
    {
      id: this._id,
    },
    secretKey,
    {
      expiresIn: "10d",
    }
  );
};

const User: Model<Iuser> = mongoose.model<Iuser>("User", userSchema);

export default User;
