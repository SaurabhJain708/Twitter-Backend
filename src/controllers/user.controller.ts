import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { AsyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Request, Response } from "express";
import { DeactivatedAccount } from "../models/deactivate.model";
import mongoose from "mongoose";
import { BlockedUser } from "../models/blockuser.model";

interface AuthRequest extends Request {
  user?: any;
}
export const generateRefreshToken = async (userId: any) => {
  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const refreshtoken = user.generateRefreshToken();
    user.refreshToken = refreshtoken;
    const accesstoken = user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(500, "Server error");
  }
};

export const handleuserregister = AsyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, fullName, gender, password } = req?.body;
    if (
      !username ||
      !email ||
      !fullName ||
      !["MALE", "FEMALE", "OTHER"].includes(gender) ||
      !password
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
      .json(
        new ApiResponse(200, checknewUser._id, "User created successfully")
      );
  }
);

export const handleuserlogin = AsyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req?.body;
    if ((!username && !email) || !password) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({
      $or: [{ email }, { username }],
    })
      .select("+password +refreshToken")
      .exec();

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const validPassword = await user.isPasswordCorrect(password);

    if (!validPassword) {
      throw new ApiError(401, "Invalid user credentials");
    }
    const { accesstoken, refreshtoken } = await generateRefreshToken(user?._id);

    if (!accesstoken || !refreshtoken) {
      throw new ApiError(
        500,
        " Something went wrong while generating access or refresh token"
      );
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accesstoken, options)
      .cookie("refreshToken", refreshtoken, options)
      .json(
        new ApiResponse(
          200,
          { user, refreshtoken, accesstoken },
          "User logged in successfully"
        )
      );
  }
);

export const handlechangeusername = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    const { newUsername, confirm } = req?.body;
    if (!newUsername) {
      throw new ApiError(400, "Invalid username");
    }
    const checkUsername = await User.findOne({ username: newUsername });
    if (!checkUsername) {
      if (Boolean(confirm)) {
        const check = await User.findByIdAndUpdate(
          user._id,
          { username: newUsername },
          { new: true }
        );
        if (!check || check.username !== newUsername) {
          throw new ApiError(
            500,
            "Something went wrong while changing username"
          );
        }
        return res
          .status(201)
          .json(new ApiResponse(200, user, "username changed successfully"));
      } else {
        return res
          .status(200)
          .json(new ApiResponse(200, user, "username is available"));
      }
    } else {
      throw new ApiError(401, "username already exists");
    }
  }
);

export const handledeleteuser = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const deletedUser = await User.findByIdAndDelete(user._id);
    if (!deletedUser) {
      throw new ApiError(500, "Something went wrong while deleting user");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res
      .status(200)
      .json(new ApiResponse(200, deletedUser._id, "User deleted successfully"));
  }
);

export const logoutuser = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const check = await User.findByIdAndUpdate(
      user?._id,
      {
        $unset: { refreshToken: 1 },
      },
      { new: true }
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    if (!check) {
      throw new ApiError(500, "Something went wrong while logging out");
    }
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
    return res
      .status(200)
      .json(new ApiResponse(200, user._id, "User logged out successfully"));
  }
);

// Todo use multer here
export const changeuserdetails = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const { bio, gender, fullName } = req.body;
    const changedUserDetails = await User.findByIdAndUpdate(
      user._id,
      {
        bio,
        gender,
        fullName,
      },
      { new: true }
    );
    if (!changedUserDetails) {
      throw new ApiError(
        500,
        "Something went wrong while changing user details"
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User details changed successfully"));
  }
);

export const deactivateUserAccount = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req?.user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const user = await User.findById(req?.user?._id);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
    const Deactivatecheck = await DeactivatedAccount.findOne({
      userId: user._id,
    });
    if (Deactivatecheck) {
      throw new ApiError(400, "Account already deactivated");
    }
    const Deactivate = await DeactivatedAccount.create({ userId: user._id });
    if (!Deactivate) {
      throw new ApiError(500, "Something went wrong while deactivating user");
    }
    user.Deactivate = Deactivate._id as mongoose.Types.ObjectId;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, Deactivate, "User deactivated successfully"));
  }
);

export const accountReactivate = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req?.user?._id);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
    const deactivatedInstance = await DeactivatedAccount.findOneAndDelete({
      userId: user._id,
    });
    if (!deactivatedInstance) {
      throw new ApiError(500, "Something went wrong while reactivating user");
    }
    user.Deactivate = undefined;
    await user.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          deactivatedInstance,
          "User reactivated successfully"
        )
      );
  }
);

export const changePassword = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req?.user?._id);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }
    const { oldpassword, newpassword, confirmnewpassword } = req.body;
    if (
      !oldpassword ||
      !newpassword ||
      !confirmnewpassword ||
      newpassword !== confirmnewpassword
    ) {
      throw new ApiError(400, "Please fill required fields correctly");
    }
    const validateoldPassword = await user.isPasswordCorrect(oldpassword);
    if (!validateoldPassword) {
      throw new ApiError(400, "Incorrect password");
    }
    user.password = newpassword;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password updated successfully"));
  }
);

export const blockUser = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = req?.user;
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }
      const { blockUser } = req?.body;

      if (!blockUser) {
        throw new ApiError(400, "Please give the id of user to be blocked");
      }

      const checkifAlreadyBlocked = await BlockedUser.findOne({
        blockedBy: user._id,
        blocked: blockUser,
      })
        .session(session)
        .exec();

      if (checkifAlreadyBlocked) {
        throw new ApiError(400, "User is already blocked");
      }
      const checkifToBeBlockedUserExists = await User.findById(blockUser)
        .session(session)
        .exec();

      if (!checkifToBeBlockedUserExists) {
        throw new ApiError(404, "User doesnt exist");
      }

      const blockinguser = await BlockedUser.insertMany(
        [
          {
            blockedBy: user._id,
            blocked: checkifToBeBlockedUserExists._id,
          },
        ],
        { session }
      );

      if (!blockinguser) {
        throw new ApiError(500, "Blocking failed");
      }

      const updateBlockedUser = await User.findByIdAndUpdate(
        checkifToBeBlockedUserExists._id,
        { $push: { blockedBy: user._id } },
        { new: true, session }
      ).exec();
      const updateUser = await User.findByIdAndUpdate(
        user._id,
        { $push: { blocked: checkifToBeBlockedUserExists._id } },
        { new: true, session }
      ).exec();

      if (!updateBlockedUser || !updateUser) {
        throw new ApiError(500, "Something went wrong while updating users");
      }
      await session.commitTransaction();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "User blocked successfully"));
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

export const unblock = AsyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = req?.user;
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }
    const { blockedId } = req?.body;
    if (!blockedId) {
      throw new ApiError(400, "Please give the id of user to be blocked");
    }
    const deleteBlocking = await BlockedUser.findOneAndDelete({
      blocked: blockedId,
      blockedBy: user._id,
    })
      .session(session)
      .exec();
    if (!deleteBlocking) {
      throw new ApiError(500, "Something went wrong while unblocking user");
    }

    const updateBlockeduser = await User.findByIdAndUpdate(
      blockedId,
      { $pull: { blockedBy: user._id } },
      { new: true, session }
    ).exec();
    const updateuser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { blocked: blockedId } },
      { new: true, session }
    ).exec();

    if (!updateBlockeduser || !updateuser) {
      throw new ApiError(
        500,
        "Something went wrong while updating user block list"
      );
    }

    await session.commitTransaction();
    res
      .status(200)
      .json(new ApiResponse(200, null, "User unblocked successfully"));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});
