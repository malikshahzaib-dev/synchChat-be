import { Response } from "express";
import User from "../models/usermodel";
import { AuthRequest } from "../middleware/auth";
import catchAsync from "../utils/catchAsync";

export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const users = await User.find({ _id: { $ne: req.userId } }).select("-password");
  res.json(users);
});

export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400).json({ message: "Name is required" });
    return;
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { name: name.trim() },
    { new: true }
  ).select("-password");

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
});
