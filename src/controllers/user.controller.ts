import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import {Express, Request, Response} from " express"

export const generateRefreshToken = async (userId:any) => {
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const refreshtoken = user.generateRefreshToken();
    user.refreshtoken = refreshtoken;
    const accesstoken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(500, "Server error");
  }
};

export const handleuserregister = AsyncHandler(async (req, res) => {
  const { username, email, fullName, gender, password } = req?.body;
  if (
    !(
      username ||
      email ||
      fullName ||
      ["MALE", "FEMALE", "OTHER"].includes(gender) ||
      password
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(400, "User already exists");
  }
  const newUser = await User.create({
    username,
    email,
    fullName,
    gender,
    password,
  });

  const checknewUser = await User.findById(newUser?._id);

  if (!checknewUser) {
    throw new ApiError(400, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, checknewUser._id, "User created successfully"));
});

export const handleuserlogin = AsyncHandler(async (req, res) => {
  const { username, email, password } = req?.body;
  if ((!username && !email) || !password) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  })
    .select("+password")
    .exec();

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const validPassword = await user.isPasswordCorrect(password);

  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const {accesstoken, refreshtoken} = await generateRefreshToken(user?._id)
});
