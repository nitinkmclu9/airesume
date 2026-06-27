'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resumeAPI } from '@/lib/api';
import { Resume, Optimization } from '@/types';
import { toast } from 'sonner';

export default function OptimizePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<Optimization | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    resumeAPI.getAll().then(({ data }) => {
      setResumes(data.resumes);
      if (data.resumes.length > 0) {
        setSelected(data.resumes[0]._id);
        if (data.resumes[0].optimization) setOptimization(data.resumes[0].optimization);
      }
    });
  }, []);

  const optimize = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const { data } = await resumeAPI.optimize(selected);
      setOptimization(data.optimization);
      toast.success('Resume optimized!');
    } catch {
      toast.error('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Resume Optimization</h2>
          <p className="text-muted-foreground">Get AI-powered suggestions to improve your resume</p>
        </div>
        <div className="flex gap-3">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm">
            {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
          </select>
          <Button onClick={optimize} disabled={loading || !selected}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Optimize
          </Button>
        </div>
      </div>

      {optimization ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Improved Summary</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => copyText(optimization.summary, 'summary')}>
                {copied === 'summary' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm p-4 rounded-xl bg-white/5 leading-relaxed">{optimization.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Better Experience Descriptions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {optimization.experience.map((exp, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-white/5">
                  <p className="text-sm flex-1">{exp}</p>
                  <Button size="sm" variant="ghost" onClick={() => copyText(exp, `exp-${i}`)}>
                    {copied === `exp-${i}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Optimized Skills</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {optimization.skills.map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>ATS Keywords</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {optimization.keywords.map((k) => (
                    <span key={k} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">{k}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Select a resume and click Optimize to get AI suggestions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
