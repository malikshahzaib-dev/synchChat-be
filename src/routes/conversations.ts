import { Router } from "express";
import { createConversation, getConversations } from "../controllers/conversationController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, createConversation);
router.get("/", authMiddleware, getConversations);

export default router;
