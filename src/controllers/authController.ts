import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import { AuthRequest } from "../middleware/auth";
import catchAsync from "../utils/catchAsync";

function createToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

// POST /auth/register
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400).json({ message: "Email already in use" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });
  const token = createToken(user._id.toString());

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
  });
});

// POST /auth/login
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = createToken(user._id.toString());

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline: user.isOnline,
    },
  });
});

// POST /auth/logout  (JWT is stateless — client just deletes the token)
export const logout = (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};

// GET /auth/me
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});
