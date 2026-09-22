import { Router, Request, Response } from "express";
import { chatWithAI } from "../services/chat";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await chatWithAI(message);

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("Chat error:", error);

    return res.status(500).json({
      success: false,
      message: "AI assistant failed",
      error: error?.message || "Unknown error",
    });
  }
});

export default router;