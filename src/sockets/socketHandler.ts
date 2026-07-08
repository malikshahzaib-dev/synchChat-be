import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/usermodel";
import Message from "../models/messagemodel";
import Conversation from "../models/conversationModel";

export const setupSocket = (io: Server) => {

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log("User connected:", userId);

    await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });

    const conversations = await Conversation.find({ participants: userId });
    socket.join(conversations.map((c) => c._id.toString()));

    socket.broadcast.emit("user-online", { userId });

    socket.on("join", (conversationId: string) => {
      socket.join(conversationId);
    });



    socket.on("send-message", async (data: { conversationId: string; receiverId: string; text: string }) => {
      try {
        const message = await Message.create({
          conversationId: data.conversationId,
          sender: userId,
          receiver: data.receiverId,
          text: data.text,
        });

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.text,
          lastMessageAt: new Date(),
        });

        const populated = await message.populate("sender", "name avatar");
        io.to(data.conversationId).emit("receive-message", populated);
      } catch (error) {
        console.error("send-message error:", error);
      }
    });



    socket.on("typing", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("typing", { userId, conversationId: data.conversationId });
    });



    socket.on("stop-typing", (data: { conversationId: string }) => {
      socket.to(data.conversationId).emit("stop-typing", { conversationId: data.conversationId });
    });



    socket.on("message-seen", async (data: { messageId: string; conversationId: string }) => {
      try {
        await Message.findByIdAndUpdate(data.messageId, { status: "seen" });
        socket.to(data.conversationId).emit("message-seen", { messageId: data.messageId });
      } catch (error) {
        console.error("message-seen error:", error);
      }
    });



    socket.on("delete-message", (data: { messageId: string; conversationId: string }) => {
      socket.to(data.conversationId).emit("message-deleted", { messageId: data.messageId });
    });



    socket.on("disconnect", async () => {
      console.log("User disconnected:", userId);
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen, socketId: "" });
      socket.broadcast.emit("user-offline", { userId, lastSeen: lastSeen.toISOString() });
    });

  });

}; 
