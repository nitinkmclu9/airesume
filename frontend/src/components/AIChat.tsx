
"use client";

import ReactMarkdown from "react-markdown";
import { useState } from "react";
import Cookies from "js-cookie";

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
      // Read the authentication token
      const token =
        Cookies.get("token") ||
        (typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null);

      if (!token) {
        throw new Error(
          "Please log in again to use the AI assistant."
        );
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "AI response failed"
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            typeof data.reply === "string"
              ? data.reply
              : "I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("AI Chat Error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error";

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            errorMessage === "Failed to fetch"
              ? "Server se connection nahi ho raha. Please try again."
              : errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-white shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <span className="text-xl">✨</span>
          <span className="font-semibold">AI Assistant</span>
        </button>
      )}

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
              aria-label="Close AI assistant"
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
                  className={`max-w-[90%] min-w-0 rounded-2xl px-4 py-3 text-sm leading-6 break-words ${
                    msg.role === "user"
                      ? "whitespace-pre-wrap rounded-br-md bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                      : "rounded-bl-md border border-white/10 bg-[#242447] text-gray-200"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="mb-2 mt-3 text-lg font-bold text-white first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-3 text-base font-bold text-white first:mt-0">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-3 text-sm font-bold text-white first:mt-0">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-white">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="pl-1">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="break-words rounded bg-black/30 px-1 py-0.5 text-purple-200">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="my-2 overflow-x-auto rounded-lg bg-black/30 p-3 text-xs">
                            {children}
                          </pre>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-300 underline hover:text-purple-200"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="my-2 border-l-2 border-purple-400 pl-3 text-gray-300">
                            {children}
                          </blockquote>
                        ),
                        hr: () => (
                          <hr className="my-3 border-white/10" />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
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
                    disabled={loading}
                    className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-200 transition hover:bg-purple-500/20 disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 bg-[#14142c] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#202040] px-3 py-2"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask your career question..."
                aria-label="Ask your career question"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
