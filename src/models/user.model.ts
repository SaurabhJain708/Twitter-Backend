import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//  TODO CHANGE ENV SETTINGS

const userSchema = new mongoose.Schema(
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
    },
    refreshtoken: {
      type: String,
      required: false,
    },
    subscribers:{
      type:Number,
      required:true,
      default:0
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
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

userSchema.methods.generateRefreshToken = function () {
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

const User = mongoose.model("User", userSchema);

export default User;
