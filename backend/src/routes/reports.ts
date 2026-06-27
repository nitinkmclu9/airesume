import { Router, Response } from 'express';
import Report from '../models/Report';
import Resume from '../models/Resume';
import { protect, AuthRequest } from '../middleware/auth';
import { generatePDFReport } from '../services/pdf';
import { generateExcelReport } from '../services/excel';

const router = Router();

router.get('/', protect, async (req: AuthRequest, res: Response) => {
  const reports = await Report.find({ userId: req.user!._id }).sort({ createdAt: -1 }).populate('resumeId', 'fileName');
  res.json({ success: true, reports });
});

router.post('/generate', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, type } = req.body;
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user!._id });

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    let reportData: Record<string, unknown> = {};
    let title = 'Resume Report';

    switch (type) {
      case 'ats':
        title = 'ATS Analysis Report';
        reportData = {
          'ATS Score': resume.analysis?.atsScore || 'N/A',
          Strengths: resume.analysis?.strengths || [],
          Weaknesses: resume.analysis?.weaknesses || [],
          Improvements: resume.analysis?.improvements || [],
          'Missing Keywords': resume.analysis?.missingKeywords || [],
        };
        break;
      case 'skill':
        title = 'Skill Gap Report';
        reportData = {
          'Target Role': resume.skills?.targetRole || 'N/A',
          'Current Skills': resume.skills?.current || [],
          'Missing Skills': resume.skills?.missing || [],
          'Recommended Skills': resume.skills?.recommended || [],
        };
        break;
      default:
        title = 'Full Resume Report';
        reportData = {
          'File Name': resume.fileName,
          'ATS Score': resume.analysis?.atsScore || 'N/A',
          'Health Score': resume.analysis?.healthScore || 'N/A',
          'Interview Readiness': resume.analysis?.interviewReadiness || 'N/A',
          Strengths: resume.analysis?.strengths || [],
          Weaknesses: resume.analysis?.weaknesses || [],
          'Current Skills': resume.skills?.current || [],
          'Missing Skills': resume.skills?.missing || [],
        };
    }

    const report = await Report.create({
      userId: req.user!._id,
      resumeId: resume._id,
      type: type || 'full',
      title,
      data: reportData,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Report generation failed' });
  }
});

router.get('/:id/export/pdf', protect, async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }
    generatePDFReport(res, report.title, report.data as Record<string, unknown>);
  } catch (error) {
    res.status(500).json({ success: false, message: 'PDF export failed' });
  }
});

router.get('/:id/export/excel', protect, async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }
    await generateExcelReport(res, report.title, report.data as Record<string, unknown>);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Excel export failed' });
  }
});

export default router;
