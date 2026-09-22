import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";

const MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini(
  model: string,
  prompt: string
): Promise<{ success: boolean; reply?: string; retryable?: boolean; error?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 700,
        },
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      return {
        success: false,
        retryable: response.status === 429 || response.status === 503,
        error: `Gemini ${response.status}: ${text}`,
      };
    }

    const data = JSON.parse(text) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const reply =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    if (!reply) {
      return {
        success: false,
        retryable: true,
        error: "Gemini returned an empty response",
      };
    }

    return {
      success: true,
      reply,
    };
  } catch (error: any) {
    return {
      success: false,
      retryable: true,
      error: error?.message || "Network error",
    };
  }
}

export async function chatWithAI(message: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
You are ResumeIQ AI — a professional AI Career Assistant.

Your purpose is to help users with:
- Resume improvement
- ATS optimization
- Interview preparation
- Job search
- Job matching
- Skill gap analysis
- Career roadmaps
- Cover letters
- LinkedIn optimization
- AI/ML career guidance
- General career questions

IMPORTANT RESPONSE RULES:

1. Give direct and practical answers.
2. Do not write unnecessarily long answers.
3. Prefer short paragraphs and bullet points.
4. Use headings when useful.
5. If the user asks a simple question, answer simply.
6. If the user asks for a roadmap, give clear steps.
7. If the user asks about a resume but no resume is available, ask them to upload it.
8. Understand Hindi, Hinglish and English.
9. Reply in the same language/style as the user when possible.
10. Do not pretend to have access to a resume unless it was actually provided.
11. Do not repeat the user's question unnecessarily.
12. Be useful like a career coach, not like a generic chatbot.

User message:
${message}
`;

  // Try primary model first
  const primary = await callGemini(MODELS[0], prompt);

  if (primary.success && primary.reply) {
    return primary.reply;
  }

  console.log(
    `Primary Gemini model failed: ${primary.error}`
  );

  // Fast fallback for temporary overload/rate limits
  if (primary.retryable) {
    console.log(
      `Switching from ${MODELS[0]} to ${MODELS[1]}...`
    );

    await sleep(500);

    const fallback = await callGemini(MODELS[1], prompt);

    if (fallback.success && fallback.reply) {
      return fallback.reply;
    }

    console.log(
      `Fallback Gemini model failed: ${fallback.error}`
    );

    // One quick retry of fallback model
    if (fallback.retryable) {
      await sleep(1500);

      const retry = await callGemini(MODELS[1], prompt);

      if (retry.success && retry.reply) {
        return retry.reply;
      }
    }
  }

  throw new Error(
    "AI assistant is temporarily unavailable. Please try again in a moment."
  );
}