export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  isVerified: boolean;
  avatar?: string;
  resumesAnalyzed?: number;
}

export interface Resume {
  _id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  summary?: string;
  analysis?: Analysis;
  skills?: Skills;
  optimization?: Optimization;
  createdAt: string;
}

export interface Analysis {
  atsScore: number;
  healthScore: number;
  interviewReadiness: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  sections: Record<string, unknown>;
}

export interface Skills {
  current: string[];
  missing: string[];
  recommended: string[];
  targetRole?: string;
}

export interface Optimization {
  summary: string;
  experience: string[];
  skills: string[];
  keywords: string[];
}

export interface DashboardStats {
  totalResumes: number;
  atsScore: number;
  healthScore: number;
  interviewReadiness: number;
  missingSkills: number;
  improvements: string[];
  recentResumes: { id: string; fileName: string; atsScore?: number; createdAt: string }[];
  skillAnalytics: { skill: string; level: number }[];
  atsProgress: { date: string; score: number }[];
}

export interface JobMatch {
  title: string;
  matchPercentage: number;
  salaryRange: string;
  requiredSkills: string[];
  description: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
  explanation: string;
}

export interface Report {
  _id: string;
  title: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  resumeId: { fileName: string };
}
