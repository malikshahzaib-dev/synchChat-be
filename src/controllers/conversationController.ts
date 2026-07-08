import { Response } from "express";
import Conversation from "../models/conversationModel";
import { AuthRequest } from "../middleware/auth";
import catchAsync from "../utils/catchAsync";

export const createConversation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { receiverId } = req.body;
  const senderId = req.userId;

  if (!receiverId) {
    res.status(400).json({ message: "receiverId is required" });
    return;
  }

  const existing = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("participants", "-password");

  if (existing) {
    res.json(existing);
    return;
  }

  const conversation = await Conversation.create({
    participants: [senderId, receiverId],
  });

  const populated = await conversation.populate("participants", "-password");
  res.status(201).json(populated);
});

export const getConversations = catchAsync(async (req: AuthRequest, res: Response) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.userId] },
  })
    .populate("participants", "-password")
    .sort({ lastMessageAt: -1 });

  res.json(conversations);
});
