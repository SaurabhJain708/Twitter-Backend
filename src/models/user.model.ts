import mongoose from "mongoose";
const userschema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    refreshtoken: {
      type:                            String,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userschema);