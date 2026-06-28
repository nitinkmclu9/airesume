import { Router, Response } from 'express';
import { body } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User';
import ActivityLog from '../models/ActivityLog';
import { generateToken, generateVerificationToken } from '../utils/token';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';
import { protect, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ]),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }

      const verificationToken = generateVerificationToken();
      const user = await User.create({ name, email, password, verificationToken });

      await sendVerificationEmail(email, name, verificationToken);

      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan, isVerified: user.isVerified },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Registration failed', error: (error as Error).message });
    }
  }
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      await ActivityLog.create({
        userId: user._id,
        action: 'login',
        details: 'User logged in',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      const token = generateToken(user);

      res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan, isVerified: user.isVerified, avatar: user.avatar },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Login failed', error: (error as Error).message });
    }
  }
);

router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

router.post('/forgot-password', authLimiter, validate([body('email').isEmail()]), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({ success: true, message: 'If email exists, reset link has been sent' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ success: true, message: 'If email exists, reset link has been sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

router.post(
  '/reset-password/:token',
  validate([body('password').isLength({ min: 6 })]),
  async (req, res) => {
    try {
      const token = typeof req.params.token === 'string' ? req.params.token : req.params.token[0];
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        return;
      }

      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Password reset failed' });
    }
  }
);

router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      isVerified: user.isVerified,
      avatar: user.avatar,
      resumesAnalyzed: user.resumesAnalyzed,
    },
  });
});

router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { name, avatar },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

export default router;
