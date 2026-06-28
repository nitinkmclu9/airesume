import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  type: 'ats' | 'skill' | 'full' | 'interview';
  title: string;
  data: Record<string, unknown>;
  fileUrl?: string;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    type: { type: String, enum: ['ats', 'skill', 'full', 'interview'], required: true },
    title: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', reportSchema);
