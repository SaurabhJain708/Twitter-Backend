import { Subscriber } from "../models/subscriber.model";
import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { AsyncHandler } from "../utils/AsyncHandler";
import { Request, Response } from "express";

interface AuthRequest extends Request {
  user?: any;
}
export const subscribe = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req?.user) {
      throw new ApiError(404, "User does not exist");
    }
    const { subscriberAccount, subscribedToAccount } = req.body;
    if (!subscriberAccount || !subscribedToAccount) {
      throw new ApiError(400, "Missing information");
    }
    const checksubscriber = await User.findById(subscriberAccount);
    const checksubscribedTo = await User.findById(subscribedToAccount);

    if (!checksubscriber || !checksubscribedTo) {
      throw new ApiError(400, "Please provide valid user ids");
    }
    const checksubexist = await Subscriber.findOne({
      subscriber_id: checksubscriber._id,
      subscribedTo_id: checksubscribedTo._id,
    });
    if (checksubexist) {
      throw new ApiError(400, "user is already subscribed to this account");
    }
    const createSubscription = await Subscriber.create({
      subscriber_id: checksubscriber._id,
      subscribedTo_id: checksubscribedTo._id,
    });
    if (!createSubscription) {
      throw new ApiError(500, "Something went wrong while subscribing");
    }
    await User.findByIdAndUpdate(checksubscribedTo._id, {
      $inc: { subscribers: 1 },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Subscribed successfully"));
  }
);

export const unSubscribe = AsyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req?.user) {
      throw new ApiError(404, "User does not exist");
    }
    const { subscriberAccount, subscribedToAccount } = req.body;
    if (!subscriberAccount || !subscribedToAccount) {
      throw new ApiError(400, "Missing information");
    }
    const checksubscriber = await User.findById(subscriberAccount);
    const checksubscribedTo = await User.findById(subscribedToAccount);

    if (!checksubscriber || !checksubscribedTo) {
      throw new ApiError(400, "Please provide valid user ids");
    }
    const checksubexist = await Subscriber.findOne({
      subscriber_id: checksubscriber._id,
      subscribedTo_id: checksubscribedTo._id,
    });
    if (!checksubexist) {
      throw new ApiError(400, "User is not subscribed to this account");
    }
    const deleteSubscription = await Subscriber.findByIdAndDelete(
      checksubexist._id
    );
    if (!deleteSubscription) {
      throw new ApiError(500, "Something went wrong while unsubscribing");
    }
    await User.findByIdAndUpdate(checksubscribedTo._id, {
      $inc: { subscribers: -1 },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  }
);
