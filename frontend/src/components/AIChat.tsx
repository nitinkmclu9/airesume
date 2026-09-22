"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://airesume-1-110s.onrender.com/api";

type Message = {
  role: "user" | "ai";
  text: string;
};

const suggestions = [
  "Improve my resume",
  "What skills should I learn?",
  "Prepare me for an interview",
  "How can I improve my ATS score?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! 👋 I'm ResumeIQ AI. I can help you with your resume, ATS score, skills, interviews and career roadmap.",
    },
  ]);

  const sendMessage = async (text?: string) => {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "AI response failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Sorry, I'm unable to respond right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <span className="text-xl">✨</span>
          <span className="font-semibold">AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[650px] w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171733] shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#282052] to-[#35206b] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl shadow-lg">
                ✨
              </div>

              <div>
                <h3 className="font-bold text-white">
                  ResumeIQ AI
                </h3>
                <p className="text-xs text-purple-200">
                  Your Career Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-xl text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                    msg.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-[#242447] text-gray-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-white/10 bg-[#242447] px-4 py-3 text-sm text-gray-300">
                  <span className="animate-pulse">
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="border-t border-white/10 px-4 py-3">
              <p className="mb-2 text-xs text-gray-400">
                Try asking:
              </p>

              <div className="flex flex-wrap gap-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => sendMessage(item)}
                    className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200 transition hover:bg-purple-500/20"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 bg-[#14142c] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#202040] px-3 py-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask your career question..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!message.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}