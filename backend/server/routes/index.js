import { Router } from "express";
import chatController from "../controllers/chatController.js";
const router = Router();

router.post('/newUserMessage', chatController.newUserMessage);

export default router;