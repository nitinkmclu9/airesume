import { Router, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import Resume from '../models/Resume';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { protect, AuthRequest } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';
import {
  analyzeResume,
  analyzeSkillGap,
  optimizeResume,
  generateInterviewQuestions,
  matchJobs,
  generateCoverLetter,
  analyzeLinkedIn,
} from '../services/openai';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  },
});

const uploadToCloudinary = (buffer: Buffer, fileName: string): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      resolve({ url: `local://${fileName}`, publicId: `local-${Date.now()}` });
      return;
    }
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'resumeiq/resumes' },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result!.secure_url, publicId: result!.public_id });
      }
    );
    stream.end(buffer);
  });
};

const extractText = async (
  buffer: Buffer,
  mimetype: string
): Promise<string> => {
  try {
    // PDF
    if (mimetype === 'application/pdf') {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
      });

      const pdf = await loadingTask.promise;

      let fullText = '';

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const content = await page.getTextContent();

        const pageText = content.items
          .map((item: any) => item.str || '')
          .join(' ');

        fullText += pageText + '\n';
      }

      const text = fullText
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`📄 PDF pages: ${pdf.numPages}`);
      console.log(`📄 PDF text extracted: ${text.length} characters`);

      if (!text) {
        throw new Error(
          'This PDF is scanned/image based and contains no selectable text.'
        );
      }

      return text.substring(0, 15000);
    }

    // DOCX
    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = require('mammoth');

      const data = await mammoth.extractRawText({ buffer });

      const text = (data.value || '')
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`📄 DOCX text extracted: ${text.length} characters`);

      if (!text) {
        throw new Error('DOCX contains no extractable text.');
      }

      return text.substring(0, 15000);
    }

    // TXT
    if (mimetype === 'text/plain') {
      const text = buffer
        .toString('utf-8')
        .replace(/\s+/g, ' ')
        .trim();

      console.log(`📄 TXT text extracted: ${text.length} characters`);

      if (!text) {
        throw new Error('TXT file is empty.');
      }

      return text.substring(0, 15000);
    }

    throw new Error('Unsupported file type.');
  } catch (error) {
    console.error('❌ Resume text extraction failed:', error);

    throw new Error(
      'Could not extract text from this resume. Please upload a text-based PDF or DOCX file.'
    );
  }
};

router.post('/upload', protect, upload.single('resume'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { url, publicId } = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const extractedText = await extractText(req.file.buffer, req.file.mimetype);

    const resume = await Resume.create({
      userId: req.user!._id,
      fileName: req.file.originalname,
      fileUrl: url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryId: publicId,
      extractedText,
    });

    await ActivityLog.create({
      userId: req.user!._id,
      action: 'resume_upload',
      details: `Uploaded ${req.file.originalname}`,
    });

    res.status(201).json({
      success: true,
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl,
        fileType: resume.fileType,
        fileSize: resume.fileSize,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed', error: (error as Error).message });
  }
});

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  const resumes = await Resume.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  res.json({ success: true, resumes });
});

router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
  if (!resume) {
    res.status(404).json({ success: false, message: 'Resume not found' });
    return;
  }
  res.json({ success: true, resume });
});

router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
  if (!resume) {
    res.status(404).json({ success: false, message: 'Resume not found' });
    return;
  }
  if (process.env.CLOUDINARY_CLOUD_NAME && resume.cloudinaryId.startsWith('resumeiq')) {
    await cloudinary.uploader.destroy(resume.cloudinaryId, { resource_type: 'raw' });
  }
  res.json({ success: true, message: 'Resume deleted' });
});

router.post('/:id/analyze', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const analysis = await analyzeResume(resume.extractedText || '');
    
    resume.analysis = {
      atsScore: analysis.atsScore,
      healthScore: analysis.healthScore,
      interviewReadiness: analysis.interviewReadiness,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      improvements: analysis.improvements,
      missingKeywords: analysis.missingKeywords,
      formattingIssues: analysis.formattingIssues,
      sections: analysis.sections,
    };
    resume.summary = analysis.summary;
    await resume.save();

    await User.findByIdAndUpdate(req.user!._id, { $inc: { resumesAnalyzed: 1 } });

    res.json({ success: true, analysis: resume.analysis, summary: resume.summary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analysis failed', error: (error as Error).message });
  }
});

router.post('/:id/skill-gap', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const targetRole = req.body.targetRole || 'Full Stack Developer';
    const skillGap = await analyzeSkillGap(resume.extractedText || '', targetRole);

    resume.skills = {
      current: skillGap.current,
      missing: skillGap.missing,
      recommended: skillGap.recommended,
      targetRole,
    };
    await resume.save();

    res.json({ success: true, skillGap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Skill gap analysis failed' });
  }
});

router.post('/:id/optimize', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const optimization = await optimizeResume(resume.extractedText || '');
    resume.optimization = optimization;
    await resume.save();

    res.json({ success: true, optimization });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Optimization failed' });
  }
});

router.post('/:id/interview', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const difficulty = req.body.difficulty || 'medium';
    const questions = await generateInterviewQuestions(resume.extractedText || '', difficulty);

    res.json({ success: true, questions, difficulty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Interview generation failed' });
  }
});

router.post('/:id/job-match', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const jobMatches = await matchJobs(resume.extractedText || '');
    res.json({ success: true, jobs: jobMatches.jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Job matching failed' });
  }
});

router.post('/:id/cover-letter', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const { jobTitle, company } = req.body;
    const result = await generateCoverLetter(resume.extractedText || '', jobTitle, company);
    res.json({ success: true, coverLetter: result.coverLetter });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Cover letter generation failed' });
  }
});

router.post('/linkedin/analyze', protect, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { profileText } = req.body;
    const analysis = await analyzeLinkedIn(profileText);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'LinkedIn analysis failed' });
  }
});

router.get('/dashboard/stats', protect, async (req: AuthRequest, res: Response) => {
  const resumes = await Resume.find({ userId: req.user!._id }).sort({ createdAt: -1 });
  const latest = resumes[0];

  const stats = {
    totalResumes: resumes.length,
    atsScore: latest?.analysis?.atsScore || 0,
    healthScore: latest?.analysis?.healthScore || 0,
    interviewReadiness: latest?.analysis?.interviewReadiness || 0,
    missingSkills: latest?.skills?.missing?.length || 0,
    improvements: latest?.analysis?.improvements?.slice(0, 3) || [],
    recentResumes: resumes.slice(0, 5).map((r) => ({
      id: r._id,
      fileName: r.fileName,
      atsScore: r.analysis?.atsScore,
      createdAt: r.createdAt,
    })),
    skillAnalytics: latest?.skills?.current?.map((skill, i) => ({
      skill,
      level: 70 + Math.random() * 25,
    })) || [],
    atsProgress: resumes.filter((r) => r.analysis).map((r) => ({
      date: r.createdAt,
      score: r.analysis?.atsScore,
    })),
  };

  res.json({ success: true, stats });
});

export default router;
