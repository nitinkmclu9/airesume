import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  cloudinaryId: string;
  extractedText?: string;
  summary?: string;
  analysis?: {
    atsScore: number;
    healthScore: number;
    interviewReadiness: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    missingKeywords: string[];
    formattingIssues: string[];
    sections: Record<string, unknown>;
  };
  skills?: {
    current: string[];
    missing: string[];
    recommended: string[];
    targetRole?: string;
  };
  optimization?: {
    summary: string;
    experience: string[];
    skills: string[];
    keywords: string[];
  };
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    cloudinaryId: { type: String, required: true },
    extractedText: { type: String },
    summary: { type: String },
    analysis: {
      atsScore: Number,
      healthScore: Number,
      interviewReadiness: Number,
      strengths: [String],
      weaknesses: [String],
      improvements: [String],
      missingKeywords: [String],
      formattingIssues: [String],
      sections: Schema.Types.Mixed,
    },
    skills: {
      current: [String],
      missing: [String],
      recommended: [String],
      targetRole: String,
    },
    optimization: {
      summary: String,
      experience: [String],
      skills: [String],
      keywords: [String],
    },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IResume>('Resume', resumeSchema);
