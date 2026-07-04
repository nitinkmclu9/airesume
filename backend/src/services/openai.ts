interface AnalysisResult {
  atsScore: number;
  healthScore: number;
  interviewReadiness: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  sections: Record<string, unknown>;
  summary: string;
}

interface SkillGapResult {
  current: string[];
  missing: string[];
  recommended: string[];
  matchPercentage: number;
  skillLevels: { skill: string; level: number }[];
}

interface OptimizationResult {
  summary: string;
  experience: string[];
  skills: string[];
  keywords: string[];
}

interface JobMatchResult {
  jobs: Array<{
    title: string;
    matchPercentage: number;
    salaryRange: string;
    requiredSkills: string[];
    description: string;
  }>;
}

interface CoverLetterResult {
  coverLetter: string;
}

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const parseJSON = <T>(content: string): T => {
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
};

const generateJSON = async <T>(systemPrompt: string, userContent: string, temperature = 0.3): Promise<T> => {
  if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
    throw new Error('No API key configured');
  }
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
  const payload = { model: 'llama-3.3-70b-versatile', messages, temperature };
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errBody = await response.text();
    console.error(`Groq API error ${response.status}: ${errBody.slice(0, 200)}`);
    throw new Error(`Groq API error: ${response.status}`);
  }
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = data?.choices?.[0]?.message?.content || '{}';
  return parseJSON<T>(text);
};

export const analyzeResume = async (resumeText: string): Promise<AnalysisResult> => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockAnalysis(resumeText);
  }

  try {
    return await generateJSON<AnalysisResult>(
      `You are an expert ATS resume analyzer. Analyze the resume and return JSON with:
      atsScore (0-100), healthScore (0-100), interviewReadiness (0-100),
      strengths (array), weaknesses (array), improvements (array),
      missingKeywords (array), formattingIssues (array),
      sections (object with structure, summary, skills, experience assessments),
      summary (brief resume summary text)`,
      resumeText,
      0.3
    );
  } catch {
    return getMockAnalysis(resumeText);
  }
};

export const analyzeSkillGap = async (resumeText: string, targetRole: string): Promise<SkillGapResult> => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockSkillGap(targetRole);
  }

  try {
    return await generateJSON<SkillGapResult>(
      `Compare resume against target role "${targetRole}". Return JSON with:
      current (array of skills they have), missing (array of missing skills),
      recommended (array of recommended skills to learn), matchPercentage (0-100),
      skillLevels (array of {skill, level 0-100})`,
      resumeText,
      0.3
    );
  } catch {
    return getMockSkillGap(targetRole);
  }
};

export const optimizeResume = async (resumeText: string): Promise<OptimizationResult> => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockOptimization();
  }

  try {
    return await generateJSON<OptimizationResult>(
      `Optimize this resume for ATS. Return JSON with:
      summary (improved professional summary),
      experience (array of improved bullet points),
      skills (array of optimized skills),
      keywords (array of ATS-friendly keywords)`,
      resumeText,
      0.5
    );
  } catch {
    return getMockOptimization();
  }
};

export const generateInterviewQuestions = async (
  resumeText: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
) => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockInterviewQuestions(difficulty);
  }

  try {
    return await generateJSON(
      `Generate ${count} interview questions based on resume. Difficulty: ${difficulty}.
      Return JSON with: technical (array of {question, answer, explanation}),
      behavioral (array of {question, answer, explanation}),
      hr (array of {question, answer, explanation})`,
      resumeText,
      0.7
    );
  } catch {
    return getMockInterviewQuestions(difficulty);
  }
};

export const matchJobs = async (resumeText: string): Promise<JobMatchResult> => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockJobMatches();
  }

  try {
    return await generateJSON<JobMatchResult>(
      `Suggest suitable job roles based on resume. Return JSON with:
      jobs (array of {title, matchPercentage, salaryRange, requiredSkills (array), description})`,
      resumeText,
      0.5
    );
  } catch {
    return getMockJobMatches();
  }
};

export const generateCoverLetter = async (resumeText: string, jobTitle: string, company: string): Promise<CoverLetterResult> => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return { coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}...\n\nSincerely,\n[Your Name]` };
  }

  try {
    return await generateJSON<CoverLetterResult>(
      'Generate a professional cover letter. Return JSON with coverLetter field.',
      `Resume:\n${resumeText}\n\nJob: ${jobTitle} at ${company}`,
      0.6
    );
  } catch {
    return { coverLetter: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}...\n\nSincerely,\n[Your Name]` };
  }
};

export const analyzeLinkedIn = async (profileText: string) => {
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return getMockLinkedInAnalysis();
  }

  try {
    return await generateJSON(
      `Analyze LinkedIn profile. Return JSON with:
      score (0-100), strengths (array), weaknesses (array),
      headlineSuggestion, aboutSuggestion, improvements (array)`,
      profileText,
      0.4
    );
  } catch {
    return getMockLinkedInAnalysis();
  }
};

function getMockAnalysis(resumeText: string) {
  const wordCount = resumeText.split(/\s+/).length;
  const baseScore = Math.min(85, 50 + Math.floor(wordCount / 10));
  return {
    atsScore: baseScore,
    healthScore: baseScore - 5,
    interviewReadiness: baseScore - 10,
    strengths: ['Clear work experience section', 'Relevant technical skills listed', 'Professional formatting'],
    weaknesses: ['Missing quantifiable achievements', 'Summary could be stronger', 'Limited keywords for ATS'],
    improvements: ['Add metrics to achievements', 'Include industry-specific keywords', 'Expand skills section'],
    missingKeywords: ['Agile', 'CI/CD', 'REST API', 'Microservices'],
    formattingIssues: ['Inconsistent date formatting', 'Missing contact LinkedIn URL'],
    sections: { structure: 'Good', summary: 'Needs improvement', skills: 'Adequate', experience: 'Strong' },
    summary: 'Experienced professional with relevant skills and work history.',
  };
}

function getMockSkillGap(targetRole: string) {
  const roleSkills: Record<string, string[]> = {
    'Frontend Developer': ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
    'Backend Developer': ['Node.js', 'Python', 'SQL', 'REST APIs', 'Docker'],
    'Full Stack Developer': ['React', 'Node.js', 'MongoDB', 'TypeScript', 'AWS'],
    'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
  };
  const skills = roleSkills[targetRole] || roleSkills['Full Stack Developer'];
  return {
    current: skills.slice(0, 3),
    missing: skills.slice(3),
    recommended: [...skills.slice(3), 'Git', 'Testing'],
    matchPercentage: 65,
    skillLevels: skills.map((s, i) => ({ skill: s, level: 90 - i * 15 })),
  };
}

function getMockOptimization() {
  return {
    summary: 'Results-driven software engineer with 3+ years of experience building scalable web applications. Proven track record of delivering high-impact features using modern technologies.',
    experience: [
      'Led development of customer-facing dashboard serving 10K+ daily users, improving engagement by 35%',
      'Architected RESTful microservices reducing API response time by 40%',
      'Mentored 3 junior developers and established code review best practices',
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Git'],
    keywords: ['Full Stack Development', 'Agile Methodology', 'CI/CD', 'REST APIs', 'Microservices'],
  };
}

function getMockInterviewQuestions(difficulty: string) {
  const q = (question: string, answer: string) => ({ question, answer, explanation: 'Focus on specific examples from your experience.' });
  return {
    technical: [
      q('Explain the difference between let, const, and var in JavaScript.', 'let and const are block-scoped, var is function-scoped...'),
      q('What is the virtual DOM in React?', 'The virtual DOM is a lightweight copy of the actual DOM...'),
    ],
    behavioral: [
      q('Tell me about a challenging project you worked on.', 'Use the STAR method to structure your answer...'),
      q('Describe a time you had to learn a new technology quickly.', 'Highlight your adaptability and learning process...'),
    ],
    hr: [
      q('Why do you want to work at our company?', 'Research the company and align your goals...'),
      q('Where do you see yourself in 5 years?', 'Show ambition while staying realistic...'),
    ],
    difficulty,
  };
}

function getMockJobMatches() {
  return {
    jobs: [
      { title: 'Full Stack Developer', matchPercentage: 85, salaryRange: '$80K - $120K', requiredSkills: ['React', 'Node.js', 'MongoDB'], description: 'Build and maintain web applications' },
      { title: 'Frontend Developer', matchPercentage: 78, salaryRange: '$70K - $110K', requiredSkills: ['React', 'TypeScript', 'CSS'], description: 'Create responsive user interfaces' },
      { title: 'Software Engineer', matchPercentage: 72, salaryRange: '$75K - $115K', requiredSkills: ['JavaScript', 'Python', 'SQL'], description: 'Design and implement software solutions' },
    ],
  };
}

function getMockLinkedInAnalysis() {
  return {
    score: 72,
    strengths: ['Complete work history', 'Professional photo', 'Relevant skills listed'],
    weaknesses: ['Headline lacks keywords', 'About section too short', 'No featured content'],
    headlineSuggestion: 'Full Stack Developer | React & Node.js | Building Scalable Web Apps',
    aboutSuggestion: 'Passionate software engineer with expertise in modern web technologies...',
    improvements: ['Add portfolio projects', 'Get recommendations', 'Engage with industry content'],
  };
}
