import { Response } from "express";
import Message from "../models/messagemodel";
import Conversation from "../models/conversationModel";
import { AuthRequest } from "../middleware/auth";
import catchAsync from "../utils/catchAsync";

// POST /messages
export const sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { conversationId, receiverId, text } = req.body;

  if (!conversationId || !receiverId || !text) {
    res.status(400).json({ message: "conversationId, receiverId, and text are required" });
    return;
  }

  const message = await Message.create({
    conversationId,
    sender: req.userId,
    receiver: receiverId,
    text,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    lastMessageAt: new Date(),
  });

  const populated = await message.populate("sender", "name avatar");
  res.status(201).json(populated);
});

export const getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  const { conversationId } = req.params;

  const messages = await Message.find({
    conversationId,
    deleteForEveryone: { $ne: true },   // exclude messages deleted for everyone
    deleteFor: { $nin: [req.userId] },  // exclude messages this user deleted for themselves
  })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  res.json(messages);
});

export const deleteMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  const { messageId } = req.params;
  const { type } = req.body;

  if (!type || !["me", "everyone"].includes(type)) {
    res.status(400).json({ message: 'type must be "me" or "everyone"' });
    return;
  }

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404).json({ message: "Message not found" });
    return;
  }

  if (type === "everyone") {
    if (message.sender.toString() !== req.userId) {
      res.status(403).json({ message: "Only the sender can delete for everyone" });
      return;
    }
    await Message.findByIdAndUpdate(messageId, { deleteForEveryone: true });
    res.json({ deleted: true, type: "everyone", messageId });
  } else {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deleteFor: req.userId },
    });
    res.json({ deleted: true, type: "me", messageId });
  }
});