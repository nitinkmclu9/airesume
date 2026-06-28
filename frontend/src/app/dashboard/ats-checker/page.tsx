'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeAPI } from '@/lib/api';
import { Resume } from '@/types';
import { cn, getScoreColor } from '@/lib/utils';
import { toast } from 'sonner';

export default function ATSCheckerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]._id);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      resumeAPI.getOne(selected).then(({ data }) => setResume(data.resume));
    }
  }, [selected]);

  const runAnalysis = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await resumeAPI.analyze(selected);
      const { data } = await resumeAPI.getOne(selected);
      setResume(data.resume);
      toast.success('ATS analysis complete!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const analysis = resume?.analysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">ATS Checker</h2>
          <p className="text-muted-foreground">Check how well your resume passes Applicant Tracking Systems</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm"
          >
            {resumes.map((r) => (
              <option key={r._id} value={r._id}>{r.fileName}</option>
            ))}
          </select>
          <Button onClick={runAnalysis} disabled={loading || !selected}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
            Run Check
          </Button>
        </div>
      </div>

      {analysis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'ATS Score', value: analysis.atsScore, icon: BadgeCheck },
              { label: 'Health Score', value: analysis.healthScore, icon: CheckCircle },
              { label: 'Interview Ready', value: analysis.interviewReadiness, icon: AlertTriangle },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-6 text-center">
                  <item.icon className={cn('w-8 h-8 mx-auto mb-3', getScoreColor(item.value))} />
                  <div className={cn('text-4xl font-bold mb-2', getScoreColor(item.value))}>{item.value}%</div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <Progress value={item.value} className="mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Strengths</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{s}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Weaknesses</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />{w}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Missing Keywords</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">{kw}</span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Formatting Issues</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.formattingIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{issue}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BadgeCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{resumes.length === 0 ? 'Upload a resume first' : 'Run ATS check to see results'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
