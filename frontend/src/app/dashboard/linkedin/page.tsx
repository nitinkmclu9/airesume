'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { resumeAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn, getScoreColor } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function LinkedInPage() {
  const [profileText, setProfileText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    score: number;
    strengths: string[];
    weaknesses: string[];
    headlineSuggestion: string;
    aboutSuggestion: string;
    improvements: string[];
  } | null>(null);

  const analyze = async () => {
    if (!profileText.trim()) {
      toast.error('Please paste your LinkedIn profile content');
      return;
    }
    setLoading(true);
    try {
      const { data } = await resumeAPI.linkedinAnalyze(profileText);
      setAnalysis(data.analysis);
      toast.success('LinkedIn profile analyzed!');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">LinkedIn Profile Analyzer</h2>
        <p className="text-muted-foreground">Optimize your LinkedIn profile for better visibility</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <textarea
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
            placeholder="Paste your LinkedIn headline, about section, experience, and skills here..."
            className="w-full h-40 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button onClick={analyze} disabled={loading} className="mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FaLinkedin className="w-4 h-4" />}
            Analyze Profile
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <>
          <Card>
            <CardContent className="p-6 text-center">
              <div className={cn('text-5xl font-bold mb-2', getScoreColor(analysis.score))}>{analysis.score}%</div>
              <p className="text-muted-foreground">Profile Score</p>
              <Progress value={analysis.score} className="mt-4 max-w-xs mx-auto" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-400" /> Strengths</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{analysis.strengths.map((s, i) => <li key={i} className="text-sm">+ {s}</li>)}</ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="w-5 h-5 text-red-400" /> Weaknesses</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">{analysis.weaknesses.map((w, i) => <li key={i} className="text-sm">- {w}</li>)}</ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Suggested Headline</CardTitle></CardHeader>
              <CardContent><p className="text-sm p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">{analysis.headlineSuggestion}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Suggested About</CardTitle></CardHeader>
              <CardContent><p className="text-sm p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">{analysis.aboutSuggestion}</p></CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
