import { Router } from "express";
import {
  accountReactivate,
  blockUser,
  changePassword,
  changeuserdetails,
  deactivateUserAccount,
  handlechangeusername,
  handledeleteuser,
  handleuserlogin,
  handleuserregister,
  logoutuser,
  refreshToken,
  unblock,
} from "../controllers/user.controller";
import { auth } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.route("/register").post(handleuserregister);
userRouter.route("/login").post(handleuserlogin);
userRouter.route("/change-username").post(auth, handlechangeusername);
userRouter.route("/delete").delete(auth, handledeleteuser);
userRouter.route("/logout").get(auth, logoutuser);
userRouter.route("/change-user-details").post(auth, changeuserdetails);
userRouter.route("/deactivate").get(auth, deactivateUserAccount);
userRouter.route("/reactivate").get(auth, accountReactivate);
userRouter.route("/change-password").post(auth, changePassword);
userRouter.route("/block").post(auth, blockUser);
userRouter.route("/unblock").post(auth, unblock);
userRouter.route("/refreshtoken").post(refreshToken);
