"use client";

import { useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://airesume-1-110s.onrender.com/api";

type Analysis = {
  atsScore?: number;
  healthScore?: number;
  interviewReadiness?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  missingKeywords?: string[];
  formattingIssues?: string[];
  sections?: Record<string, boolean>;
};

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setError("");
    setAnalysis(null);

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowed.includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX resume.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
  };

  const analyzeResume = async () => {
    if (!file || loading) return;

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // STEP 1: Upload
      setStage("Uploading your resume...");

      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await fetch(`${API_URL}/resumes/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(
          uploadData.message || "Resume upload failed."
        );
      }

      const resumeId = uploadData.resume?._id;

      if (!resumeId) {
        throw new Error("Resume ID was not returned by the server.");
      }

      // STEP 2: Analyze
      setStage("AI is analyzing your resume...");

      const analyzeResponse = await fetch(
        `${API_URL}/resumes/${resumeId}/analyze`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok || !analyzeData.success) {
        throw new Error(
          analyzeData.message || "Resume analysis failed."
        );
      }

      setAnalysis(analyzeData.analysis);
      setStage("Analysis complete!");
    } catch (err: any) {
      console.error("Resume analysis error:", err);

      setError(
        err?.message ||
          "Something went wrong while analyzing your resume."
      );
      setStage("");
    } finally {
      setLoading(false);
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setAnalysis(null);
    setError("");
    setStage("");
  };

  if (analysis) {
    const score = analysis.atsScore || 0;

    return (
      <main className="min-h-screen bg-[#0b0b1e] px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
                ResumeIQ Intelligence
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Resume Analysis Report
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                {file?.name}
              </p>
            </div>

            <button
              onClick={resetAnalyzer}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium transition hover:bg-white/5"
            >
              Analyze Another Resume
            </button>
          </div>

          {/* Score */}
          <div className="grid gap-5 md:grid-cols-4">
            <ScoreCard
              title="ATS Score"
              value={analysis.atsScore || 0}
              icon="🎯"
              highlight
            />

            <ScoreCard
              title="Resume Health"
              value={analysis.healthScore || 0}
              icon="❤️"
            />

            <ScoreCard
              title="Interview Ready"
              value={analysis.interviewReadiness || 0}
              icon="💼"
            />

            <div className="rounded-2xl border border-white/10 bg-[#14142d] p-6">
              <div className="text-3xl">📄</div>
              <p className="mt-4 text-sm text-gray-400">
                Resume analyzed
              </p>
              <p className="mt-1 font-semibold text-green-400">
                Successfully
              </p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <ResultCard
              title="What you're doing well"
              icon="✅"
              items={analysis.strengths}
              emptyText="No strengths returned."
            />

            {/* Weaknesses */}
            <ResultCard
              title="Areas to improve"
              icon="⚠️"
              items={analysis.weaknesses}
              emptyText="No major weaknesses returned."
            />

            {/* Improvements */}
            <ResultCard
              title="AI Recommendations"
              icon="💡"
              items={analysis.improvements}
              emptyText="No recommendations returned."
            />

            {/* Keywords */}
            <ResultCard
              title="Missing Keywords"
              icon="🔑"
              items={analysis.missingKeywords}
              emptyText="No missing keywords detected."
            />
          </div>

          {/* Formatting */}
          {analysis.formattingIssues &&
            analysis.formattingIssues.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-400/20 bg-[#14142d] p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <span>🎨</span>
                  Formatting Issues
                </h2>

                <div className="mt-4 space-y-3">
                  {analysis.formattingIssues.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-gray-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Sections */}
          {analysis.sections && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#14142d] p-6">
              <h2 className="text-lg font-semibold">
                Resume Sections
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(analysis.sections).map(
                  ([section, exists]) => (
                    <div
                      key={section}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                      <span className="text-sm capitalize text-gray-300">
                        {section.replace(/([A-Z])/g, " $1")}
                      </span>

                      <span
                        className={
                          exists
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {exists ? "✓" : "✕"}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="mt-8 rounded-2xl border border-purple-400/20 bg-gradient-to-r from-violet-600/10 to-purple-600/10 p-6 text-center">
            <h2 className="text-xl font-bold">
              Want to improve your score?
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Use the recommendations above to make your resume more
              ATS-friendly.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b1e] px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-purple-400/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
            ✨ AI-Powered Resume Analysis
          </div>

          <h1 className="text-4xl font-bold md:text-5xl">
            Analyze Your Resume
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Upload your resume and get your ATS score, resume health,
            missing keywords and AI-powered improvement suggestions.
          </p>
        </div>

        {/* Upload Card */}
        <div className="mx-auto max-w-3xl">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!loading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);

              if (!loading) {
                handleFile(e.dataTransfer.files?.[0]);
              }
            }}
            className={`rounded-3xl border-2 border-dashed p-8 text-center transition md:p-12 ${
              dragging
                ? "border-purple-400 bg-purple-500/10"
                : "border-white/10 bg-[#14142d] hover:border-purple-400/40"
            }`}
          >
            <input
              id="resume"
              type="file"
              accept=".pdf,.docx"
              className="hidden"
              disabled={loading}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            {!file ? (
              <>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/10 text-4xl">
                  📄
                </div>

                <h2 className="text-xl font-semibold">
                  Upload your resume
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Drag & drop your resume here or choose a file
                </p>

                <label
                  htmlFor="resume"
                  className="mt-6 inline-flex cursor-pointer rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-7 py-3 font-semibold transition hover:scale-105"
                >
                  📤 Choose Resume
                </label>

                <p className="mt-4 text-xs text-gray-500">
                  PDF or DOCX • Maximum 10MB
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500/10 text-4xl">
                  📄
                </div>

                <h2 className="text-xl font-semibold">
                  Resume Selected
                </h2>

                <p className="mt-2 break-all text-purple-300">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                {!loading && (
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      onClick={() => setFile(null)}
                      className="rounded-xl border border-white/10 px-5 py-3 text-sm transition hover:bg-white/5"
                    >
                      Change
                    </button>

                    <button
                      onClick={analyzeResume}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold shadow-lg shadow-purple-900/20 transition hover:scale-105"
                    >
                      ✨ Analyze Resume
                    </button>
                  </div>
                )}

                {loading && (
                  <div className="mt-7">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />

                    <p className="mt-4 text-sm font-medium text-purple-300">
                      {stage}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      Please don't close this page.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Feature
            icon="🎯"
            title="ATS Score"
            text="Get a score from 0–100 based on your resume analysis."
          />

          <Feature
            icon="🔑"
            title="Keyword Analysis"
            text="Find important keywords that may be missing from your resume."
          />

          <Feature
            icon="💡"
            title="AI Suggestions"
            text="Get practical recommendations to improve your resume."
          />
        </div>

        {/* Analysis Areas */}
        <section className="mt-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-400">
            Resume Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            What ResumeIQ analyzes
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Contact Information",
              "Professional Summary",
              "Skills",
              "Experience",
              "Education",
              "Projects",
              "Certifications",
              "Keywords",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#14142d] p-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                  ✓
                </span>

                <span className="text-sm text-gray-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ScoreCard({
  title,
  value,
  icon,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-purple-400/30 bg-gradient-to-br from-violet-600/20 to-purple-600/10"
          : "border-white/10 bg-[#14142d]"
      }`}
    >
      <div className="text-3xl">{icon}</div>

      <p className="mt-4 text-sm text-gray-400">{title}</p>

      <div className="mt-1 flex items-end gap-1">
        <span className="text-4xl font-bold">{value}</span>
        <span className="mb-1 text-gray-500">/100</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

function ResultCard({
  title,
  icon,
  items,
  emptyText,
}: {
  title: string;
  icon: string;
  items?: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#14142d] p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <span>{icon}</span>
        {title}
      </h2>

      {items && items.length > 0 ? (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm leading-6 text-gray-300"
            >
              {item}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-500">{emptyText}</p>
      )}
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#14142d] p-6 transition hover:-translate-y-1 hover:border-purple-400/30">
      <div className="mb-4 text-3xl">{icon}</div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-gray-400">
        {text}
      </p>
    </div>
  );
}