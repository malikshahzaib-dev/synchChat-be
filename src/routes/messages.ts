import { Router } from "express";
import { sendMessage, getMessages, deleteMessage } from "../controllers/messageController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);
router.delete("/:messageId", protect, deleteMessage);

export default router;
