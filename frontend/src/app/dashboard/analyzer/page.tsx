'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, Sparkles, Trash2, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeAPI } from '@/lib/api';
import { Resume } from '@/types';
import { toast } from 'sonner';
import { cn, getScoreColor } from '@/lib/utils';

export default function AnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const { data } = await resumeAPI.getAll();
      setResumes(data.resumes);
    } catch {
      toast.error('Failed to load resumes');
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleUpload = async (file: File) => {
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
      toast.error('Only PDF, DOCX, and TXT files are allowed');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await resumeAPI.upload(file, setProgress);
      toast.success('Resume uploaded successfully!');
      await fetchResumes();
      setSelectedResume(data.resume);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async (id: string) => {
    console.log("Analyze ID:", id);
    setAnalyzing(id);
    try {
      const { data } = await resumeAPI.analyze(id);
      toast.success(`Analysis complete! ATS Score: ${data.analysis.atsScore}%`);
      await fetchResumes();
      const { data: resumeData } = await resumeAPI.getOne(id);
      setSelectedResume(resumeData.resume);
    } catch {
      toast.error('Analysis failed');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await resumeAPI.delete(id);
      toast.success('Resume deleted');
      if (selectedResume?._id === id) setSelectedResume(null);
      fetchResumes();
    } catch {
      toast.error('Delete failed');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Resume Analyzer</h2>
        <p className="text-muted-foreground">Upload your resume for AI-powered analysis</p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300',
              dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-indigo-500/50'
            )}
          >
            <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag & drop your resume here</h3>
            <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, TXT (max 10MB)</p>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              <Button asChild disabled={uploading}>
                <span>{uploading ? 'Uploading...' : 'Browse Files'}</span>
              </Button>
            </label>
            {uploading && (
              <div className="mt-4 max-w-xs mx-auto">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground mt-2">{progress}% uploaded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume List */}
        <Card>
          <CardHeader><CardTitle>Your Resumes</CardTitle></CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No resumes uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer',
                      selectedResume?._id === resume._id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    )}
                    onClick={() => setSelectedResume(resume)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-sm font-medium">{resume.fileName}</div>
                        <div className="text-xs text-muted-foreground">
                          {resume.analysis ? (
                            <span className={getScoreColor(resume.analysis.atsScore)}>ATS: {resume.analysis.atsScore}%</span>
                          ) : 'Not analyzed'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!resume.analysis && (
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAnalyze(resume._id); }} disabled={analyzing === resume._id}>
                          {analyzing === resume._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedResume(resume); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(resume._id); }}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview / Analysis */}
        <Card>
          <CardHeader><CardTitle>Resume Details</CardTitle></CardHeader>
          <CardContent>
            {selectedResume ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="text-sm font-medium mb-1">{selectedResume.fileName}</div>
                  <div className="text-xs text-muted-foreground">
                    {(selectedResume.fileSize / 1024).toFixed(1)} KB • {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {selectedResume.summary && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{selectedResume.summary}</p>
                  </div>
                )}

                {selectedResume.analysis ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'ATS', value: selectedResume.analysis.atsScore },
                        { label: 'Health', value: selectedResume.analysis.healthScore },
                        { label: 'Interview', value: selectedResume.analysis.interviewReadiness },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-white/5">
                          <div className={cn('text-xl font-bold', getScoreColor(s.value))}>{s.value}%</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {selectedResume.analysis.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-emerald-400">+ {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {selectedResume.analysis.weaknesses.map((w, i) => (
                          <li key={i} className="text-sm text-amber-400">- {w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => handleAnalyze(selectedResume._id)} disabled={analyzing === selectedResume._id} className="w-full">
                    {analyzing === selectedResume._id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Analyze with AI</>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a resume to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
