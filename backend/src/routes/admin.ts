import { Router, Response } from 'express';
import User from '../models/User';
import Resume from '../models/Resume';
import Report from '../models/Report';
import ActivityLog from '../models/ActivityLog';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(protect, adminOnly);

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  const [totalUsers, totalResumes, totalReports, proUsers] = await Promise.all([
    User.countDocuments(),
    Resume.countDocuments(),
    Report.countDocuments(),
    User.countDocuments({ plan: 'pro' }),
  ]);

  const recentActivity = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('userId', 'name email');

  const monthlyUsers = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalResumes,
      totalReports,
      proUsers,
      freeUsers: totalUsers - proUsers,
      revenue: proUsers * 19,
      recentActivity,
      monthlyUsers,
    },
  });
});

router.get('/users', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  const { role, plan } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role, plan }, { new: true }).select('-password');
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  res.json({ success: true, user });
});

router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }
  await Promise.all([
    Resume.deleteMany({ userId: user._id }),
    Report.deleteMany({ userId: user._id }),
    ActivityLog.deleteMany({ userId: user._id }),
  ]);
  res.json({ success: true, message: 'User deleted' });
});

router.get('/logs', async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    ActivityLog.countDocuments(),
  ]);

  res.json({ success: true, logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

router.get('/analytics', async (_req: AuthRequest, res: Response) => {
  const resumeAnalytics = await Resume.aggregate([
    {
      $group: {
        _id: null,
        avgAtsScore: { $avg: '$analysis.atsScore' },
        avgHealthScore: { $avg: '$analysis.healthScore' },
        totalAnalyzed: { $sum: { $cond: [{ $ifNull: ['$analysis.atsScore', false] }, 1, 0] } },
      },
    },
  ]);

  const planDistribution = await User.aggregate([
    { $group: { _id: '$plan', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    analytics: {
      resume: resumeAnalytics[0] || { avgAtsScore: 0, avgHealthScore: 0, totalAnalyzed: 0 },
      planDistribution,
    },
  });
});

export default router;
