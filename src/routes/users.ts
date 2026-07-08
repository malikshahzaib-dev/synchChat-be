import { Router } from "express";
import { getUsers, getUserById, updateMe } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.patch("/me", protect, updateMe);

export default router;
