
import { Router, Request, Response } from "express";
import Resume from "../models/Resume";
import { protect, AuthRequest } from "../middleware/auth";
import { chatWithAI } from "../services/chat";

const router = Router();

router.post(
  "/",
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      // Fetch the latest resume belonging to the logged-in user
      const resume = await Resume.findOne({
        userId: req.user!._id,
      }).sort({ createdAt: -1 });

      const resumeText = resume?.extractedText || "";

console.log("Chat Debug:", {
  userId: req.user?._id?.toString(),
  resumeFound: Boolean(resume),
  resumeFileName: resume?.fileName,
  extractedTextLength: resumeText.length,
  extractedTextPreview: resumeText.slice(0, 300),
});


      const reply = await chatWithAI(message, resumeText);

      return res.status(200).json({
        success: true,
        reply,
        hasResume: Boolean(resumeText.trim()),
        resumeFileName: resume?.fileName || null,
      });
    } catch (error: any) {
      console.error("Chat error:", error);

      return res.status(500).json({
        success: false,
        message: "AI assistant failed",
        error: error?.message || "Unknown error",
      });
    }
  }
);

export default router;
